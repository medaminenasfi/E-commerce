Postman Testing Guide for Shop Backend API

## 📋 Prerequisites

### 1. Install Required Software
- **Node.js** (v18 or higher)
- **MongoDB** (or Docker for MongoDB)
- **Redis** (or Docker for Redis)
- **Postman** (Desktop or Web version)

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Set up Environment Variables
```bash
# Copy the example environment file
copy env.example .env

# Edit .env file with your configuration
# The default values should work for local development
```

### 4. Start Services

#### Option A: Using Docker (Recommended)
```bash
# Start MongoDB and Redis
docker-compose up -d mongo redis

# Start the application
npm run dev
```

#### Option B: Manual Installation
- Install MongoDB locally and start it
- Install Redis locally and start it
- Run `npm run dev`

## 🚀 Import Postman Collection

1. **Download the Collection**: Use the `shop-backend-postman-collection.json` file
2. **Import to Postman**: 
   - Open Postman
   - Click "Import" button
   - Select the JSON file
   - The collection will be imported with all endpoints

## 🔧 Postman Environment Setup

### Collection Variables
The collection uses these variables:
- `baseUrl`: `http://localhost:3000`
- `accessToken`: Automatically set after login/register
- `sessionId`: Automatically set for guest carts
- `productId`: Set manually after creating products
- `categoryId`: Set manually after creating categories
- `variantSku`: Set manually (e.g., "SMART-64-BLK")

## 📝 Testing Workflow

### Step 1: Health Check
1. Run **"Health Check"** request
2. Expected: `200 OK` with server status

### Step 2: Authentication Testing

#### Register a New User
1. Run **"Register User"** request
2. Check response:
   ```json
   {
     "message": "User registered successfully",
     "user": {
       "id": "...",
       "name": "Test User",
       "email": "test@example.com",
       "role": "user"
     },
     "accessToken": "..."
   }
   ```
3. The access token is automatically saved to collection variables

#### Login User
1. Run **"Login User"** request
2. Check response and token is saved

#### Test Protected Endpoints
1. Run **"Get Profile"** request
2. Should work with the saved access token

### Step 3: Cart Testing (Guest Mode)

#### Get Empty Cart
1. Run **"Get Cart (Guest)"** request
2. Should return empty cart with session ID

#### Add Items to Cart
1. First, you need to create test data (see Step 4)
2. Update the `productId` and `variantSku` variables
3. Run **"Add Item to Cart"** request
4. Check cart is updated with items

#### Update Cart Items
1. Run **"Update Cart Item"** request
2. Change quantity in request body
3. Verify cart totals are updated

#### Apply Coupon
1. First create a test coupon (see Step 4)
2. Run **"Apply Coupon"** request
3. Check discount is applied to cart total

### Step 4: Sample Data Setup

#### Create Test Category
1. Run **"Create Test Category"** request
2. Copy the returned `categoryId` to collection variables

#### Create Test Product
1. Update the `categoryId` variable with the value from step 1
2. Run **"Create Test Product"** request
3. Copy the returned `productId` to collection variables

#### Create Test Inventory
1. Update the `productId` variable
2. Run **"Create Test Inventory"** request
3. Set `variantSku` to "SMART-64-BLK"

#### Create Test Coupon
1. Run **"Create Test Coupon"** request
2. The coupon code "SAVE10" will be available for testing

### Step 5: Cart Testing (Authenticated Mode)

#### Merge Guest Cart
1. Add items to guest cart first
2. Login or register a user
3. Run **"Merge Guest Cart"** request
4. Check that guest cart items are merged into user cart

## 🔍 Expected Responses

### Successful Registration
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Successful Login
```json
{
  "message": "Login successful",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Cart Response
```json
{
  "cart": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "items": [
      {
        "productId": "64f8a1b2c3d4e5f6a7b8c9d2",
        "variantSku": "SMART-64-BLK",
        "quantity": 2,
        "price": 299.99,
        "addedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "itemCount": 2,
    "subtotal": 599.98,
    "couponCode": "SAVE10",
    "couponDiscount": 59.998,
    "total": 539.982,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Please enter a valid email"
      }
    ]
  }
}
```

## 🚨 Common Error Codes

- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource not found)
- `409` - Conflict (Resource already exists)
- `429` - Too Many Requests (Rate limited)
- `500` - Internal Server Error

## 🔧 Troubleshooting

### Server Not Starting
1. Check if MongoDB is running
2. Check if Redis is running
3. Verify environment variables in `.env` file
4. Check console for error messages

### Authentication Issues
1. Ensure access token is being saved correctly
2. Check if token is expired (refresh if needed)
3. Verify Authorization header format: `Bearer <token>`

### Cart Issues
1. Ensure session cookies are enabled in Postman
2. Check if product and inventory exist
3. Verify product variants are active

### Database Issues
1. Check MongoDB connection string
2. Ensure database exists
3. Check if collections are created

## 📊 Testing Checklist

- [ ] Health check endpoint works
- [ ] User registration works
- [ ] User login works
- [ ] Token refresh works
- [ ] Profile endpoints work
- [ ] Guest cart creation works
- [ ] Adding items to cart works
- [ ] Updating cart items works
- [ ] Removing cart items works
- [ ] Coupon application works
- [ ] Cart merging works
- [ ] Error handling works correctly
- [ ] Validation errors are properly formatted

## 🎯 Advanced Testing

### Test Rate Limiting
1. Send multiple requests rapidly
2. Should get 429 error after limit exceeded

### Test Token Expiration
1. Wait for access token to expire (15 minutes)
2. Try to access protected endpoint
3. Should get 401 error
4. Use refresh token to get new access token

### Test Cart Validation
1. Add items to cart
2. Delete the product from database
3. Run cart validation
4. Should show validation errors

### Test Concurrent Access
1. Open multiple Postman tabs
2. Add items to cart simultaneously
3. Check for race conditions

## 📝 Notes

- The API uses JWT tokens for authentication
- Refresh tokens are stored in httpOnly cookies
- Guest carts use session IDs stored in cookies
- All requests should include `Content-Type: application/json` header
- Error responses follow a consistent format
- The API supports both guest and authenticated cart operations
