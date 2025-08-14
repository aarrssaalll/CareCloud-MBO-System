# CareCloud MBO System

A comprehensive Automated Management by Objectives (MBO) Reporting System built with Next.js, TypeScript, and Tailwind CSS.

## Project Overview

The CareCloud MBO System is designed to streamline performance management through intelligent automation and meticulous design practices. It supports role-based access control for employees, managers, HR, and senior management, providing a complete solution for objective management, AI-powered scoring, and comprehensive reporting.

## Key Features

### Role-Based Access Control
- **Employee**: Add remarks, digital signature, view dashboard and performance metrics
- **Manager**: All employee functions + set objectives, approve requests, override AI scores
- **HR**: Define bonus structures, initial approvals, generate comprehensive reports
- **Senior Management**: Strategic oversight, final approvals, organization-wide reporting

### Objective Management
- Quarterly objective setting and tracking
- Support for both quantitative and qualitative objectives
- AI-assisted progress evaluation and scoring
- Digital signature workflow with edit request system
- Manager override capabilities with justifications

### Performance Analytics
- Historical performance tracking and trends
- Comparative analytics across quarters
- Bonus eligibility calculations
- Individual and team performance insights
- Downloadable reports in PDF/Excel formats

### AI-Powered Features
- Intelligent scoring based on objective completion and remarks
- Sentiment analysis for qualitative objectives
- Performance prediction and recommendations
- Automated feedback generation

### Bonus Management
- Quarterly bonus calculation based on weighted objectives
- HR-defined bonus structures
- Multi-level approval workflow
- Audit trails for compliance

## Design System

### Color Palette
- **Primary Blue**: #004E9E
- **Secondary Blue**: #007BFF
- **Background White**: #FFFFFF
- **Accent Gray**: #F5F7FA
- **Text Dark Gray**: #333333

### UI Components
- Clean, professional interface design
- Responsive layout for cross-device compatibility
- Consistent styling with centralized CSS variables
- Accessible color contrasts and typography

## Technology Stack

- **Frontend**: Next.js 15.4+ with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React and Heroicons
- **Backend**: Next.js API routes
- **Database**: Ready for PostgreSQL/MongoDB integration
- **Authentication**: Prepared for NextAuth.js implementation

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd carecloud-mbo-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Demo Access

The system includes demo accounts for testing different user roles:

| Role | Email | Password |
|------|-------|----------|
| Employee | employee@carecloud.com | demo123 |
| Manager | manager@carecloud.com | demo123 |
| HR | hr@carecloud.com | demo123 |
| Senior Management | exec@carecloud.com | demo123 |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # User dashboard
│   ├── login/            # Authentication
│   ├── objectives/       # Objective management
│   ├── performance/      # Performance analytics
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   └── Navigation.tsx    # Main navigation component
└── globals.css          # Global styles and CSS variables
```

## Configuration

### Environment Variables
Create a `.env.local` file for environment-specific configuration:

```env
# Database
DATABASE_URL=your_database_url

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# AI/LLM Integration
OPENAI_API_KEY=your_openai_api_key

# Email Service
EMAIL_SERVER_URL=your_email_server_url
```

### Tailwind Configuration
The color system is defined in `tailwind.config.ts` with custom color variables that can be easily modified for branding requirements.

## Development Guidelines

### Code Style
- Use TypeScript throughout the application
- Follow Next.js App Router patterns
- Implement proper error handling
- Create reusable components
- Maintain clean, professional design standards

### Component Structure
- Use functional components with React hooks
- Implement proper TypeScript interfaces
- Follow the established design system
- Ensure responsive design principles

## Deployment

### Vercel (Recommended)
```bash
npm run build
```
Deploy using Vercel CLI or GitHub integration.

### Docker
```dockerfile
# Dockerfile example for containerized deployment
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Future Enhancements

### Planned Features
- [ ] Real-time notifications system
- [ ] Mobile app development
- [ ] Advanced AI analytics and predictions
- [ ] Integration with external HR systems
- [ ] Multi-language support
- [ ] Advanced reporting dashboard
- [ ] API documentation and external integrations

### Database Integration
- PostgreSQL schema design for production
- MongoDB document structure for NoSQL approach
- Redis caching for performance optimization
- Backup and disaster recovery procedures

## API Routes

### Authentication
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Objectives
- `GET /api/objectives` - Get user objectives
- `POST /api/objectives/remarks` - Submit objective remarks
- `POST /api/objectives/signature` - Digital signature
- `PUT /api/objectives/score` - Manager score override

### Performance
- `GET /api/performance/history` - Performance history
- `GET /api/performance/analytics` - Performance analytics
- `GET /api/reports/export` - Export performance reports

## Recent Enhancements (August 2025)

### 🚀 UI/UX Transformation
- **Futuristic Landing Page**: Animated star field with space theme and "Begin Your Journey" experience
- **Enhanced Navigation**: Professional glass morphism dropdown with role-based features
- **Performance Optimization**: API caching, component memoization, and performance utilities
- **Visual Redesign**: Consistent CareCloud color scheme with modern glassmorphism effects

### 🎨 Design System Updates
- **Landing Experience**: Dark space theme with animated particles and aurora effects
- **Professional Interface**: Enhanced dashboards with gradient cards and smooth animations
- **Interactive Charts**: Working SVG-based performance visualizations with real-time data
- **Responsive Design**: Cross-device compatibility with touch-friendly interactions

### ⚡ Performance Improvements
- **API Response Caching**: 30-second TTL cache for reduced database queries
- **Component Optimization**: React.memo and useMemo for reduced re-renders
- **Database Connection Pooling**: Optimized connection management
- **Build Optimization**: SWC minification and package import optimization

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software developed for CareCloud. All rights reserved.

## Support

For technical support or questions:
- Email: Gulsherzahid@carecloud.com


---

**Built with care for CareCloud by the Gulsher - Prompt Engineer**
