# Tourism Intelligence & Footfall Analytics System - PRD

## Project Overview
A full-stack web + mobile compatible Tourism Intelligence & Footfall Analytics System for monitoring and managing tourist destinations across India.

## Original Problem Statement
Build a full-stack Web + Mobile compatible Tourism Intelligence & Footfall Analytics System with real-time crowd monitoring, analytics dashboard, and visitor feedback system.

## User Personas
1. **Tourist/Visitor** - Wants to explore destinations with crowd information
2. **Admin/Tourism Manager** - Manages locations, monitors analytics, exports data

## Core Requirements
- Real-time crowd status visualization (Low/Medium/High)
- Interactive heatmap with Leaflet
- Best time to visit recommendations
- Visitor feedback system
- Admin dashboard with analytics
- CSV and PDF export functionality
- JWT-based authentication for admin
- Mobile responsive design

## Tech Stack
- **Frontend**: React.js, Tailwind CSS, Shadcn/UI, Recharts, React-Leaflet
- **Backend**: FastAPI (Python), MongoDB
- **Authentication**: JWT
- **Maps**: Leaflet with CartoDB Dark tiles (mocked data)

## What's Been Implemented (Feb 6, 2026)

### User Features
- [x] Homepage with hero section, featured places, live heatmap preview
- [x] Places listing with search, category filter, crowd filter
- [x] Place detail page with description, hourly crowd chart, location map
- [x] Feedback submission form with star ratings
- [x] Live heatmap page with real-time crowd visualization
- [x] Auto-refresh heatmap every 30 seconds

### Admin Features
- [x] Admin login page with JWT authentication
- [x] Dashboard with stats cards (locations, footfall, feedbacks, ratings)
- [x] Footfall trend chart (daily/weekly/monthly)
- [x] Crowd distribution pie chart
- [x] Location management (add/edit/delete)
- [x] Feedbacks management page
- [x] CSV and PDF export functionality

### Sample Data
- 8+ Indian tourist locations seeded (Taj Mahal, Varanasi, Kerala, Goa, etc.)
- 30 days of footfall history for analytics
- Default admin user: admin@tourism.com / admin123

## Database Schema
- `locations` - Tourist destinations with crowd info
- `footfall_records` - Historical footfall data
- `feedbacks` - Visitor feedback/reviews
- `admin_users` - Admin authentication

## API Endpoints
- `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- `/api/locations` (GET, POST, PUT, DELETE)
- `/api/analytics/footfall`, `/api/analytics/heatmap`, `/api/analytics/summary`, `/api/analytics/hourly`
- `/api/feedback` (GET, POST)
- `/api/export/csv`, `/api/export/pdf`

## Prioritized Backlog

### P0 - Critical (Done)
- [x] All core features implemented

### P1 - Important (Future)
- [ ] Real IoT sensor integration for live footfall
- [ ] Push notifications for crowd alerts
- [ ] User registration and favorites

### P2 - Nice to Have
- [ ] Multi-language support
- [ ] Weather integration
- [ ] Nearby restaurants/hotels

## Next Action Items
1. Add real-time sensor/IoT integration for accurate footfall
2. Implement user accounts with saved favorites
3. Add email notifications for crowd alerts
4. Integrate weather data for better recommendations
