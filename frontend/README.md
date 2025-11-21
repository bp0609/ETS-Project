# Frontend - IITGN Discussion Forum

React frontend for the AI-powered discussion platform.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development

The app will be available at `http://localhost:5173`

Make sure the backend is running at `http://localhost:8000`

## Components

- **LoginPage**: Authentication interface
- **SignupPage**: Student registration
- **HomePage**: Main page with lecture list
- **UploadPage**: PDF upload interface (teacher only)
- **ThreadsList**: Display all discussion threads
- **ThreadChat**: Q&A chat interface
- **Dashboard**: Teacher analytics and insights
- **Message**: Individual message component

## API Configuration

Edit `src/api.js` to change the backend URL (default: `http://localhost:8000`)

## New Features (v2)

- User authentication with role-based access
- Markdown rendering in messages
- Short topic names (1-5 words)
- Improved AI focus on current questions

