# CareCloud MBO System - Database Setup Guide

## 🗄️ **Database Integration with Microsoft SQL Server**

### **Option 1: Microsoft SQL Server with Prisma (Recommended)**

#### **1. Install Dependencies**
```bash
npm install prisma @prisma/client
npm install -D prisma
```

#### **2. Initialize Prisma**
```bash
npx prisma init
```

#### **3. Database Schema (`prisma/schema.prisma`)**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  role      Role
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  objectives Objective[]
  reviews    Review[]
  bonuses    Bonus[]
  
  @@map("users")
}

model Objective {
  id          String        @id @default(cuid())
  title       String
  description String
  category    String
  target      Float
  current     Float
  weight      Float         @default(1.0)
  status      ObjectiveStatus @default(ACTIVE)
  dueDate     DateTime
  quarter     String
  year        Int
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  reviews     ObjectiveReview[]
  
  @@map("objectives")
}

model ObjectiveReview {
  id           String   @id @default(cuid())
  score        Float
  comments     String?
  reviewDate   DateTime @default(now())
  
  objectiveId  String
  objective    Objective @relation(fields: [objectiveId], references: [id], onDelete: Cascade)
  
  reviewerId   String
  reviewer     User     @relation(fields: [reviewerId], references: [id])
  
  @@map("objective_reviews")
}

model Review {
  id              String      @id @default(cuid())
  quarter         String
  year            Int
  overallScore    Float
  comments        String?
  status          ReviewStatus @default(DRAFT)
  submittedAt     DateTime?
  approvedAt      DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  employeeId      String
  employee        User        @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@map("reviews")
}

model Bonus {
  id            String   @id @default(cuid())
  quarter       String
  year          Int
  baseAmount    Float
  performanceMultiplier Float
  finalAmount   Float
  status        BonusStatus @default(CALCULATED)
  calculatedAt  DateTime @default(now())
  paidAt        DateTime?
  
  employeeId    String
  employee      User     @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  
  @@map("bonuses")
}

enum Role {
  EMPLOYEE
  MANAGER
  HR
  SENIOR_MANAGEMENT
}

enum ObjectiveStatus {
  ACTIVE
  COMPLETED
  ON_HOLD
  CANCELLED
}

enum ReviewStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
}

enum BonusStatus {
  CALCULATED
  APPROVED
  PAID
  REJECTED
}
```

#### **4. Environment Variables (`.env`)**
```env
# Microsoft SQL Server Database
DATABASE_URL="sqlserver://localhost:1433;database=CareCloudMBO;user=your_username;password=your_password;encrypt=true;trustServerCertificate=true"

# Alternative format for SQL Server
# DATABASE_URL="sqlserver://your_server:1433;database=CareCloudMBO;user=your_username;password=your_password;integratedSecurity=true;encrypt=true;trustServerCertificate=true"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: AI Integration
OPENAI_API_KEY="your-openai-api-key"
```

#### **5. SQL Server Connection Examples**

**For Windows Authentication:**
```env
DATABASE_URL="sqlserver://your_server_name:1433;database=CareCloudMBO;integratedSecurity=true;encrypt=true;trustServerCertificate=true"
```

**For SQL Server Authentication:**
```env
DATABASE_URL="sqlserver://your_server_name:1433;database=CareCloudMBO;user=sa;password=your_password;encrypt=true;trustServerCertificate=true"
```

**For Azure SQL Database:**
```env
DATABASE_URL="sqlserver://your_server.database.windows.net:1433;database=CareCloudMBO;user=your_username@your_server;password=your_password;encrypt=true"
```

#### **5. Database Client Setup (`lib/db.ts`)**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### **6. API Routes Examples**

**`app/api/objectives/route.ts`**
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const objectives = await prisma.objective.findMany({
      where: { userId },
      include: {
        reviews: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ objectives })
  } catch (error) {
    console.error('Error fetching objectives:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, category, target, dueDate, userId } = body

    const objective = await prisma.objective.create({
      data: {
        title,
        description,
        category,
        target: parseFloat(target),
        current: 0,
        dueDate: new Date(dueDate),
        quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
        year: new Date().getFullYear(),
        userId
      }
    })

    return NextResponse.json({ objective })
  } catch (error) {
    console.error('Error creating objective:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### **Option 2: Supabase (Cloud Database)**

#### **1. Install Supabase**
```bash
npm install @supabase/supabase-js
```

#### **2. Setup Supabase Client (`lib/supabase.ts`)**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

#### **3. Environment Variables**
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### **Option 3: MongoDB with Mongoose**

#### **1. Install Dependencies**
```bash
npm install mongoose
npm install -D @types/mongoose
```

#### **2. Database Models (`models/User.ts`)**
```typescript
import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['employee', 'manager', 'hr', 'senior_management'],
    required: true 
  },
  objectives: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Objective' }],
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }]
}, {
  timestamps: true
})

export default mongoose.models.User || mongoose.model('User', UserSchema)
```

## 🚀 **Quick Start - SQL Server Setup**

### **1. SQL Server Database Setup**

**Create Database and Tables (Run in SQL Server Management Studio or Azure Data Studio):**

```sql
-- Create Database
CREATE DATABASE CareCloudMBO;
GO

