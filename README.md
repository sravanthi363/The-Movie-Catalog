# CineHive

CineHive is a full-stack movie streaming platform that lets users explore trending movies and TV shows, maintain watchlists, and switch dynamically between categories — all with secure authentication, a polished UI, and seamless frontend-backend integration.

---


## About

CineHive is built to mimic a streaming service experience using a modern frontend framework and a real backend. Features include user authentication using JWTs (cookies), TMDB-powered content fetching, movie/TV show toggles, protected routes, and Zustand state management.

---

## Tech Stack

**Frontend**  
- React + Vite  
- React Router  
- Zustand  
- Axios  
- TailwindCSS

**Backend**  
- Node.js  
- Express.js  
- MySQL  
- bcryptjs  
- JWT  
- cookie-parser  
- cors  
- dotenv

---

## Features

- JWT-based login/signup with cookie storage
- Zustand-managed global state
- Auto-auth check on refresh via `/authCheck`
- Trending movie/TV show banner
- Category-based sliders: Action, Comedy, etc.
- Dynamic movie/TV show switching from the Navbar
- Vite proxy for API routing in development
- Responsive layout with TailwindCSS

---

##  Installation

### ⚙️ Prerequisites

- Node.js v18+
- MySQL workbench for Database Management
- TMDB API Key to fetch the details in real time

---

###  Backend Setup

```bash
cd backend
npm init -y
npm install express mysql2 cors dotenv bcryptjs cookie-parser jsonwebtoken
npm install --save-dev nodemon
