# Hebrew Sales Call Analysis System - Frontend

This is the React frontend for the Hebrew Sales Call Analysis System.

## Features

- **Dashboard**: Overview statistics and scoring analytics
- **File Upload**: Drag-and-drop audio file upload with customer information
- **Customer Management**: View and filter customer list
- **Analysis Results**: Detailed analysis with Hebrew insights and score breakdown
- **Hebrew RTL Support**: Full Hebrew language support with RTL text display

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Recharts** for data visualization
- **Heroicons** for icons
- **React Dropzone** for file uploads

## Getting Started

### Prerequisites

- Node.js 16+ 
- Backend server running on `http://localhost:3002`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env file with your configuration
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components
│   ├── dashboard/       # Dashboard components
│   ├── upload/          # File upload components
│   ├── customers/       # Customer management components
│   └── analysis/        # Analysis display components
├── pages/               # Page components
├── services/            # API service layer
├── utils/               # Utility functions
└── styles/              # CSS styles
```

## Environment Configuration

The frontend uses environment variables for configuration. Copy `.env.example` to `.env` and customize:

### Key Environment Variables

- `PORT`: Frontend development server port (default: 3000)
- `REACT_APP_API_BASE_URL`: Backend API URL (default: http://localhost:3002/api)
- `REACT_APP_BACKEND_URL`: Backend server URL (default: http://localhost:3002)
- `REACT_APP_NAME`: Application name
- `REACT_APP_ENVIRONMENT`: Environment (development/production)
- `REACT_APP_DEFAULT_LOCALE`: Default locale (default: he-IL)
- `REACT_APP_RTL_SUPPORT`: Enable RTL support (default: true)

### Production Configuration

For production deployment, update the environment variables:

```bash
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
REACT_APP_BACKEND_URL=https://your-api-domain.com
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_DEBUG_MODE=false
```

## API Integration

The frontend communicates with the backend API at `http://localhost:3002/api`:

- **Dashboard**: Statistics and analytics
- **Upload**: File upload and analysis
- **Customers**: Customer management
- **Analysis**: Analysis results and scoring

## Hebrew Language Support

- RTL text direction for Hebrew content
- Hebrew date formatting
- Hebrew score labels and categories
- Hebrew insights display

## Development

### Adding New Components

1. Create component in appropriate directory
2. Add TypeScript interfaces for props
3. Use Tailwind CSS for styling
4. Add Hebrew RTL support where needed

### Styling Guidelines

- Use Tailwind CSS utility classes
- Follow responsive design principles
- Support Hebrew RTL text direction
- Use consistent color scheme and spacing

### State Management

- Use React Query for server state
- Use React hooks for local state
- Implement proper loading and error states

## Deployment

1. Build the application:
```bash
npm run build
```

2. Serve the `build` directory with a static file server

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Test with Hebrew content
4. Ensure responsive design
5. Add loading states for better UX