USE CareCloudMBO;
GO

-- Create Users Table
CREATE TABLE users (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'HR', 'SENIOR_MANAGEMENT')),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- Create Objectives Table
CREATE TABLE objectives (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    category NVARCHAR(100),
    target FLOAT NOT NULL,
    current FLOAT DEFAULT 0,
    weight FLOAT DEFAULT 1.0,
    status NVARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED')),
    dueDate DATETIME2 NOT NULL,
    quarter NVARCHAR(10) NOT NULL,
    year INT NOT NULL,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    userId NVARCHAR(36) NOT NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Reviews Table
CREATE TABLE reviews (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    quarter NVARCHAR(10) NOT NULL,
    year INT NOT NULL,
    overallScore FLOAT,
    comments NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    submittedAt DATETIME2,
    approvedAt DATETIME2,
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE(),
    employeeId NVARCHAR(36) NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Bonuses Table
CREATE TABLE bonuses (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    quarter NVARCHAR(10) NOT NULL,
    year INT NOT NULL,
    baseAmount FLOAT NOT NULL,
    performanceMultiplier FLOAT NOT NULL,
    finalAmount FLOAT NOT NULL,
    status NVARCHAR(50) DEFAULT 'CALCULATED' CHECK (status IN ('CALCULATED', 'APPROVED', 'PAID', 'REJECTED')),
    calculatedAt DATETIME2 DEFAULT GETDATE(),
    paidAt DATETIME2,
    employeeId NVARCHAR(36) NOT NULL,
    FOREIGN KEY (employeeId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create Objective Reviews Table
CREATE TABLE objective_reviews (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    score FLOAT NOT NULL,
    comments NVARCHAR(MAX),
    reviewDate DATETIME2 DEFAULT GETDATE(),
    objectiveId NVARCHAR(36) NOT NULL,
    reviewerId NVARCHAR(36) NOT NULL,
    FOREIGN KEY (objectiveId) REFERENCES objectives(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewerId) REFERENCES users(id)
);

-- Create Indexes for better performance
CREATE INDEX IX_objectives_userId ON objectives(userId);
CREATE INDEX IX_reviews_employeeId ON reviews(employeeId);
CREATE INDEX IX_bonuses_employeeId ON bonuses(employeeId);
CREATE INDEX IX_objective_reviews_objectiveId ON objective_reviews(objectiveId);
CREATE INDEX IX_objective_reviews_reviewerId ON objective_reviews(reviewerId);

-- Sample Data
INSERT INTO users (id, email, name, role) VALUES 
('user1', 'john.doe@carecloud.com', 'John Doe', 'EMPLOYEE'),
('user2', 'jane.smith@carecloud.com', 'Jane Smith', 'MANAGER'),
('user3', 'hr.admin@carecloud.com', 'HR Admin', 'HR');

INSERT INTO objectives (id, title, description, category, target, current, dueDate, quarter, year, userId) VALUES 
('obj1', 'Q4 Revenue Target', 'Achieve 15% increase in quarterly revenue', 'Revenue', 115, 98, '2024-12-31', 'Q4', 2024, 'user1'),
('obj2', 'Customer Satisfaction', 'Maintain NPS score above 85', 'Quality', 85, 88, '2024-12-15', 'Q4', 2024, 'user1');
```

### **2. Install Prisma and Setup**
```bash
# Install Prisma
npm install prisma @prisma/client

# Initialize Prisma
npx prisma init

# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push
```

### **3. Alternative: Manual Connection Setup**

If you prefer not to use Prisma, you can use direct SQL Server connection:

**Install SQL Server driver:**
```bash
npm install mssql
npm install -D @types/mssql
```

**Database connection (`lib/sqlserver.ts`):**
```typescript
import sql from 'mssql'

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'CareCloudMBO',
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true // Use this if you're on a local dev machine
  }
}

let pool: sql.ConnectionPool | null = null

export async function getConnection() {
  if (!pool) {
    pool = new sql.ConnectionPool(config)
    await pool.connect()
  }
  return pool
}

export { sql }
```

## 📊 **Data Integration in Components**

### **Example: Fetching Objectives**
```typescript
// hooks/useObjectives.ts
import { useState, useEffect } from 'react'

export function useObjectives(userId: string) {
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchObjectives() {
      try {
        const response = await fetch(`/api/objectives?userId=${userId}`)
        const data = await response.json()
        setObjectives(data.objectives)
      } catch (error) {
        console.error('Error fetching objectives:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchObjectives()
    }
  }, [userId])

  return { objectives, loading }
}
```

### **Using in Dashboard:**
```typescript
// In your dashboard component
const { objectives, loading } = useObjectives(user.id)

if (loading) return <div>Loading...</div>

return (
  <div>
    {objectives.map(objective => (
      <ObjectiveCard key={objective.id} objective={objective} />
    ))}
  </div>
)
```

## 🔧 **Next Steps**

1. **Choose your database option** (PostgreSQL recommended)
2. **Set up the database** using the schema provided
3. **Create API routes** for data operations
4. **Update components** to use real data instead of mock data
5. **Add authentication** with NextAuth.js
6. **Implement data validation** with Zod
7. **Add error handling** and loading states

Would you like me to implement any specific part of this database integration?
