<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# CareCloud MBO System Development Guidelines

## Project Overview
This is a comprehensive Automated Management by Objectives (MBO) Reporting System for CareCloud built with Next.js, TypeScript, and Tailwind CSS.

## Color Palette
- Primary Blue: #004E9E
- Secondary Blue: #007BFF  
- Background White: #FFFFFF
- Accent Gray: #F5F7FA
- Text Dark Gray: #333333

## User Roles
1. **Employee**: Add remarks, digital signature, view dashboard
2. **Manager**: All employee functions + set objectives, approve requests, override scores
3. **HR**: Define bonus structures, initial approvals, generate reports
4. **Senior Management**: Strategic oversight, final approvals, comprehensive reporting

## Key Features
- Role-based access control (RBAC)
- Objective management with AI-powered scoring
- Digital signatures and audit trails
- Quarterly bonus calculations
- Comprehensive reporting and analytics
- Cross-device compatibility

## Technical Stack
- Frontend: Next.js 15.4+ with TypeScript
- Styling: Tailwind CSS with custom color scheme
- Backend: Next.js API routes
- Database: Consider PostgreSQL or MongoDB
- Authentication: NextAuth.js recommended
- AI Integration: OpenAI API for scoring

## Code Style
- Use TypeScript throughout
- Follow Next.js App Router patterns
- Implement proper error handling
- Use the defined color variables from Tailwind config
- Create reusable components
- Maintain clean, professional design
