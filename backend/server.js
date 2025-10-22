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
  console.log('🔍 Executing SQL:', sql.substring(0, 100) + (sql.length > 100 ? '...' : ''))
  
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
- flow: INTEGER (1 = Export from Israel, 2 = Import to Israel)
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
- Flow 1 = goods Israel SELLS to other countries (exports)
- Flow 2 = goods Israel BUYS from other countries (imports)
- Always JOIN with products table to get readable product names
- Always JOIN with countries table to get readable country names

Use the query_database tool to execute SQL queries.
Always provide clear, natural language explanations of results.`

// Chat endpoint using direct Anthropic SDK with tool calling
app.post('/api/chat', async (req, res) => {
  const { message, conversationHistory = [] } = req.body
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' })
  }
  
  console.log('\n💬 New chat message:', message)
  
  try {
    // Build messages array for conversation
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ]
    
    // First API call - let Claude decide if it needs to query
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: DATABASE_CONTEXT,
      messages: messages,
      tools: [{
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
    })
    
    console.log('🤖 Claude responded with', response.content.length, 'content blocks')
    
    // Check if Claude wants to use the tool
    let toolUse = response.content.find(block => block.type === 'tool_use')
    
    if (toolUse) {
      console.log('🔧 Tool use requested:', toolUse.name)
      console.log('   Reasoning:', toolUse.input.reasoning || 'Not provided')
      
      // Execute the SQL query
      let toolResult
      try {
        const queryResult = await executeQuery(toolUse.input.sql)
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(queryResult, null, 2)
        }
      } catch (error) {
        toolResult = {
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify({ error: error.message }),
          is_error: true
        }
      }
      
      // Send results back to Claude for final response
      messages.push({ role: 'assistant', content: response.content })
      messages.push({ role: 'user', content: [toolResult] })
      
      const finalResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: DATABASE_CONTEXT,
        messages: messages
      })
      
      const answer = finalResponse.content.find(block => block.type === 'text')?.text || 'No response generated'
      console.log('✅ Final answer generated')
      
      return res.json({ answer })
    }
    
    // No tool use needed, just return the text response
    const answer = response.content.find(block => block.type === 'text')?.text || 'No response generated'
    console.log('✅ Direct answer (no tool use)')
    
    res.json({ answer })
    
  } catch (error) {
    console.error('❌ Chat error:', error.message)
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
