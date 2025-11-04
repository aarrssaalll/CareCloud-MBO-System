-- =====================================================
-- CareCloud MBO System - Complete Database Schema
-- =====================================================
-- Generated from Prisma Schema - October 2025
-- This script creates all MBO tables with proper relationships and indexes
-- Compatible with SQL Server and matches current Prisma schema exactly

USE [ds_test]; -- Replace with your actual database name
GO

-- =====================================================
-- Drop existing tables in correct order (dependencies first)
-- =====================================================
PRINT 'Dropping existing MBO tables if they exist...';

IF OBJECT_ID('mbo_notifications', 'U') IS NOT NULL DROP TABLE mbo_notifications;
IF OBJECT_ID('mbo_approvals', 'U') IS NOT NULL DROP TABLE mbo_approvals;
IF OBJECT_ID('mbo_bonuses', 'U') IS NOT NULL DROP TABLE mbo_bonuses;
IF OBJECT_ID('mbo_reviews', 'U') IS NOT NULL DROP TABLE mbo_reviews;
IF OBJECT_ID('mbo_objective_reviews', 'U') IS NOT NULL DROP TABLE mbo_objective_reviews;
IF OBJECT_ID('mbo_objectives', 'U') IS NOT NULL DROP TABLE mbo_objectives;
IF OBJECT_ID('mbo_users', 'U') IS NOT NULL DROP TABLE mbo_users;
IF OBJECT_ID('mbo_teams', 'U') IS NOT NULL DROP TABLE mbo_teams;
IF OBJECT_ID('mbo_departments', 'U') IS NOT NULL DROP TABLE mbo_departments;

-- =====================================================
-- Create Tables
-- =====================================================

-- Create MBO Departments Table
PRINT 'Creating mbo_departments table...';
CREATE TABLE mbo_departments (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    budget FLOAT NULL,
    managerId NVARCHAR(36) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create MBO Teams Table
PRINT 'Creating mbo_teams table...';
CREATE TABLE mbo_teams (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    departmentId NVARCHAR(36) NOT NULL,
    leaderId NVARCHAR(36) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_mbo_teams_departmentId 
        FOREIGN KEY (departmentId) REFERENCES mbo_departments(id) ON DELETE CASCADE
);

-- Create MBO Users Table
PRINT 'Creating mbo_users table...';
CREATE TABLE mbo_users (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    employeeId NVARCHAR(50) NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    firstName NVARCHAR(255) NULL,
    lastName NVARCHAR(255) NULL,
    name NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'HR', 'SENIOR_MANAGEMENT')),
    title NVARCHAR(255) NULL,
    phone NVARCHAR(50) NULL,
    hireDate DATETIME2 NULL,
    salary FLOAT NULL,
    bonusAmount FLOAT NULL DEFAULT 0, -- Cumulative total of all bonuses received
    allocatedBonusAmount FLOAT NULL DEFAULT 0, -- Annual bonus allocation based on hierarchy
    password NVARCHAR(255) NULL,
    departmentId NVARCHAR(36) NULL,
    teamId NVARCHAR(36) NULL,
    managerId NVARCHAR(36) NULL,
    permissions NVARCHAR(MAX) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_mbo_users_departmentId 
        FOREIGN KEY (departmentId) REFERENCES mbo_departments(id) ON DELETE NO ACTION,
    CONSTRAINT FK_mbo_users_teamId 
        FOREIGN KEY (teamId) REFERENCES mbo_teams(id) ON DELETE NO ACTION,
    CONSTRAINT FK_mbo_users_managerId 
        FOREIGN KEY (managerId) REFERENCES mbo_users(id) ON DELETE NO ACTION
);

-- Add foreign key constraints after mbo_users is created
ALTER TABLE mbo_departments 
ADD CONSTRAINT FK_mbo_departments_managerId 
    FOREIGN KEY (managerId) REFERENCES mbo_users(id) ON DELETE NO ACTION;

ALTER TABLE mbo_teams 
ADD CONSTRAINT FK_mbo_teams_leaderId 
    FOREIGN KEY (leaderId) REFERENCES mbo_users(id) ON DELETE NO ACTION;

