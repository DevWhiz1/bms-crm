# BMS CRM - Frontend Client

A beautiful React + Vite frontend application for the BMS CRM system with Material-UI components.

## Features

- 🎨 **Beautiful UI**: Modern Material-UI design with custom theme
- 🔐 **Authentication**: Login and signup with form validation
- 📱 **Responsive**: Mobile-friendly design
- 🛡️ **Protected Routes**: Secure navigation with authentication guards
- 📊 **Dashboard**: Comprehensive dashboard with sidebar navigation
- 🔄 **Context API**: Global state management for authentication
- 📡 **API Integration**: Axios-based API service with interceptors
- ✅ **Form Validation**: React Hook Form with Yup validation

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Yup** - Schema validation
- **Axios** - HTTP client
- **Context API** - State management

## Project Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Top navigation bar
│   │   ├── Sidebar.jsx         # Side navigation
│   │   └── ProtectedRoute.jsx  # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx     # Authentication context
│   ├── pages/
│   │   ├── Login.jsx           # Login page
│   │   ├── Signup.jsx          # Registration page
│   │   └── Dashboard.jsx       # Main dashboard
│   ├── services/
│   │   └── api.js              # API service layer
│   ├── App.jsx                 # Main app component
│   └── main.jsx                # App entry point
├── package.json
├── vite.config.js
└── README.md
```

## Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3001`

## API Integration

The frontend is configured to proxy API requests to the backend server running on `http://localhost:3000`. Make sure your backend server is running before starting the frontend.

## Authentication Flow

1. **Login/Signup**: Users can authenticate through beautiful forms
2. **Token Storage**: JWT tokens are stored in localStorage
3. **Auto-login**: Users are automatically logged in on app refresh if token is valid
4. **Protected Routes**: Dashboard and other protected pages require authentication
5. **Auto-logout**: Users are logged out if token expires or becomes invalid

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Customization

### Theme
The Material-UI theme can be customized in `src/main.jsx`:

```jsx
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Change primary color
    },
    // ... other theme options
  },
})
```

### API Endpoints
API endpoints are configured in `src/services/api.js`. Update the baseURL if your backend runs on a different port.

### Sidebar Navigation
Add new menu items in `src/components/Sidebar.jsx`:

```jsx
const menuItems = [
  // ... existing items
  {
    text: 'New Page',
    icon: <NewIcon />,
    path: '/new-page',
    active: false,
  },
]
```

## Development

The application uses:
- **Hot Module Replacement (HMR)** for fast development
- **ESLint** for code linting
- **React Strict Mode** for additional checks
- **Proxy configuration** for API requests

## Production Build

To build for production:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style
2. Use meaningful component and variable names
3. Add proper error handling
4. Test your changes thoroughly
5. Update documentation if needed