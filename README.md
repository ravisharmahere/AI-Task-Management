# AI Task Management Dashboard

A modern task management system with AI-powered features for efficient task assignment, optimization, and management.

## Features

### Core Features

- User authentication (Login/Register)
- Role-based access control (Admin/Employee)
- Task creation, editing, and deletion
- Task status management (Pending/Ongoing/Completed)
- Deadline setting and tracking
- Task assignment to employees

### AI-Powered Features

- **Task Optimization**: AI suggests improvements for task titles and descriptions
- **Smart Task Assignment**: AI analyzes employee workload and suggests optimal task assignments
- **Task Suggestions**: AI generates relevant task suggestions based on current workload
- **Daily Summary**: AI generates daily activity summaries of tasks and progress

## Tech Stack

### Frontend

- React.js
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- OpenAI API (GPT-3.5)
- JWT Authentication

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- OpenAI API key

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:

   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the frontend directory:

   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

## Usage

### Admin Features

- Create, edit, and delete tasks
- Assign tasks to employees
- Use AI to optimize task descriptions
- Get AI suggestions for task assignments
- View and manage all tasks
- Generate daily summaries
- Get task suggestions

### Employee Features

- View assigned tasks
- Update task status
- View task deadlines
- Get task suggestions
- View daily summaries

## Default Login Credentials

### Admin Account

- Email: admin@gmail.com
- Password: admin

### Employee Account

- Email: user@gmail.com
- Password: user