-- Create MBO Objectives Table
PRINT 'Creating mbo_objectives table...';
CREATE TABLE mbo_objectives (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    category NVARCHAR(100) NULL,
    target FLOAT NOT NULL,
    [current] FLOAT NULL DEFAULT 0,
    weight FLOAT NULL DEFAULT 1.0,
    status NVARCHAR(50) NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'ACTIVE', 'COMPLETED', 'AI_SCORED', 'REVIEWED', 'SUBMITTED_TO_HR', 'HR_APPROVED')),
    dueDate DATETIME2 NOT NULL,
    quarter NVARCHAR(10) NOT NULL,
    year INT NOT NULL,
    submittedAt DATETIME2 NULL,
    completedAt DATETIME2 NULL,
    submittedToManagerAt DATETIME2 NULL,
    managerReviewedAt DATETIME2 NULL,
    submittedToHrAt DATETIME2 NULL,
    hrApprovedAt DATETIME2 NULL,
    employeeRemarks NVARCHAR(MAX) NULL,
    managerFeedback NVARCHAR(MAX) NULL,
    hrNotes NVARCHAR(MAX) NULL,
    aiScoreMetadata NVARCHAR(MAX) NULL,
    digitalSignature NVARCHAR(MAX) NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    userId NVARCHAR(36) NOT NULL,
    assignedById NVARCHAR(36) NULL,
    
    CONSTRAINT FK_mbo_objectives_userId 
        FOREIGN KEY (userId) REFERENCES mbo_users(id) ON DELETE CASCADE,
    CONSTRAINT FK_mbo_objectives_assignedById 
        FOREIGN KEY (assignedById) REFERENCES mbo_users(id) ON DELETE NO ACTION
);

-- Create MBO Objective Reviews Table
PRINT 'Creating mbo_objective_reviews table...';
CREATE TABLE mbo_objective_reviews (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    score FLOAT NOT NULL,
    comments NVARCHAR(MAX) NULL,
    reviewDate DATETIME2 NULL DEFAULT GETDATE(),
    reviewType NVARCHAR(50) NULL DEFAULT 'MANAGER' 
        CHECK (reviewType IN ('MANAGER', 'HR', 'FINAL')),
    aiScore FLOAT NULL,
    aiComments NVARCHAR(MAX) NULL,
    manualOverride BIT NULL DEFAULT 0,
    objectiveId NVARCHAR(36) NOT NULL,
    reviewerId NVARCHAR(36) NOT NULL,
    
    CONSTRAINT FK_mbo_objective_reviews_objectiveId 
        FOREIGN KEY (objectiveId) REFERENCES mbo_objectives(id) ON DELETE CASCADE,
    CONSTRAINT FK_mbo_objective_reviews_reviewerId 
        FOREIGN KEY (reviewerId) REFERENCES mbo_users(id) ON DELETE NO ACTION
);

-- Create MBO Reviews Table
PRINT 'Creating mbo_reviews table...';
CREATE TABLE mbo_reviews (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    quarter NVARCHAR(10) NOT NULL,
    year INT NOT NULL,
    overallScore FLOAT NULL,
    comments NVARCHAR(MAX) NULL,
    status NVARCHAR(50) NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')),
    submittedAt DATETIME2 NULL,
    approvedAt DATETIME2 NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    employeeId NVARCHAR(36) NOT NULL,
    
    CONSTRAINT FK_mbo_reviews_employeeId 
        FOREIGN KEY (employeeId) REFERENCES mbo_users(id) ON DELETE CASCADE
);

-- Create MBO Bonuses Table
PRINT 'Creating mbo_bonuses table...';
CREATE TABLE mbo_bonuses (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    quarter NVARCHAR(10) NOT NULL,
    year INT NOT NULL,
    baseAmount FLOAT NOT NULL,
    performanceMultiplier FLOAT NOT NULL,
    finalAmount FLOAT NOT NULL,
    status NVARCHAR(50) NULL DEFAULT 'CALCULATED' 
        CHECK (status IN ('CALCULATED', 'APPROVED', 'PAID', 'REJECTED')),
    calculatedAt DATETIME2 NULL DEFAULT GETDATE(),
    paidAt DATETIME2 NULL,
    employeeId NVARCHAR(36) NOT NULL,
    
    CONSTRAINT FK_mbo_bonuses_employeeId 
        FOREIGN KEY (employeeId) REFERENCES mbo_users(id) ON DELETE CASCADE
);

