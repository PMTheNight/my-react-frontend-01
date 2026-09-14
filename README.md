# Password Change Assignment — Frontend

This React/Vite application is the frontend submission for the Password Change assignment.

## Implemented

- Cookie-session initialization with /api/me, login, logout, and route protection.
- Every API request includes credentials so the HTTP-only JWT cookie is used safely.
- Item list and CRUD interface for signed-in users.
- Admin-only User menu and protected user-management page.
- Admin user management, including a Change password dialog that calls PUT /api/user/:user_id/password.
- Deployment configuration reads the backend URL from VITE_API_URL.

## Deployment

Live application: https://my-react-frontend-01-bice.vercel.app/login

Configured backend: https://my-next-backend-02-seven.vercel.app/

## Submission checklist

- [x] Uses the lecture JWT cookie, proxy, and request-header approach.
- [x] Shows User management only to the Admin user.
- [x] Provides password change UI and backend-protected password update.
- [x] Built and deployed on Vercel.
- [ ] Complete end-to-end login/audit-log evidence after the private backend environment values are entered in Vercel.
