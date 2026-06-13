# Saarthi Node Edition

Saarthi is a travel discovery web application that helps users explore destinations across India, grouped state-wise, with location details, live weather, GPS-ready map support, user authentication, and user-submitted destination entries.

This edition of Saarthi uses a modern JavaScript backend:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB Atlas

## Problem Statement

Travel information is often scattered across blogs, search results, weather sites, and mapping tools. Saarthi solves this by creating a single platform where users can:

- browse destinations state-wise
- view place details in a structured format
- check live weather for destinations
- use map and tracking-ready features
- create accounts
- submit new travel locations into the system

## Features

- State-wise place discovery
- Search by city, state, or category
- Live weather using Open-Meteo
- Google Maps integration support
- GPS and tracking-ready frontend
- User registration and login
- Session-based authentication
- User-submitted location storage
- MongoDB-backed destination catalog

## Tech Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript

### Backend

- Node.js
- Express.js
- express-session
- bcryptjs
- dotenv

### Database

- MongoDB Atlas
- Mongoose

### External APIs

- Open-Meteo API
- Google Maps JavaScript API
- Browser Geolocation API

## Project Structure

```text
Saarthi-node/
├── public/
│   ├── app.js
│   ├── config.js
│   ├── index.html
│   └── styles.css
├── src/
│   ├── config/
│   │   └── db.js
│   ├── data/
│   │   ├── seedData.js
│   │   └── seedPlaces.js
│   ├── middleware/
│   │   └── requireAuth.js
│   ├── models/
│   │   ├── LocationSubmission.js
│   │   ├── Place.js
│   │   └── User.js
│   └── routes/
│       ├── authRoutes.js
│       ├── placeRoutes.js
│       └── submissionRoutes.js
├── .env
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── server.js
```

## Important Files

- [server.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/server.js)
  Starts Express, session handling, API routes, static frontend serving, MongoDB connection, and place seeding.

- [src/config/db.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/src/config/db.js)
  Connects the application to MongoDB Atlas using Mongoose.

- [src/models/User.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/src/models/User.js)
  Stores registered users.

- [src/models/Place.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/src/models/Place.js)
  Stores curated travel destination data.

- [src/models/LocationSubmission.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/src/models/LocationSubmission.js)
  Stores user-submitted place details.

- [src/routes/authRoutes.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/src/routes/authRoutes.js)
  Handles register, login, logout, and session status.

- [src/routes/placeRoutes.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/src/routes/placeRoutes.js)
  Returns curated places and approved user-submitted places.

- [src/routes/submissionRoutes.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/src/routes/submissionRoutes.js)
  Handles storing new destination submissions from authenticated users.

- [public/index.html](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/public/index.html)
  Main frontend page.

- [public/app.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/public/app.js)
  Frontend logic for search, rendering, auth modal, submissions, weather, and maps.

## Environment Variables

Create or update [.env](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/.env):

```env
PORT=3000
MONGODB_URI=mongodb://saarthiUser:YOUR_PASSWORD@ac-u2i7dhw-shard-00-00.klsaagm.mongodb.net:27017,ac-u2i7dhw-shard-00-01.klsaagm.mongodb.net:27017,ac-u2i7dhw-shard-00-02.klsaagm.mongodb.net:27017/saarthi?ssl=true&replicaSet=atlas-13tx8d-shard-0&authSource=admin&retryWrites=true&w=majority
SESSION_SECRET=change-this-to-a-long-random-secret
```

## Installation

Run from:

`C:\Users\lenovo\OneDrive\Desktop\Projects\WEB DEVELOPMENT\Saarthi-node`

Install dependencies:

```powershell
& "C:\Program Files\nodejs\npm.cmd" install
```

## Running the Project

### Normal start

```powershell
cd "C:\Users\lenovo\OneDrive\Desktop\Projects\WEB DEVELOPMENT\Saarthi-node"
& "C:\Program Files\nodejs\node.exe" server.js
```

### Development mode

```powershell
cd "C:\Users\lenovo\OneDrive\Desktop\Projects\WEB DEVELOPMENT\Saarthi-node"
& "C:\Program Files\nodejs\npm.cmd" run dev
```

Open in browser:

- [http://localhost:3000](http://localhost:3000)

## Running in VS Code

1. Open [Saarthi-node](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node) in VS Code.
2. Make sure [.env](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/.env) has the correct MongoDB Atlas URI and session secret.
3. Open the terminal in VS Code and run:

```powershell
npm.cmd install
```

4. Start the project using either:

- VS Code terminal:

```powershell
npm.cmd run dev
```

- VS Code Run and Debug:
  Select `Run Saarthi` and press `F5`.

5. Open [http://localhost:3000](http://localhost:3000)

VS Code support files included:
- [.vscode/launch.json](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/.vscode/launch.json)
- [.vscode/tasks.json](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/.vscode/tasks.json)

## MongoDB Atlas Setup

Before running the app, Atlas must be configured:

1. Create a cluster
2. Create a database user
3. Allow network access
4. Put the correct connection string into `.env`

Recommended Atlas settings:

- Database user: `saarthiUser`
- Network access: `0.0.0.0/0` for testing

## API Endpoints

### Auth

- `GET /api/auth/session`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Places

- `GET /api/places`
- `GET /api/places?location=Jaipur`
- `GET /api/places?category=history`

### Submissions

- `GET /api/location-submissions`
- `POST /api/location-submissions`

## How the Flow Works

1. User opens the frontend in the browser
2. Frontend loads places from `/api/places`
3. Express fetches data from MongoDB Atlas
4. Place cards are grouped state-wise on the UI
5. Weather is fetched client-side from Open-Meteo
6. User can register/login using `/api/auth`
7. Authenticated users can submit new place details
8. Approved submissions are merged into the main catalog

## Notes

- Google Maps requires a valid API key in [public/config.js](/C:/Users/lenovo/OneDrive/Desktop/Projects/WEB%20DEVELOPMENT/Saarthi-node/public/config.js)
- Weather works without an API key
- The app seeds the main places catalog automatically on first successful database startup

## Future Improvements

- Favorites per user
- Reviews and ratings
- Admin approval dashboard
- Saved itineraries
- Better image validation
- Deployment to a live hosting platform