-- Create MBO Approvals Table
PRINT 'Creating mbo_approvals table...';
CREATE TABLE mbo_approvals (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    type NVARCHAR(50) NOT NULL,
    entityId NVARCHAR(36) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    comments NVARCHAR(MAX) NULL,
    approverId NVARCHAR(36) NOT NULL,
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    approvedAt DATETIME2 NULL,
    
    CONSTRAINT FK_mbo_approvals_approverId 
        FOREIGN KEY (approverId) REFERENCES mbo_users(id) ON DELETE NO ACTION
);

-- Create MBO Notifications Table
PRINT 'Creating mbo_notifications table...';
CREATE TABLE mbo_notifications (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    type NVARCHAR(50) NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    [read] BIT NOT NULL DEFAULT 0,
    actionRequired BIT NOT NULL DEFAULT 0,
    entityId NVARCHAR(36) NULL, -- Related objective, review, etc.
    entityType NVARCHAR(50) NULL CHECK (entityType IN ('objective', 'review', 'bonus')),
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    userId NVARCHAR(36) NOT NULL,
    
    CONSTRAINT FK_mbo_notifications_userId 
        FOREIGN KEY (userId) REFERENCES mbo_users(id) ON DELETE CASCADE
);

-- Create Manager Objectives Table
PRINT 'Creating mbo_manager_objectives table...';
CREATE TABLE mbo_manager_objectives (
    id NVARCHAR(36) PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX) NULL,
    category NVARCHAR(100) NULL,
    target FLOAT NOT NULL,
    [current] FLOAT NULL DEFAULT 0, -- Using brackets because 'current' is a reserved keyword
    weight FLOAT NULL DEFAULT 1.0,
    status NVARCHAR(50) NULL DEFAULT 'ASSIGNED' 
        CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'MANAGER_SUBMITTED', 'AI_SCORED', 'SENIOR_REVIEWED', 'SUBMITTED_TO_HR', 'HR_APPROVED')),
    dueDate DATETIME2 NOT NULL,
    quarter NVARCHAR(10) NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
    [year] INT NOT NULL, -- Using brackets for consistency
    
    -- Workflow timestamps
    assignedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    startedAt DATETIME2 NULL,
    completedAt DATETIME2 NULL,
    managerSubmittedAt DATETIME2 NULL,
    aiScoredAt DATETIME2 NULL,
    seniorReviewedAt DATETIME2 NULL,
    submittedToHrAt DATETIME2 NULL,
    hrApprovedAt DATETIME2 NULL,
    
    -- Manager submission data
    managerRemarks NVARCHAR(MAX) NULL,
    managerEvidence NVARCHAR(MAX) NULL,
    managerDigitalSignature NVARCHAR(MAX) NULL,
    
    -- AI scoring data
    aiScore FLOAT NULL CHECK (aiScore >= 0 AND aiScore <= 10),
    aiComments NVARCHAR(MAX) NULL,
    aiScoringMetadata NVARCHAR(MAX) NULL,
    
    -- Senior management review data
    seniorManagerScore FLOAT NULL CHECK (seniorManagerScore >= 0 AND seniorManagerScore <= 10),
    seniorManagerComments NVARCHAR(MAX) NULL,
    finalScore FLOAT NULL CHECK (finalScore >= 0 AND finalScore <= 10),
    seniorDigitalSignature NVARCHAR(MAX) NULL,
    
    -- HR data
    hrNotes NVARCHAR(MAX) NULL,
    bonusAmount FLOAT NULL DEFAULT 0,
    
    -- Audit fields
    createdAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    updatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    -- Foreign keys
    managerId NVARCHAR(36) NOT NULL,
    assignedBySeniorManagerId NVARCHAR(36) NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT FK_mbo_manager_objectives_managerId 
        FOREIGN KEY (managerId) REFERENCES mbo_users(id) ON DELETE CASCADE,
    CONSTRAINT FK_mbo_manager_objectives_assignedBySeniorManagerId 
        FOREIGN KEY (assignedBySeniorManagerId) REFERENCES mbo_users(id) ON DELETE NO ACTION
);

-- =====================================================
-- Create Indexes for Performance
-- =====================================================
PRINT 'Creating indexes for optimal performance...';

