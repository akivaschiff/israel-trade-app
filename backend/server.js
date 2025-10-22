import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pkg from 'pg'
import Anthropic from '@anthropic-ai/sdk'

const { Pool } = pkg

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
})

// Test database connection on startup
async function testConnection() {
  try {
    console.log('🔄 Testing database connection...')
    const result = await pool.query('SELECT NOW() as time, version() as pg_version')
    console.log('✅ Database connected successfully')
    console.log(`   PostgreSQL version: ${result.rows[0].pg_version.split(' ')[1]}`)
  } catch (err) {
    console.error('❌ Database connection failed:', err.message)
    console.error('   Check your DATABASE_URL in .env file')
  }
}

testConnection()

// SQL query execution function
async function executeQuery(sql) {
  console.log('🔍 Executing SQL:', sql.substring(0, 150) + (sql.length > 150 ? '...' : ''))
  
  // Validate: Only SELECT queries allowed
  const trimmedSql = sql.trim().toUpperCase()
  if (!trimmedSql.startsWith('SELECT')) {
    throw new Error('Only SELECT queries are allowed. This is a read-only database interface.')
  }
  
  // Block dangerous keywords
  const dangerousKeywords = ['DROP', 'DELETE', 'TRUNCATE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE']
  for (const keyword of dangerousKeywords) {
    if (trimmedSql.includes(keyword)) {
      throw new Error(`Dangerous keyword detected: ${keyword}. Only SELECT queries are allowed.`)
    }
  }
  
  try {
    const result = await pool.query(sql)
    console.log(`✅ Query successful: ${result.rowCount} rows returned`)
    
    // Limit results to prevent overwhelming the context
    const maxRows = 100
    if (result.rowCount > maxRows) {
      console.log(`⚠️  Results truncated to ${maxRows} rows`)
      return {
        rows: result.rows.slice(0, maxRows),
        rowCount: result.rowCount,
        truncated: true,
        message: `Query returned ${result.rowCount} rows, showing first ${maxRows}`
      }
    }
    
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      truncated: false
    }
  } catch (error) {
    console.error('❌ Query failed:', error.message)
    throw new Error(`Query execution failed: ${error.message}`)
  }
}

// Database schema context for the agent
const DATABASE_CONTEXT = `You are a helpful assistant for analyzing Israeli trade data.

DATABASE SCHEMA:

trade_data table:
- reporting_country: VARCHAR (always 'IL' for Israel)
- flow: INTEGER (1 = Import to Israel, 2 = Export from Israel)
- year: INTEGER (2023-2025)
- period: INTEGER (month 1-12)
- partner_country: VARCHAR (ISO alpha-2 code like 'US', 'DE', 'TR')
- product_code: VARCHAR (10-digit HS harmonized system code)
- value: NUMERIC (trade value in USD)

products table:
- hs_code: VARCHAR(20) PRIMARY KEY (harmonized system code)
- description: TEXT (human-readable product name)
- category: VARCHAR(100) (product category)

countries table:
- code: VARCHAR(10) PRIMARY KEY (ISO alpha-2 like 'US', 'DE')
- name: VARCHAR(100) (full country name like 'United States', 'Germany')
- region: VARCHAR(50)

IMPORTANT NOTES:
- Total rows: ~1.5 million trade records
- Date range: January 2023 to October 2025
- All monetary values are in USD
- Flow 1 = goods Israel BUYS from other countries (imports)
- Flow 2 = goods Israel SELLS to other countries (exports)
- Always JOIN with products table to get readable product names
- Always JOIN with countries table to get readable country names

WORKFLOW FOR PRODUCT SEARCHES:
When user asks about a product (like "tomatoes" or "electronics"):
1. ALWAYS start by querying: SELECT hs_code, description FROM products WHERE description ILIKE '%keyword%' LIMIT 20
2. Use ALL the hs_codes found in step 1 (don't filter them out or search for different codes)
3. Query trade_data using those exact hs_codes: WHERE product_code IN ('code1', 'code2', ...)
4. If step 1 found products but step 3 returns no trade data, tell the user "We found these products but they have no trade activity in our date range"
5. Do NOT search for alternative HS code patterns - use what you found in step 1

Use the query_database tool to execute SQL queries.
Always provide clear, natural language explanations of results.`

