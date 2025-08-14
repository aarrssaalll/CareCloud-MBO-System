-- =====================================================
-- CareCloud MBO System - Add Tables to Existing Database
-- =====================================================
-- Run this script in your existing SQL Server database
-- to add MBO tables with 'mbo_' prefix to avoid conflicts

USE [ds_test]; -- Your actual database name
GO

-- Create MBO Users Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='mbo_users' AND xtype='U')
CREATE TABLE mbo_users (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'HR', 'SENIOR_MANAGEMENT')),
    createdAt DATETIME2 DEFAULT GETDATE(),
    updatedAt DATETIME2 DEFAULT GETDATE()
);

-- Create MBO Objectives Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='mbo_objectives' AND xtype='U')
CREATE TABLE mbo_objectives (
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
    FOREIGN KEY (userId) REFERENCES mbo_users(id) ON DELETE CASCADE
);

-- Create MBO Reviews Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='mbo_reviews' AND xtype='U')
CREATE TABLE mbo_reviews (
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
    FOREIGN KEY (employeeId) REFERENCES mbo_users(id) ON DELETE CASCADE
);

-- Create MBO Bonuses Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='mbo_bonuses' AND xtype='U')
CREATE TABLE mbo_bonuses (
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
    FOREIGN KEY (employeeId) REFERENCES mbo_users(id) ON DELETE CASCADE
);

-- Create MBO Objective Reviews Table
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='mbo_objective_reviews' AND xtype='U')
CREATE TABLE mbo_objective_reviews (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    score FLOAT NOT NULL,
    comments NVARCHAR(MAX),
    reviewDate DATETIME2 DEFAULT GETDATE(),
    objectiveId NVARCHAR(36) NOT NULL,
    reviewerId NVARCHAR(36) NOT NULL,
    FOREIGN KEY (objectiveId) REFERENCES mbo_objectives(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewerId) REFERENCES mbo_users(id)
);

-- Create Indexes for better performance
CREATE INDEX IX_mbo_objectives_userId ON mbo_objectives(userId);
CREATE INDEX IX_mbo_reviews_employeeId ON mbo_reviews(employeeId);
CREATE INDEX IX_mbo_bonuses_employeeId ON mbo_bonuses(employeeId);
CREATE INDEX IX_mbo_objective_reviews_objectiveId ON mbo_objective_reviews(objectiveId);
CREATE INDEX IX_mbo_objective_reviews_reviewerId ON mbo_objective_reviews(reviewerId);

-- Insert Sample Data
INSERT INTO mbo_users (id, email, name, role) VALUES 
('user1', 'john.doe@carecloud.com', 'John Doe', 'EMPLOYEE'),
('user2', 'jane.smith@carecloud.com', 'Jane Smith', 'MANAGER'),
('user3', 'hr.admin@carecloud.com', 'HR Admin', 'HR');

INSERT INTO mbo_objectives (id, title, description, category, target, current, dueDate, quarter, year, userId) VALUES 
('obj1', 'Q4 Revenue Target', 'Achieve 15% increase in quarterly revenue', 'Revenue', 115, 98, '2024-12-31', 'Q4', 2024, 'user1'),
('obj2', 'Customer Satisfaction', 'Maintain NPS score above 85', 'Quality', 85, 88, '2024-12-15', 'Q4', 2024, 'user1'),
('obj3', 'Team Leadership', 'Successfully lead 3 major projects', 'Leadership', 3, 2, '2024-11-30', 'Q4', 2024, 'user2');

PRINT 'MBO tables created successfully in your existing database!';
PRINT 'Tables created:';
PRINT '- mbo_users';
PRINT '- mbo_objectives'; 
PRINT '- mbo_reviews';
PRINT '- mbo_bonuses';
PRINT '- mbo_objective_reviews';
PRINT '';
PRINT 'Sample data inserted for testing.';
PRINT 'You can now connect your Next.js application to this database.';