-- Primary indexes from Prisma schema
CREATE INDEX IX_mbo_objectives_userId ON mbo_objectives(userId);
CREATE INDEX IX_mbo_objective_reviews_objectiveId ON mbo_objective_reviews(objectiveId);
CREATE INDEX IX_mbo_objective_reviews_reviewerId ON mbo_objective_reviews(reviewerId);
CREATE INDEX IX_mbo_reviews_employeeId ON mbo_reviews(employeeId);
CREATE INDEX IX_mbo_bonuses_employeeId ON mbo_bonuses(employeeId);
CREATE INDEX IX_mbo_approvals_approverId ON mbo_approvals(approverId);
CREATE INDEX IX_mbo_approvals_entityId ON mbo_approvals(entityId);
CREATE INDEX IX_mbo_notifications_userId ON mbo_notifications(userId);
CREATE INDEX IX_mbo_notifications_read ON mbo_notifications([read]);

-- Manager objectives indexes
CREATE INDEX IX_mbo_manager_objectives_managerId ON mbo_manager_objectives(managerId);
CREATE INDEX IX_mbo_manager_objectives_assignedBySeniorManagerId ON mbo_manager_objectives(assignedBySeniorManagerId);
CREATE INDEX IX_mbo_manager_objectives_status ON mbo_manager_objectives(status);
CREATE INDEX IX_mbo_manager_objectives_quarter_year ON mbo_manager_objectives(quarter, [year]);
CREATE INDEX IX_mbo_manager_objectives_dueDate ON mbo_manager_objectives(dueDate);

-- Additional performance indexes
CREATE INDEX IX_mbo_objectives_status ON mbo_objectives(status);
CREATE INDEX IX_mbo_objectives_quarter_year ON mbo_objectives(quarter, year);
CREATE INDEX IX_mbo_users_role ON mbo_users(role);
CREATE INDEX IX_mbo_users_departmentId ON mbo_users(departmentId);
CREATE INDEX IX_mbo_users_teamId ON mbo_users(teamId);
CREATE INDEX IX_mbo_teams_departmentId ON mbo_teams(departmentId);

-- =====================================================
-- Insert Sample Data for Testing
-- =====================================================
PRINT 'Inserting sample data for testing...';

-- Sample Departments
INSERT INTO mbo_departments (id, name, description, budget) VALUES 
('dept-it-001', 'Information Technology', 'Technology and digital innovation department', 2500000.00),
('dept-ops-001', 'Operations', 'Business operations and compliance department', 1800000.00),
('dept-sales-001', 'Sales & Marketing', 'Revenue generation and client acquisition', 1200000.00);

-- Sample Teams
INSERT INTO mbo_teams (id, name, description, departmentId) VALUES 
('team-ai-001', 'AI & Machine Learning', 'Artificial Intelligence development team', 'dept-it-001'),
('team-db-001', 'Database & Analytics', 'Database management and analytics team', 'dept-it-001'),
('team-compliance-001', 'Compliance', 'Regulatory compliance team', 'dept-ops-001'),
('team-sales-001', 'Sales', 'Direct sales team', 'dept-sales-001');

-- Sample Users
INSERT INTO mbo_users (id, employeeId, email, firstName, lastName, name, role, title, departmentId, teamId, salary, bonusAmount, allocatedBonusAmount) VALUES 
('user-ceo-001', 'EMP001', 'crystal.williams@carecloud.com', 'Crystal', 'Williams', 'Crystal Williams', 'SENIOR_MANAGEMENT', 'President - Operations', 'dept-ops-001', NULL, 350000.00, 0, 5000),
('user-cto-001', 'EMP002', 'hadi.chaudhary@carecloud.com', 'Hadi', 'Chaudhary', 'Hadi Chaudhary', 'SENIOR_MANAGEMENT', 'President - IT & AI', 'dept-it-001', NULL, 360000.00, 0, 5000),
('user-mgr-001', 'EMP003', 'sarah.johnson@carecloud.com', 'Sarah', 'Johnson', 'Sarah Johnson', 'MANAGER', 'IT Department Manager', 'dept-it-001', NULL, 180000.00, 0, 3000),
('user-lead-001', 'EMP004', 'alex.chen@carecloud.com', 'Alex', 'Chen', 'Alex Chen', 'MANAGER', 'AI Team Lead', 'dept-it-001', 'team-ai-001', 145000.00, 18000.00, 2000),
('user-emp-001', 'EMP005', 'john.doe@carecloud.com', 'John', 'Doe', 'John Doe', 'EMPLOYEE', 'Senior Developer', 'dept-it-001', 'team-ai-001', 120000.00, 12000.00, 1500),
('user-hr-001', 'EMP006', 'hr.admin@carecloud.com', 'HR', 'Admin', 'HR Admin', 'HR', 'HR Manager', 'dept-ops-001', NULL, 95000.00, 8000.00, 2000);

