# Todo Application

## Overview
This is a full-stack **Todo Application** built using **ReactJS** for the frontend and **MySQL** as the database. The application supports **user authentication** using **MSAL (Microsoft Authentication Library)** and **credentials-based login**. Token validation is implemented for secure access.

## Features
- **User Authentication**: Supports login with Microsoft Account (MSAL) and traditional credentials-based authentication.
- **Token Validation**: Ensures secure user sessions.
- **Task Management**: Users can add, view, update, and delete tasks.
- **Database Integration**: Uses **MySQL** to store user and task data.
- **State Management**: Utilizes React's **useState** and **useEffect** hooks.
- **Routing**: Implements navigation using **React Router**.

## Tech Stack
### Frontend:
- ReactJS
- React Router
- MSAL for authentication
- Axios for API requests

### Backend:
- Node.js with Express.js
- MySQL database
- JWT for token authentication

## Installation & Setup
1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/todo-app.git
   cd todo-app
   ```
2. **Install dependencies:**
   ```sh
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file and add your database credentials and authentication secrets.
   ```sh
   REACT_APP_MSAL_CLIENT_ID=your-client-id
   REACT_APP_API_URL=http://localhost:5000
   ```
4. **Start the backend server:**
   ```sh
   node server.js
   ```
5. **Run the frontend:**
   ```sh
   npm start
   ```
6. Open `http://localhost:3000` in your browser.

## Database Schema
### Users Table (`todo.users`)
| Column    | Type    | Description  |
|-----------|--------|--------------|
| id        | UUID   | Primary Key  |
| name      | String | User's name  |
| email     | String | User's email |
| password  | String | Hashed password |
| token     | String | JWT token for authentication |
| role      | String | User role (admin/user) |

### Tasks Table (`todo.tasks`)
| Column       | Type    | Description  |
|-------------|--------|--------------|
| id          | INT    | Primary Key  |
| title       | String | Task title   |
| description | String | Task details |
| created_by  | String | Name of creator |
| assigned_to | String | Name of assigned user |

## API Endpoints
### Authentication
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/msal` - Login with MSAL
- `GET /api/auth/validate` - Validate token

### Tasks
- `GET /api/tasks` - Fetch all tasks
- `POST /api/tasks` - Add a new task
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

## Contributing
1. Fork the repo
2. Create a new branch: `git checkout -b feature-branch`
3. Commit changes: `git commit -m 'Added new feature'`
4. Push to the branch: `git push origin feature-branch`
5. Submit a pull request

## License
This project is licensed under the **MIT License**.

---
**Author:** Bhushan Koli 
**GitHub:** [https://github.com/Bhushankoli22](https://github.com/Bhushankoli22/Todo_list_app_using_Python_ReactJS)

