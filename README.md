# Backend Setup

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
MONGO_URI=mongodb://localhost:27017/artmarketplace
JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
PORT=5000
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Artworks
- `POST /api/artworks/create` - Create new artwork (requires auth)
- `GET /api/artworks` - Get all artworks
- `GET /api/artworks/:id` - Get artwork by ID
- `PUT /api/artworks/:id` - Update artwork (requires auth)
- `DELETE /api/artworks/:id` - Delete artwork (requires auth)

### Users
- `GET /api/users/:id` - Get user profile 