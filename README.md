# To-Do List App 📝

A modern, full-stack To-Do List web application with **user authentication** and **MongoDB database** storage. Each user has their own secure account and all tasks are saved to the cloud.

## ✨ Features

### Core Functionality
- **User Authentication** - Secure login and registration system
- **MongoDB Database** - All data stored in MongoDB (cloud or local)
- **Personal Accounts** - Each user has their own tasks and settings
- **Auto-Save** - Tasks automatically sync to the database
- **Multiple Lists** - Create and manage multiple to-do lists
- **Task Management** - Add, edit, complete, and delete tasks
- **Due Dates** - Set and track due dates for tasks
- **Drag & Drop** - Reorder tasks and lists

### UI Customization
- **Dark Mode** - Toggle between light and dark themes
- **Color Themes** - Choose from 10 beautiful color schemes (Ocean, Forest, Sunset, Rose, etc.)
- **Canvas View** - Arrange lists freely on a canvas
- **Responsive Design** - Works on desktop, tablet, and mobile

### Security
- 🔒 Password encryption with bcrypt
- 🔑 JWT-based authentication
- 🍪 Secure HTTP-only cookies
- ✅ Input validation
- 🛡️ Protected API endpoints

## 🚀 Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web server framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **HTML5** - Structure
- **CSS3** - Modern styling with custom themes
- **JavaScript (ES6+)** - Client-side logic
- **Fetch API** - API communication

## 📦 Installation & Setup

### Quick Start

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MongoDB**
   - Install MongoDB locally OR
   - Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas

4. **Configure environment**
   - Copy `.env.example` to create `.env`
   - Update `MONGODB_URI` with your MongoDB connection string
   - Change `JWT_SECRET` to a random secret key

5. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development:
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

📖 **For detailed setup instructions, see [SETUP.md](SETUP.md)**

## 🎯 How to Use

### First Time Users

1. Go to `http://localhost:3000`
2. Click "Register here"
3. Create an account with username, email, and password
4. You'll be automatically logged in

### Existing Users

1. Go to `http://localhost:3000`
2. Enter your email and password
3. Click "Login"
4. Your tasks and preferences will be loaded

### Managing Tasks

- **Add Task**: Type in the input box and press Enter or click "Add Task"
- **Edit Task**: Click on a task to edit it inline
- **Complete Task**: Click the circle on the left to mark as complete
- **Delete Task**: Click the "X" button on the right
- **Due Date**: When editing, click "Add Due Date" to set a deadline
- **Create List**: Click "+ Create New List" in the sidebar
- **Reorder**: Drag and drop tasks to reorder them

### Settings

- **Theme**: Toggle dark mode in the top banner
- **Color Theme**: Click Settings → Choose from 10 color themes
- **View Mode**: Switch between List view and Canvas view
- **Logout**: Click Logout in the sidebar

## 📁 Project Structure

```
to-do-list/
├── models/              # MongoDB schemas
│   ├── User.js         # User model
│   └── Todo.js         # Todo model
├── routes/             # API routes
│   ├── auth.js         # Authentication endpoints
│   └── todos.js        # Todo CRUD endpoints
├── middleware/         # Custom middleware
│   └── auth.js         # JWT verification
├── images/             # App images and icons
├── index.html          # Main app (protected)
├── login.html          # Login page
├── register.html       # Register page
├── app.js              # Client-side JavaScript
├── style.css           # Styles
├── server.js           # Express server
├── package.json        # Dependencies
├── .env.example        # Environment template
├── .gitignore          # Git ignore file
├── README.md           # This file
└── SETUP.md            # Detailed setup guide
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Todos (Protected)
- `GET /api/todos` - Get all user's todos
- `POST /api/todos` - Save/update todos
- `PUT /api/todos/settings` - Update settings
- `DELETE /api/todos` - Delete all todos

## 🛠️ Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running (local) or connection string is correct (Atlas)
- Check firewall and network settings
- Verify credentials in `.env`

### Port Already in Use
- Change `PORT` in `.env` to a different port (e.g., 3001)

### Cannot Find Module
- Run `npm install` to install dependencies

See [SETUP.md](SETUP.md) for more troubleshooting tips.

## 🚀 Deployment

To deploy this app:

1. **Set up a production MongoDB database** (MongoDB Atlas recommended)
2. **Deploy backend** to Heroku, Railway, or similar
3. **Update environment variables** on your hosting platform
4. **Set `NODE_ENV=production`**
5. **Configure CORS** for your frontend domain

## 📝 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Feel free to fork this project and submit pull requests with improvements!

---

Made with ❤️ using Node.js, Express, and MongoDB
