# Check Your Trade Data Structure

Run these queries to understand your data:

## 1. See what columns exist
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trade_data';
```

## 2. See sample data
```sql
SELECT *
FROM trade_data
LIMIT 5;
```

## 3. If flow column exists, what values does it have?
```sql
SELECT DISTINCT flow, COUNT(*) as count
FROM trade_data
GROUP BY flow;
```

## 4. Check total row count
```sql
SELECT COUNT(*) FROM trade_data;
```

Share the results with me so I can update the functions correctly!