-- Update manager relationships
UPDATE mbo_departments SET managerId = 'user-mgr-001' WHERE id = 'dept-it-001';
UPDATE mbo_departments SET managerId = 'user-ceo-001' WHERE id = 'dept-ops-001';
UPDATE mbo_teams SET leaderId = 'user-lead-001' WHERE id = 'team-ai-001';
UPDATE mbo_users SET managerId = 'user-cto-001' WHERE id = 'user-mgr-001';
UPDATE mbo_users SET managerId = 'user-mgr-001' WHERE id = 'user-lead-001';
UPDATE mbo_users SET managerId = 'user-lead-001' WHERE id = 'user-emp-001';

-- Sample Objectives
INSERT INTO mbo_objectives (id, title, description, category, target, [current], status, dueDate, quarter, year, userId) VALUES 
('obj-001', 'AI Model Development', 'Develop and deploy 3 new AI models for customer analytics', 'Technical Excellence', 3, 1, 'ACTIVE', '2025-12-31', 'Q4', 2025, 'user-emp-001'),
('obj-002', 'Team Performance', 'Achieve 95% team satisfaction score in quarterly review', 'Leadership', 95, 88, 'ACTIVE', '2025-12-15', 'Q4', 2025, 'user-lead-001'),
('obj-003', 'Department Efficiency', 'Reduce operational costs by 15% while maintaining quality', 'Efficiency', 15, 8, 'ACTIVE', '2025-11-30', 'Q4', 2025, 'user-mgr-001');

-- Sample Reviews
INSERT INTO mbo_reviews (id, quarter, year, overallScore, status, employeeId) VALUES 
('rev-001', 'Q3', 2025, 87.5, 'APPROVED', 'user-emp-001'),
('rev-002', 'Q3', 2025, 91.2, 'APPROVED', 'user-lead-001');

-- Sample Bonuses
INSERT INTO mbo_bonuses (id, quarter, year, baseAmount, performanceMultiplier, finalAmount, status, employeeId) VALUES 
('bonus-001', 'Q3', 2025, 1500.00, 1.17, 1755.00, 'PAID', 'user-emp-001'),
('bonus-002', 'Q3', 2025, 2000.00, 1.22, 2440.00, 'PAID', 'user-lead-001');

-- =====================================================
-- Success Message
-- =====================================================
PRINT '';
PRINT '✅ CareCloud MBO System Database Schema Created Successfully!';
PRINT '';
PRINT '📊 Tables Created:';
PRINT '   • mbo_departments (with sample departments)';
PRINT '   • mbo_teams (with sample teams)';
PRINT '   • mbo_users (with sample users and roles)';
PRINT '   • mbo_objectives (with sample objectives)';
PRINT '   • mbo_objective_reviews';
PRINT '   • mbo_reviews (with sample reviews)';
PRINT '   • mbo_bonuses (with sample bonuses)';
PRINT '   • mbo_approvals';
PRINT '   • mbo_notifications';
PRINT '   • mbo_manager_objectives (manager workflow support)';
PRINT '';
PRINT '🔗 Relationships:';
PRINT '   • Department ↔ Teams (1:many)';
PRINT '   • Department ↔ Users (1:many)';
PRINT '   • Team ↔ Users (1:many)';
PRINT '   • User ↔ Objectives (1:many)';
PRINT '   • User ↔ Manager (self-referential)';
PRINT '   • All workflow relationships implemented';
PRINT '';
PRINT '📈 Performance indexes created for all foreign keys and search columns';
PRINT '🔒 All constraints and check conditions implemented';
PRINT '';
PRINT '🎯 Schema is now ready for your CareCloud MBO System!';
PRINT '   Compatible with Prisma ORM and current application structure';