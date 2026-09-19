[![Backend Deploy](https://github.com/blackXploit-404/blogify/actions/workflows/deploy-backend.yml/badge.svg)](https://github.com/blackXploit-404/blogify/actions/workflows/deploy-backend.yml)

[![Node Security Scan](https://github.com/blackXploit-404/blogify/actions/workflows/node-security.yml/badge.svg)](https://github.com/blackXploit-404/blogify/actions/workflows/node-security.yml)

![Status](https://img.shields.io/badge/status-completed-brightgreen)
![Maintenance](https://img.shields.io/badge/maintenance-stopped-red)

> [!NOTE]
**Completed as part of a winter internship project and implemented all features according to plan and tech stack** 
and now its no longer actively maintained.

# Blogify Project

A modern blogging platform built with MongoDB, Express, React, and Node.js. Currently in active development.

## Tech Stack

- **Frontend:** React with Vite
- **Backend:** Node.js & Express
- **Database:** MongoDB
- **Storage:** Cloudinary (images)
- **Email:** Brevo SMTP

## Features

### Authentication
- User registration and login
- Email verification with OTP (6-digit codes)
- JWT token-based authentication
- Password encryption 

### Blog Management
- Create blogs with markdown editor
- Upload featured images
- Add tags and excerpts
- View individual blog posts
- Delete blogs (author/admin only)
- Markdown content rendering
- Add usernames insated of random id 
- Add Likes & Comment System
- Add Profile & Customization options(Bio , Profile Pic , Social Links etc.)
- Add admin verfication badge 

### Admin Panel
- User management
- Role-based access control
- System statistics

## Setup

### Backend
```bash
cd backend
npm install
# Configure .env file
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

Backend `.env` file:
```
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
BREVO_API_KEY=your_key
EMAIL_FROM=your_email
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

