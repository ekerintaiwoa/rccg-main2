<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# RCCG Web App

This repository contains:

- Frontend: React + Vite in the root folder
- Backend: Django API in [backend](backend)

## Local Development

Prerequisites:

- Node.js 20+
- Python 3.10+

1. Install frontend dependencies:
   npm install
2. Copy frontend env template and adjust if needed:
   copy .env.example .env.local
3. Install backend dependencies:
   cd backend
   pip install -r requirements.txt
4. Copy backend env template:
   copy .env.example .env
5. Run backend:
   python manage.py migrate
   python manage.py runserver 127.0.0.1:8010
6. Run frontend from the root folder:
   npm run dev

## Hostinger Deployment (No Railway)

Recommended layout:

- Frontend on your main domain: https://yourdomain.com
- Django API on subdomain: https://api.yourdomain.com

### Backend (Django)

1. Set environment variables on Hostinger using [backend/.env.example](backend/.env.example) as reference.
2. Set these values at minimum:
   - DJANGO_DEBUG=False
   - DJANGO_SECRET_KEY=<strong random key>
   - DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,api.yourdomain.com
   - DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com,https://api.yourdomain.com
   - CORS_ALLOW_ALL_ORIGINS=False
   - CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
   - DATABASE_URL=<your database url>
3. Run:
   python manage.py migrate
   python manage.py collectstatic --noinput
4. Start your WSGI app with gunicorn (if using VPS):
   gunicorn backend.wsgi:application --bind 0.0.0.0:8000

### Frontend (Vite build)

1. Set frontend env:
   - VITE_BACKEND_URL=https://api.yourdomain.com
2. Build:
   npm run build
3. Upload contents of [dist](dist) to your Hostinger web root.

## Notes

- Railway configuration has been removed from this project.
- The frontend reads backend URL from VITE_BACKEND_URL, with local fallback to http://127.0.0.1:8010.
