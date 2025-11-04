-- =====================================================
-- CareCloud MBO System - Manager Objectives Table Creation Script
-- =====================================================
-- This script creates the mbo_manager_objectives table with all necessary
-- fields, relationships, and indexes for the manager objectives workflow
-- Compatible with SQL Server

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
    seniorManagerScore FLOAT NULL CHECK (seniorManagerScore >= 0 AND seniorManagerScore <= 100),
    seniorManagerComments NVARCHAR(MAX) NULL,
    finalScore FLOAT NULL CHECK (finalScore >= 0 AND finalScore <= 100),
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
PRINT 'Creating indexes for mbo_manager_objectives table...';

-- Primary indexes for lookups
CREATE INDEX IX_mbo_manager_objectives_managerId ON mbo_manager_objectives(managerId);
CREATE INDEX IX_mbo_manager_objectives_assignedBySeniorManagerId ON mbo_manager_objectives(assignedBySeniorManagerId);
CREATE INDEX IX_mbo_manager_objectives_status ON mbo_manager_objectives(status);
CREATE INDEX IX_mbo_manager_objectives_quarter_year ON mbo_manager_objectives(quarter, [year]);
CREATE INDEX IX_mbo_manager_objectives_dueDate ON mbo_manager_objectives(dueDate);

-- Composite indexes for common queries
CREATE INDEX IX_mbo_manager_objectives_manager_status ON mbo_manager_objectives(managerId, status);
CREATE INDEX IX_mbo_manager_objectives_quarter_year_status ON mbo_manager_objectives(quarter, [year], status);
CREATE INDEX IX_mbo_manager_objectives_assignedBy_status ON mbo_manager_objectives(assignedBySeniorManagerId, status);

-- =====================================================
-- Create Update Trigger for updatedAt field
-- =====================================================
PRINT 'Creating update trigger for mbo_manager_objectives table...';
GO

CREATE TRIGGER TR_mbo_manager_objectives_UpdatedAt
    ON mbo_manager_objectives
    AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE mbo_manager_objectives 
    SET updatedAt = GETDATE()
    FROM mbo_manager_objectives mo
    INNER JOIN inserted i ON mo.id = i.id;
END;
GO

-- =====================================================
-- Verify Table Creation
-- =====================================================
PRINT 'Verifying mbo_manager_objectives table creation...';

-- Check if table exists
IF OBJECT_ID('mbo_manager_objectives', 'U') IS NOT NULL
    PRINT 'SUCCESS: mbo_manager_objectives table created successfully!';
ELSE
    PRINT 'ERROR: mbo_manager_objectives table was not created!';

-- Check row count (should be 0 for new table)
SELECT COUNT(*) as TableRowCount FROM mbo_manager_objectives;

-- Display table structure
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'mbo_manager_objectives' 
ORDER BY ORDINAL_POSITION;

PRINT 'Manager objectives table setup completed successfully!';