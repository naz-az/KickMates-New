# KickMates

KickMates is a platform where sports enthusiasts can connect, create, and join sports events in their area. The application features a React TypeScript frontend and a Node.js backend with SQLite database.

## Features

- User authentication (register, login, profile management)
- Create and manage sports events
- Join events or waitlist if full
- Comment on events
- Bookmark favorite events
- Filter and search events

## Tech Stack

- **Frontend**:
  - React 18 with TypeScript
  - React Router v6 for routing
  - Vite for build tool and development server
  - Axios for API requests
  - CSS for styling

- **Backend**:
  - Node.js with Express
  - TypeScript
  - SQLite for database
  - JSON Web Tokens (JWT) for authentication
  - bcrypt for password hashing

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/kickmates.git
   cd kickmates
   ```

2. Set up the backend:
   ```
   cd server
   npm install
   ```

3. Set up the frontend:
   ```
   cd ../client
   npm install
   ```

4. Create and seed the database:
   ```
   cd ../server
   npm run db:setup
   npm run seed
   ```

### Running the Application

1. Start the backend server:
   ```
   cd server
   npm run dev
   ```

2. Start the frontend development server:
   ```
   cd client
   npm run dev
   ```

3. Access the application at `http://localhost:5173`

## API Endpoints

### Authentication

- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Events

- `GET /api/events` - Get all events (with optional filters)
- `GET /api/events/:id` - Get a single event
- `POST /api/events` - Create a new event (protected)
- `PUT /api/events/:id` - Update an event (protected)
- `DELETE /api/events/:id` - Delete an event (protected)
- `POST /api/events/:id/join` - Join an event (protected)
- `DELETE /api/events/:id/leave` - Leave an event (protected)
- `POST /api/events/:id/bookmark` - Bookmark an event (protected)
- `POST /api/events/:id/comments` - Add a comment to an event (protected)
- `DELETE /api/events/:id/comments/:commentId` - Delete a comment (protected)

## Sample User Credentials

For testing, you can use the following credentials:

- Email: john@example.com, Password: password123
- Email: jane@example.com, Password: password456
- Email: mike@example.com, Password: password789

## License

This project is licensed under the MIT License

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/kickmates](https://github.com/yourusername/kickmates) 