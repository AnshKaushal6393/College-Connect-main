# College Connect

A full-stack web application for college students, seniors, alumni, and admins to connect, collaborate, share resources, discover hackathons, build teams, and communicate in real time.

This repository contains two main parts:

- `Backend/` - Node.js + Express API with MongoDB, JWT auth, Cloudinary uploads, SendGrid email, and Socket.IO
- `College-Connect-main/` - Frontend built with React, TypeScript, Vite, Tailwind CSS, and Socket.IO client

---

## Tech Stack

**Frontend**

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query
- Framer Motion
- lucide-react
- react-hot-toast
- Socket.IO client
- Recharts

**Backend**

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication with cookie/header support
- Cloudinary for file/image uploads
- SendGrid for transactional emails
- Socket.IO for real-time chat and online status
- Multer for uploads
- Express Validator
- Nodemon for development

---

## Current Features

- JWT authentication with login, signup, logout, and protected routes
- Student and alumni signup with verification document upload
- Admin approval and rejection workflow for pending users
- Role-based access for users and admins
- Automatic role transition between student, senior, and alumni
- Profile management with avatar, resume, skills, bio, links, education details, and activities
- Public profile viewing for other users
- Forgot password and reset password flow
- Hackathon listing, details, registration, unregistration, and admin management
- Team builder for creating team requests, applying, and managing applications
- Resource library with uploads, likes, downloads, comments, categories, and stats
- Alumni and senior discovery pages
- Networking stats and mentor discovery endpoints
- Real-time chat with conversations, messages, read state, typing events, and online users
- Admin dashboard with users, pending verifications, hackathons, analytics, and stats
- Cloudinary-backed uploads for profile media, documents, and hackathon/resource files

---

## Project Structure

```text
College-Connect-main/
|-- Backend/
|   |-- config/                 # Database and Cloudinary config
|   |-- controllers/            # Auth, profile, admin, chat, resources, hackathons, teams
|   |-- middlewares/            # Auth, admin, upload, validation, error handling
|   |-- models/                 # User, Hackathon, Resource, Message, Conversation, TeamRequest
|   |-- routes/                 # API route modules
|   |-- uploads/                # Local upload temp/static folder
|   |-- createAdmin.js          # Admin creation helper
|   |-- index.js                # Express + Socket.IO server entry
|   |-- package.json
|
|-- College-Connect-main/
|   |-- public/
|   |-- src/
|   |   |-- components/         # Navbar, layouts, dashboards, profile components
|   |   |-- contexts/           # AuthContext and SocketContext
|   |   |-- hooks/              # Reusable frontend hooks
|   |   |-- layouts/
|   |   |-- pages/              # Home, auth, profile, chat, admin, resources, teams, hackathons
|   |   |-- services/           # Axios API client
|   |   |-- constants/
|   |-- package.json
|
|-- README.md
```

---

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB local instance or MongoDB Atlas
- Cloudinary account for uploads
- SendGrid account and verified sender for emails

---

## Setup And Run

### Backend

```bash
cd Backend
npm install
npm run dev
```

The backend runs on `http://localhost:5000` by default.

Create `Backend/.env`:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development

JWT_SECRET=your_jwt_secret
JWT_RESET_SECRET=your_jwt_reset_secret

FRONTEND_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_sender_email

EMAIL_USER=your_email_for_role_transition_mailer
EMAIL_PASS=your_email_app_password
```

### Frontend

```bash
cd College-Connect-main
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

Create `College-Connect-main/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, set `VITE_API_URL` to your deployed backend API URL with the `/api` prefix.

---

## API Endpoints

### Health

| Method | Route | Description |
| --- | --- | --- |
| GET | `/api/health` | Backend health check |

### Auth

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Register student/alumni with verification document | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | No |
| POST | `/api/auth/forgot-password` | Send password reset email | No |
| POST | `/api/auth/reset-password` | Reset password with token | No |
| POST | `/api/auth/validate-token` | Validate reset token | No |
| POST | `/api/auth/admin/add-alumni` | Admin adds alumni manually | Admin |

### Profile And Users

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/profile` | Get logged-in user profile | User |
| PUT | `/api/profile` | Update logged-in user profile, avatar, and resume | User |
| GET | `/api/users/:userId` | Get user profile by ID | User |

### Admin

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/admin/pending-users` | Get users awaiting verification | Admin |
| POST | `/api/admin/approve/:userId` | Approve pending user | Admin |
| POST | `/api/admin/reject/:userId` | Reject pending user | Admin |
| GET | `/api/admin/stats` | Get admin dashboard stats | Admin |
| GET | `/api/admin/users` | Get all users | Admin |
| DELETE | `/api/admin/users/:userId` | Delete user | Admin |
| GET | `/api/admin/analytics` | Get analytics data | Admin |

### Hackathons

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/hackathons` | Get all hackathons | No |
| GET | `/api/hackathons/:id` | Get hackathon by ID | No |
| POST | `/api/hackathons/:id/register` | Register for hackathon | User |
| POST | `/api/hackathons/:id/unregister` | Unregister from hackathon | User |
| POST | `/api/hackathons` | Create hackathon | Admin |
| PUT | `/api/hackathons/:id` | Update hackathon | Admin |
| DELETE | `/api/hackathons/:id` | Delete hackathon | Admin |

