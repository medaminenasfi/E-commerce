# Shop Backend

A complete e-commerce backend API built with TypeScript, Express, MongoDB, and Redis.

## Features

- 🔐 JWT-based authentication with refresh tokens
- 🛒 Shopping cart with guest support
- 📦 Product management with variants
- 🏷️ Category and inventory management
- 🎫 Coupon system
- 📋 Order management
- ✅ Zod validation
- 🧪 Unit tests
- 🐳 Docker support

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Validation**: Zod
- **Authentication**: JWT with bcrypt
- **Testing**: Jest with Supertest

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Redis

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp env.example .env
   ```

4. Update `.env` with your configuration

5. Start the development server:
   ```bash
   npm run dev
   ```

### Using Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Cart
- `GET /cart` - Get user cart
- `POST /cart/items` - Add item to cart
- `PATCH /cart/items/:itemId` - Update cart item
- `DELETE /cart/items/:itemId` - Remove cart item
- `POST /cart/apply-coupon` - Apply coupon to cart

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middlewares/     # Express middlewares
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── jobs/            # Background jobs
├── webhooks/        # Webhook handlers
└── index.ts         # Application entry point

tests/               # Test files
```

## Environment Variables

See `env.example` for all available configuration options.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## License

MIT
