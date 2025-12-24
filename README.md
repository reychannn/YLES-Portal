# 🚀 YLES Event Management Portal

A full-stack, real-time event management platform designed for the Young Leaders Entrepreneurial Summit (YLES). This application provides a complete solution for managing delegate registration, event progress, and security deposit/fine tracking, with separate, secure portals for both delegates and administrators.

Built with a modern, glass-morphism dark theme inspired by the "Investomania" project.

## 🎯 Features

- **Role-Based Authentication**: Secure login system distinguishing between "Admin" and "Delegate" users.
- **Admin Panel**: A comprehensive dashboard for event staff to:
    - Manage progress for all 300 teams (pass, fail, reset).
    - Manage module schedules (create, update, delete modules).
    - Issue and remove individual fines.
    - Wipe all fines for a specific team.
- **Delegate Dashboard**: A personalized portal for teams to:
    - View their real-time progress through event modules.
    - Track their security deposit balance.
    - See a detailed history of all fines.
- **Info Hub**: A central page for delegates to view event schedules, module times, venues, and map links.
- **Real-time Database**: Built on Supabase, all updates from the admin panel are (or can be) reflected live on the delegate's dashboard.
- **Modern UI**: Dark-themed, responsive, glass-morphism interface.

## 🛠 Tech Stack

### Frontend
- **React 18** (with Hooks)
- **Vite**
- **React Router 6** (for routing)
- **CSS3** (custom styling for glass morphism)
- **react-responsive-modal**

### Backend
- **Supabase**
    - **PostgreSQL**: The core database.
    - **Supabase Auth**: For user management and Row Level Security (RLS).
    - **SQL Functions & Triggers**: For automatic balance calculation and user profile creation.
    - **Real-time**: Supabase's real-time capabilities.

## 🚀 Quick Start & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR-USERNAME/yles-app.git](https://github.com/YOUR-USERNAME/yles-app.git)
cd yles-app