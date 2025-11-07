# 🚀 YLES Event Management Portal

A full-stack, real-time event management platform designed for the **Young Leaders Entrepreneurial Summit (YLES)**.
This application provides a complete solution for managing delegate registration, event progress, and security deposit/fine tracking, with separate, secure portals for both delegates and administrators.

Built with a modern, glass-morphism dark theme inspired by the **"Investomania"** project.

---

## 🎯 Features

- **Role-Based Authentication** — Secure login system distinguishing between "Admin" and "Delegate" users.
- **Admin Panel** — A comprehensive dashboard for event staff to:
    - Manage progress for all 300 teams (pass, fail, reset).
    - Manage module schedules (create, update, delete).
    - Issue and remove individual fines.
    - Wipe all fines for a specific team.
- **Delegate Dashboard** — A personalized portal for teams to:
    - View real-time progress through modules.
    - Track security deposit balance.
    - See a detailed history of fines.
- **Info Hub** — Centralized page for schedules, venues, and map links.
- **Real-time Database** — Built on **Supabase** for live updates.
- **Modern UI** — Dark, glass-morphism, responsive interface.

---

## 🛠 Tech Stack

### 🧩 Frontend
- **React 18 (with Hooks)**
- **Vite**
- **React Router 6**
- **CSS3** (custom glass-morphism styling)
- **react-responsive-modal**

### ⚙️ Backend
- **Supabase**
    - **PostgreSQL** — Core database.
    - **Supabase Auth** — User management & Row Level Security (RLS).
    - **SQL Functions & Triggers** — For balance calculation and profile automation.
    - **Real-time** — Supabase’s real-time features.

---

## 🚀 Quick Start & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR-USERNAME/YLES-Portal.git](https://github.com/YOUR-USERNAME/YLES-Portal.git)
cd YLES-Portal

```

### 2. Install Dependencies
```bash
npm install

```


### 3. Supabase Backend Setup
- Create Project
	- Go to Supabase.io and create a new project.
- Run SQL Scripts
	- In the SQL Editor, run the following (in order): Create tables: profiles, modules, team_progress, fines Enable RLS and add policies Add handle_new_user trigger and function (auto-create profiles) Add recalculate_balance SQL function (manage fines)
- Set Initial Balances
```SQL
UPDATE public.profiles
SET
  security_deposit_initial = 10000,
  current_balance = 10000
WHERE
  role = 'delegate';
  ```
- Disable Email Confirmation
	- Go to Authentication → Providers → Email and toggle off Confirm email.
### 4. Environment Setup
Create a .env.local file in the project root:
```Code Snippit
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```
- Backend Script Keys
	- In scripts/importUsers.mjs, fill in:
```Javascript
SUPABASE_URL = "YOUR_SUPABASE_URL";
SERVICE_KEY = "YOUR_SUPABASE_SERVICE_KEY";
```

### 5. Import Users
- Ensure scripts/users.json contains all 300 user credentials.
	- Then run:
``` Bash
node scripts/importUsers.mjs
```
- Create Admin User
	- Go to Supabase → Authentication → Users → Add user
	- Add your email & password
	- In Table Editor → profiles, update your role from delegate → admin
### 6. Run the App
``` Bash
npm run dev
```
Your app will be running at:
👉 http://localhost:5173

## 📁 Project Structure
``` Plain Text
YLES-Portal/
├── scripts/
│   ├── importUsers.mjs      # Bulk import 300 users
│   └── users.json           # 300 user credentials
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── ManageTeamModal.jsx
│   │   ├── common/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── DelegateLayout.jsx
│   │   └── routing/
│   │       └── AdminRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminModules.jsx
│   │   │   └── AdminTeams.jsx
│   │   ├── Dashboard.jsx
│   │   ├── InfoHub.jsx
│   │   └── Login.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .gitignore
├── package.json
└── README.md
```
## 🎮 Demo Credentials
Pre-configured with 300 delegate accounts:
```csv
Type	    Format	   Example
Username	YLES-001 → YLES-300	YLES-001
Password	from users.json	Yagm0yHecHh0
```
## 🎨 Design Features
- Glass Morphism UI — Modern translucent “glass” cards
- Dark Theme — Sleek professional color scheme
- Gradient Accents — “Investomania”-inspired gradients
- Responsive Layout — Works seamlessly across screen sizes

✅ Ready to manage YLES events with real-time precision and a modern UI.