// Chat endpoint with support for multiple tool calls
app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }
  
  console.log('\n💬 New chat message:', message)
  
  try {
    // Build messages array
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ]
    
    const tools = [{
      name: 'query_database',
      description: 'Execute a read-only SQL query on the Israeli trade database',
      input_schema: {
        type: 'object',
        properties: {
          sql: {
            type: 'string',
            description: 'A SELECT query to execute'
          },
          reasoning: {
            type: 'string',
            description: 'Brief explanation of what this query does'
          }
        },
        required: ['sql']
      }
    }]
    
    let toolCallCount = 0
    const maxIterations = 8 // Allow more iterations for complex queries
    
    // Agentic loop: allow multiple tool calls
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: DATABASE_CONTEXT,
        messages: messages,
        tools: tools
      })
      
      console.log(`🤖 Iteration ${iteration + 1}: Claude responded with ${response.content.length} content blocks`)
      
      // Log text content for debugging
      const textContent = response.content.filter(block => block.type === 'text')
      if (textContent.length > 0) {
        console.log('📝 Claude says:', textContent[0].text.substring(0, 200) + (textContent[0].text.length > 200 ? '...' : ''))
      }
      
      // Check for tool use
      const toolUseBlocks = response.content.filter(block => block.type === 'tool_use')
      
      if (toolUseBlocks.length === 0) {
        // No more tool calls - Claude has the final answer
        const answer = response.content.find(block => block.type === 'text')?.text || 'No response generated'
        console.log(`✅ Final answer generated (${toolCallCount} total tool calls)`)
        return res.json({ answer, toolCalls: toolCallCount })
      }
      
      // Execute all tool calls
      messages.push({ role: 'assistant', content: response.content })
      
      const toolResults = []
      for (const toolUse of toolUseBlocks) {
        toolCallCount++
        console.log(`🔧 Tool call #${toolCallCount}: ${toolUse.name}`)
        console.log(`   Reasoning: ${toolUse.input.reasoning || 'Not provided'}`)
        
        try {
          const queryResult = await executeQuery(toolUse.input.sql)
          const resultSummary = queryResult.truncated 
            ? `Returned ${queryResult.rowCount} rows (showing ${queryResult.rows.length})`
            : `Returned ${queryResult.rowCount} rows`
          console.log(`   Result: ${resultSummary}`)
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(queryResult, null, 2)
          })
        } catch (error) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify({ error: error.message }),
            is_error: true
          })
        }
      }
      
      // Add tool results to conversation
      messages.push({ role: 'user', content: toolResults })
    }
    
    // If we hit max iterations, return what we have
    console.log(`⚠️  Reached max iterations (${maxIterations})`)
    res.json({ 
      answer: 'I apologize, but I reached the maximum number of queries. Please try rephrasing your question.',
      toolCalls: toolCallCount 
    })
    
  } catch (error) {
    console.error('❌ Chat error:', error.message)
    console.error('   Error type:', error.constructor.name)
    if (error.status) {
      console.error('   HTTP Status:', error.status)
    }
    res.status(500).json({ 
      error: 'Failed to process chat message',
      details: error.message 
    })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Database test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) as count FROM trade_data')
    res.json({
      connected: true,
      rowCount: parseInt(result.rows[0].count),
      message: 'Database query successful'
    })
  } catch (error) {
    console.error('Database test error:', error)
    res.status(500).json({
      connected: false,
      error: error.message
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
  console.log(`   DB test: http://localhost:${PORT}/api/db-test`)
  console.log(`   Chat endpoint: http://localhost:${PORT}/api/chat`)
})
