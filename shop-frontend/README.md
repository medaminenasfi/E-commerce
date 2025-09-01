# ShopFront - E-commerce Frontend

A modern React TypeScript e-commerce frontend application built with Vite.

## Features

- 🛍️ **Product Catalog** - Browse and search products with filters
- 🛒 **Shopping Cart** - Add/remove items with quantity management
- 💳 **Checkout Process** - Complete checkout with form validation
- 🔐 **Authentication** - User login/registration (coming soon)
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- ⚡ **Fast Performance** - Built with Vite and React Query

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context API
- **Routing**: React Router DOM
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your API URL:
   ```
   VITE_API_URL=http://localhost:3000/api
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/           # API client configuration
├── components/    # Reusable UI components
├── contexts/      # React contexts (Cart, Auth)
├── pages/         # Page components
├── types/         # TypeScript type definitions
├── App.tsx        # Main app component
└── main.tsx       # App entry point
```

## Components

- **NavBar** - Navigation with mini cart
- **ProductCard** - Product display card
- **ProductGrid** - Grid layout for products
- **CartItem** - Individual cart item
- **QuantityStepper** - Quantity adjustment
- **CheckoutForm** - Checkout form with validation

## Pages

- **Home** - Landing page with hero section
- **Catalog** - Product listing with filters
- **ProductDetail** - Individual product view
- **Cart** - Shopping cart management
- **Checkout** - Checkout process
- **Login/Register** - Authentication (coming soon)
- **Profile** - User profile (coming soon)
- **Dashboards** - Admin/Employer dashboards (coming soon)

## API Integration

The app integrates with the ShopBackend API:

- **Products**: Fetch, filter, and display products
- **Cart**: Local storage with backend sync on login
- **Authentication**: JWT-based auth with refresh tokens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
