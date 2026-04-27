<div align="center">

# 📋 Task Management System

**A full-stack web application to organize, track, and manage your daily tasks — simply and securely.**

![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![XAMPP](https://img.shields.io/badge/XAMPP-FB7A24?style=for-the-badge&logo=xampp&logoColor=white)

</div>

---

## 📖 Overview

The **Task Management System** is a browser-based application that helps individuals stay on top of their work by providing a clean, structured environment to create, track, and manage tasks. Built with a PHP + MySQL backend and a dynamic JavaScript frontend, it offers secure login and full task control — all running locally via XAMPP.

> Developed as part of the **BCA academic program**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **User Authentication** | Register and log in securely |
| ➕ **Add Tasks** | Create new tasks instantly |
| ✏️ **Edit Tasks** | Modify task details at any time |
| 🗑️ **Delete Tasks** | Remove tasks you no longer need |
| 🏷️ **Task Categorization** | Organize tasks by status (Pending / Completed) |
| 📊 **Progress Tracking** | Monitor which tasks are done and which are pending |
| ⚡ **Dynamic UI** | Interface updates without full page reloads |

---

## 🛠️ Tech Stack

### Frontend
- **HTML5** — Page structure
- **CSS3** — Styling and layout
- **JavaScript** — Dynamic interactions

### Backend
- **PHP** — Server-side logic and API endpoints

### Database
- **MySQL** — Stores users and task data

### Environment
- **XAMPP** — Local server (Apache + MySQL)

---

## 📁 Project Structure

```
Task-Management-System/
│
├── frontend/                  # All user-facing pages
│   ├── login.html             # Login page
│   ├── register.html          # Registration page
│   ├── dashboard.html         # Main dashboard
│   └── tasks.html             # Task listing page
│
├── backend/                   # PHP server-side scripts
│   ├── login.php              # Handles login logic
│   ├── register.php           # Handles user registration
│   ├── add_task.php           # Creates a new task
│   ├── edit_task.php          # Updates an existing task
│   ├── delete_task.php        # Deletes a task
│   └── logout.php             # Ends user session
│
├── database/
│   └── database.sql           # SQL schema and seed data
│
└── assets/
    ├── css/                   # Stylesheets
    └── js/                    # JavaScript files
```

---

## 🚀 Getting Started

Follow these steps to run the project locally:

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) installed on your machine

### Steps

1. **Clone or download** this repository into your XAMPP `htdocs` folder:
   ```
   C:/xampp/htdocs/Task-Management-System/
   ```

2. **Start XAMPP** and enable **Apache** and **MySQL** from the XAMPP Control Panel.

3. **Set up the database:**
   - Open your browser and go to `http://localhost/phpmyadmin`
   - Create a new database (e.g., `task_db`)
   - Import the file `database/database.sql` into that database

4. **Run the application:**
   - Open your browser and navigate to:
     ```
     http://localhost/Task-Management-System/frontend/login.html
     ```

5. **Register** a new account and start managing your tasks!

---

## 🧪 Testing

The following types of testing were performed during development:

- ✅ **Unit Testing** — Individual functions and components
- ✅ **Integration Testing** — Frontend ↔ Backend communication
- ✅ **Functional Testing** — End-to-end feature validation
- ✅ **UI Testing** — Layout, responsiveness, and usability
- ✅ **Security Testing** — Authentication and input validation

---

## ⚠️ Known Limitations

- Requires a local server (XAMPP) — not accessible online out of the box
- No mobile application
- No task reminders or notifications
- No multi-user collaboration or team features

---

## 🔮 Future Improvements

Planned enhancements for future versions:

- [ ] ☁️ Cloud deployment (accessible from anywhere)
- [ ] 📱 Mobile application (Android / iOS)
- [ ] 🔔 Task reminders and email notifications
- [ ] 👥 Multi-user collaboration and task sharing
- [ ] 📅 Calendar integration
- [ ] 📈 Analytics dashboard

---

## 👨‍💻 Authors

| Name |
|---|
| Rishab Talukdar |
| Twinkle Sonowal |
| N. Panthoiba Singha |

---

## 📚 References

- [W3Schools](https://www.w3schools.com) — HTML, CSS, JavaScript reference
- [PHP Documentation](https://www.php.net) — Official PHP docs
- [MySQL Documentation](https://www.mysql.com) — Official MySQL docs

---

## 📄 License

This project was created for **educational purposes** as part of a BCA academic program. It is not intended for commercial use.

---

<div align="center">

If you found this project helpful, consider giving it a ⭐ — it means a lot!

</div>
