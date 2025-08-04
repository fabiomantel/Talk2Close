# Database Visualization Guide - Hebrew Sales Call Analysis System

## 🗄️ Ways to View Your Local Database

---

## 1. **Prisma Studio (Recommended - Web GUI)**

### Start Prisma Studio
```bash
npm run db:studio
```

### Access URL
**http://localhost:5555**

### Features
- ✅ Beautiful web interface
- ✅ Browse all tables visually
- ✅ View, edit, and delete records
- ✅ Filter and search data
- ✅ See relationships between tables
- ✅ Export data
- ✅ Real-time updates

---

## 2. **PostgreSQL Command Line (psql)**

### Connect to Database
```bash
psql -d hebrew_sales_analysis
```

### Useful Commands Inside psql
```sql
-- List all tables
\dt

-- Describe table structure
\d customers
\d sales_calls
\d customer_priorities

-- View all data in a table
SELECT * FROM customers;
SELECT * FROM sales_calls;

-- View specific columns
SELECT id, name, phone FROM customers;

-- View Hebrew text properly
SELECT id, name, transcript FROM sales_calls;

-- Count records
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM sales_calls;

-- Exit psql
\q
```

### Quick Commands (without entering psql)
```bash
# List tables
psql -d hebrew_sales_analysis -c "\dt"

# View customers
psql -d hebrew_sales_analysis -c "SELECT * FROM customers;"

# View sales calls with transcript preview
psql -d hebrew_sales_analysis -c "SELECT id, customer_id, LEFT(transcript, 100) as preview FROM sales_calls;"
```

---

## 3. **Database GUI Applications**

### **pgAdmin (Free)**
- Download: https://www.pgadmin.org/
- Connect to: `localhost:5432`
- Database: `hebrew_sales_analysis`
- Username: `fabio.mantelmacher`

### **DBeaver (Free)**
- Download: https://dbeaver.io/
- Universal database tool
- Great for multiple database types

### **TablePlus (Paid)**
- Download: https://tableplus.com/
- Beautiful native interface
- Excellent for macOS

---

## 4. **Current Database Content**

### **Tables Created**
1. **customers** - Customer information
2. **sales_calls** - Sales call records with transcripts
3. **customer_priorities** - Aggregated customer priorities
4. **_prisma_migrations** - Migration tracking

### **Sample Data from Testing**

#### Customers Table
```sql
id |   name    |    phone    |          email           |       created_at        
----+-----------+-------------+--------------------------+-------------------------
  1 | ישראל כהן | 050-1234567 | israel.cohen@example.com | 2025-08-04 10:34:41.806
```

#### Sales Calls Table
```sql
id | customer_id | audio_file_path | transcript | urgency_score | budget_score | interest_score | engagement_score | overall_score | created_at
----+-------------+-----------------+------------+---------------+--------------+----------------+------------------+---------------+------------
  1 |           1 | uploads/...mp3  | שלום, מדבר אידאו מנוף חדש נדלן... | null | null | null | null | null | 2025-08-04 10:34:41.811
```

---

## 5. **Useful SQL Queries**

### **View All Data**
```sql
-- All customers with their sales calls
SELECT 
    c.name,
    c.phone,
    c.email,
    sc.id as call_id,
    sc.transcript,
    sc.created_at as call_date
FROM customers c
LEFT JOIN sales_calls sc ON c.id = sc.customer_id
ORDER BY sc.created_at DESC;
```

### **View Hebrew Transcripts**
```sql
-- Full Hebrew transcripts
SELECT 
    c.name,
    sc.transcript,
    sc.created_at
FROM sales_calls sc
JOIN customers c ON sc.customer_id = c.id
WHERE sc.transcript IS NOT NULL;
```

### **Statistics**
```sql
-- System statistics
SELECT 
    COUNT(*) as total_customers,
    (SELECT COUNT(*) FROM sales_calls) as total_calls,
    (SELECT COUNT(*) FROM sales_calls WHERE transcript IS NOT NULL) as transcribed_calls,
    (SELECT COUNT(*) FROM sales_calls WHERE overall_score IS NOT NULL) as scored_calls
FROM customers;
```

---

## 6. **Database Connection Details**

### **Connection Information**
- **Host**: localhost
- **Port**: 5432
- **Database**: hebrew_sales_analysis
- **Username**: fabio.mantelmacher
- **Password**: (none for local setup)

### **Connection String**
```
postgresql://fabio.mantelmacher@localhost:5432/hebrew_sales_analysis
```

---

## 7. **Quick Database Commands**

### **Start Prisma Studio**
```bash
npm run db:studio
```

### **Connect via psql**
```bash
psql -d hebrew_sales_analysis
```

### **View Tables**
```bash
psql -d hebrew_sales_analysis -c "\dt"
```

### **View Customers**
```bash
psql -d hebrew_sales_analysis -c "SELECT * FROM customers;"
```

### **View Sales Calls**
```bash
psql -d hebrew_sales_analysis -c "SELECT id, customer_id, LEFT(transcript, 50) as preview FROM sales_calls;"
```

---

## 8. **Troubleshooting**

### **If Prisma Studio doesn't start**
```bash
# Check if port 5555 is available
lsof -i :5555

# Kill process if needed
kill -9 <PID>

# Restart Prisma Studio
npm run db:studio
```

### **If psql connection fails**
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if needed
brew services start postgresql@14
```

### **Reset Database (WARNING: Deletes all data)**
```bash
npx prisma migrate reset
```

---

## 🎯 **Recommended Approach**

1. **For daily use**: Prisma Studio (http://localhost:5555)
2. **For quick queries**: psql command line
3. **For advanced analysis**: pgAdmin or DBeaver

**Start with Prisma Studio** - it's the easiest way to explore your data visually!

---

**Database Status**: ✅ **Operational**  
**Data Available**: ✅ **Hebrew customer and transcript data**  
**Ready for Exploration**: ✅ **YES** 