### Networking

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/network/alumni` | Get alumni list | No |
| GET | `/api/network/seniors` | Get seniors list | No |
| GET | `/api/network/mentors` | Get available mentors | No |
| GET | `/api/network/stats` | Get network stats | No |
| GET | `/api/network/user/:userId` | Get network user profile | User |

### Team Builder

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/team-builder` | Get all team requests | No |
| GET | `/api/team-builder/:id` | Get team request by ID | No |
| POST | `/api/team-builder` | Create team request | User |
| PUT | `/api/team-builder/:id` | Update team request | User |
| DELETE | `/api/team-builder/:id` | Delete team request | User |
| POST | `/api/team-builder/:id/apply` | Apply to a team request | User |
| POST | `/api/team-builder/:id/applications/:applicationId` | Accept/reject application | User |
| GET | `/api/team-builder/my/requests` | Get current user's team requests | User |
| GET | `/api/team-builder/my/applications` | Get current user's applications | User |

### Resources

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/resources` | Get all resources | No |
| GET | `/api/resources/stats` | Get resource stats | No |
| GET | `/api/resources/:id` | Get resource by ID | No |
| POST | `/api/resources/:id/like` | Like/unlike resource | User |
| POST | `/api/resources/:id/download` | Track resource download | User |
| POST | `/api/resources/:id/comment` | Add comment to resource | User |
| POST | `/api/resources` | Upload resource | Admin |
| PUT | `/api/resources/:id` | Update resource | Admin |
| DELETE | `/api/resources/:id` | Delete resource | Admin |
| GET | `/api/resources/my/uploads` | Get admin's uploaded resources | Admin |

### Chat

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/chat/conversations` | Get current user's conversations | User |
| POST | `/api/chat/conversations` | Get or create conversation | User |
| GET | `/api/chat/conversations/:conversationId/messages` | Get conversation messages | User |
| POST | `/api/chat/conversations/:conversationId/messages` | Send message | User |
| PUT | `/api/chat/conversations/:conversationId/read` | Mark conversation as read | User |

### Role Transition

| Method | Route | Description | Auth |
| --- | --- | --- | --- |
| GET | `/api/role-transition/preview` | Preview automatic role upgrades | Admin |
| POST | `/api/role-transition/upgrade` | Run automatic role upgrade | Admin |

---

## Frontend Routes

| Route | Description |
| --- | --- |
| `/` | Home |
| `/hackathons` | Hackathon discovery and registration |
| `/team-builder` | Team request and application flow |
| `/resources` | Resource library |
| `/alumni` | Alumni discovery |
| `/seniors` | Senior discovery |
| `/login` | Login |
| `/signup` | Signup |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password |
| `/profile` | Current user's profile |
| `/profile/:userId` | Public user profile |
| `/chat` | Conversation list |
| `/chat/:conversationId` | Chat window |
| `/admin` | Admin dashboard |
| `/admin/hackathons` | Manage hackathons |
| `/admin/users` | Manage users |
| `/admin/analytics` | Admin analytics |

---

## Realtime Events

Socket.IO is initialized by the backend server and used by the frontend for chat and online presence.

Common events:

- `user:online`
- `user:offline`
- `users:online`
- `join:conversation`
- `message:send`
- `message:received`
- `typing:start`
- `typing:user`
- `typing:stop`

---

## Deployment Notes

### Frontend

- Deploy the `College-Connect-main/` frontend folder to Vercel or another static hosting provider.
- Set `VITE_API_URL` to the deployed backend API URL, for example:

```env
VITE_API_URL=https://your-backend.example.com/api
```

### Backend

- Deploy the `Backend/` folder to Render, Railway, Heroku, or another Node.js host.
- Set build command:

```bash
npm install
```

- Set start command:

```bash
npm start
```

- Add all backend environment variables in the deployment dashboard.
- Set `FRONTEND_URL` to the deployed frontend URL so CORS and password reset links work correctly.

---

## Known Follow-Up Work

- Keep frontend API calls consistent through the shared Axios client.
- Avoid hardcoded deployed/local API URLs in frontend files.
- Add `.env.example` files for both frontend and backend.
- Add automated tests for auth, profile, admin verification, resources, hackathons, and chat.
- Update frontend ESLint dependencies/config so `npm run lint` works cleanly.
- Add code splitting for large frontend bundles.
- Replace development debug logs with environment-aware logging.

---

## Contribution

1. Fork the repo
2. Create a branch:

```bash
git checkout -b feature/my-feature
```

3. Commit and push your changes
4. Open a Pull Request

---

## Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/rachit224agarwal">
        <img src="https://avatars.githubusercontent.com/rachit224agarwal" width="80px;" alt="Rachit Agarwal"/><br />
        <sub><b>Rachit Agarwal</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/Raunakushwa">
        <img src="https://avatars.githubusercontent.com/Raunakushwa" width="80px;" alt="Raunak Kushwaha"/><br />
        <sub><b>Raunak Kushwaha</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/2327cse1156">
        <img src="https://avatars.githubusercontent.com/2327cse1156" width="80px;" alt="Ansh Kaushal"/><br />
        <sub><b>Ansh Kaushal</b></sub>
      </a>
    </td>
  </tr>
</table>

---

## License

This project is licensed under the MIT License.

---

## Contact

For queries, feedback, or collaboration opportunities:

**Email:** [collegeconnect2k24@gmail.com](mailto:collegeconnect2k24@gmail.com)
