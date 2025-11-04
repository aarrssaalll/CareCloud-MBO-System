# CareCloud MBO Database Schema Files

## Current Schema Files

### 📄 `carecloud-mbo-schema.sql`
**Status**: ✅ Current and Complete  
**Last Updated**: October 2025  
**Description**: Complete SQL DDL script that matches the current Prisma schema exactly

**Features**:
- All 9 MBO tables with proper relationships
- Complete column definitions matching Prisma schema  
- All foreign key constraints and indexes
- Sample data for testing
- SQL Server compatible syntax
- Proper check constraints and defaults

**Usage**:
```sql
-- Run this script on a fresh SQL Server database
USE [your_database_name];
GO
-- Then execute the entire script
```

## Deprecated Files

### ❌ `add-mbo-tables.sql` (REMOVED)
**Status**: Obsolete and Dangerous  
**Reason**: This file was from an early version and was missing:
- 5 critical tables (departments, teams, approvals, notifications, etc.)
- 15+ essential columns in existing tables
- Proper workflow status enums
- All AI scoring and digital signature features

**Action Taken**: File removed to prevent accidental use

## Database Compatibility Matrix

| File | Prisma Schema | Current DB | SQL Server | Complete |
|------|---------------|------------|------------|----------|
| `carecloud-mbo-schema.sql` | ✅ Match | ✅ Match | ✅ Compatible | ✅ 100% |
| `add-mbo-tables.sql` | ❌ ~30% | ❌ Breaks | ⚠️ Partial | ❌ Removed |

## Migration Notes

If you need to set up a fresh database:
1. Use `carecloud-mbo-schema.sql` for complete setup
2. Or use Prisma migrations: `npx prisma migrate dev --name init`
3. Run `npx prisma db seed` to populate with comprehensive test data

## Maintenance

- Schema updates should be done through Prisma first
- Regenerate SQL DDL after schema changes if needed
- Always test migrations on development database first