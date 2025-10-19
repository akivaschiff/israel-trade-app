# Debugging Product Origins - Check Data

Run these queries in Supabase SQL Editor to diagnose the issue:

## 1. Check what flow values exist
```sql
SELECT flow, COUNT(*) as count
FROM trade_data
GROUP BY flow;
```

## 2. Check if you have any imports (flow = 2)
```sql
SELECT COUNT(*) as import_count
FROM trade_data
WHERE flow = 2;
```

## 3. If flow = 2 doesn't exist, check what flows you have
```sql
SELECT DISTINCT flow 
FROM trade_data;
```

## 4. See sample data to understand your flows
```sql
SELECT flow, partner_country, product_code, value
FROM trade_data
LIMIT 10;
```

---

## If you only have exports (flow = 1):

We need to modify the function to work with exports instead. Let me know what flow values you see!
