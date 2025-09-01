# E-commerce Project

This project contains both the backend and frontend applications for an e-commerce platform.

## Project Structure

```
E-commerce/
├── shop-backend/          # Node.js/Express backend API
│   ├── src/               # Source code
│   ├── tests/             # Test files
│   ├── package.json       # Backend dependencies
│   └── ...                # Other backend config files
├── shop-frontend/         # React/TypeScript frontend
│   ├── src/               # Source code
│   ├── package.json       # Frontend dependencies
│   └── ...                # Other frontend config files
└── README.md              # This file
```

## Getting Started

### Backend (shop-backend)
```bash
cd shop-backend
npm install
npm run dev
```
The backend will run on http://localhost:3000

### Frontend (shop-frontend)
```bash
cd shop-frontend
npm install
npm run dev
```
The frontend will run on http://localhost:5173

## Features

- **Backend**: RESTful API with authentication, role-based access control, product management, cart functionality, and file uploads
- **Frontend**: Modern React application with TypeScript, Tailwind CSS, and React Query for state management
