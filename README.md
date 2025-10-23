# Tutor Support System - Full Backend (Express + Sequelize + JWT)
Generated: 2025-10-23T03:48:29.463274Z

## Setup
1. Copy `.env.example` to `.env` and fill values.
2. Ensure MySQL `tutor_ss` exists.
3. Run:
```bash
npm install
npm run dev
```
Seeding users:
- admin@bk.com / 123456 (admin)
- tutor@bk.com / 123456 (tutor)
- student@bk.com / 123456 (student)

## API
- POST /api/auth/login
- GET  /api/users
- GET  /api/sessions
- POST /api/sessions
- GET  /api/bookings
- POST /api/bookings
