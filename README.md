# 💈 Killy Barbershop Web App

> A full-featured, custom-built booking platform for my local barbershop — **Killy Barbershop in Alfragide, Portugal**, where I’ve been a regular for the past 4 years.  

> This is a real-world project developed entirely by me, from design to deployment. Built with **Next.js, React, Tailwind CSS**, and **Supabase with PostgreSQL**, it handles complex booking logic, real-time barber availability, SMS confirmations, and admin tools for managing staff, clients, and revenue.

---

### 🔗 Live Preview

➡️ [https://killy-barbershop.vercel.app](https://killy-barbershop.vercel.app)

🔒 Secret admin login: `/secret-login`. 
> Fake credentials on testing environment: Name - Killy Ross, Password - KillyPass123

---

## 🧠 Project Summary

**Killy Barbershop** is more than just a booking app — it’s a full business platform built to help local barbers manage their entire operation:

- 📅 Smart booking with **least-busy barber auto-assignment**
- 💈 Barber selection, time/day availability, and service filtering
- 📞 **Phone number validation** using the **NumVerify API** (inactive for cost purposes)
- ✉️ **SMS reservation confirmation** with **Twilio API** (inactive for cost purposes)
- 🔐 Role-based **JWT authentication** via **Supabase RLS Policy**
- 📊 Admin dashboard with **revenue and appointment analytics**
- ⚙️ Full CRUD for services, users, and barbers
- 🎨 Polished UI for light and dark mode, responsive for all devices **Tailwind CSS**
- 🧪 Built-in access protection via "secret login route"

---

## 🧰 Tech Stack

### Frontend
- **Next.js 15 (App Router)**
- **React**
- **Tailwind CSS**

### Backend & Services
- **Supabase with PostgreSQL** (auth, database, RLS, API)
- **NumVerify API** (PT phone number validation)
- **Twilio API** (SMS messaging)
- **JWT Auth** (role-based access)

---

## 👤 User Roles & Features

### 👤 Client / Visitor
- View **landing page**, **services**, and **booking form**
- Choose preferred **barber**, **day**, **time**, and **service**
- Receive **SMS with reservation details**
- If no barber is selected, the system assigns the **least busy barber**

### 💈 Barber
- Login via secret route `/secret-login`
- View and manage **their own reservations**
- See **their own statistics**

### 👑 Owner (Admin)
- All barber permissions, plus:
  - 👥 Manage **clients** (ban, view total reservations history)
  - ✂️ Manage **barbers** (activate/deactivate, delete)
  - 📊 View analytics:
    - Revenue and appointment count
    - Filter by **barber**, **week**, **month**, or **year**

---

## 🧪 Features Under the Hood

- 📦 Supabase database with **RLS (Row Level Security)** for access control
- ⚖️ Algorithm to assign the least busy barber 
- 🧠 First time using **Cursor AI** (assisted, not copy-pasted)
- 🛠 Built with an emphasis on **code readability, separation of concerns, DRY**, and **clean UI/UX**

---

## 📦 Project Status

✅ Core functionality complete  
🔄 Dashboard polish, bug fixing and further testing in progress  
🚀 Preparing for real deployment with barbershop team

---
## 📸 Screenshots (In constant development)

  - Booking Page: ![image](https://github.com/user-attachments/assets/dc7951bc-e38d-4c91-8e67-d81c33ef88ef)
  - Landing Page (Top part): ![image](https://github.com/user-attachments/assets/7ed87684-6364-46e6-b436-0c8e5079752f)
  - Services showcase Page: ![image](https://github.com/user-attachments/assets/e495c569-f02c-448f-a0ca-4b5fe1ea9af8)
  - Barber Dashboard Manage Reservations Page: ![Captura de ecrã 2025-04-16 011543](https://github.com/user-attachments/assets/3797f4f2-e39f-40bf-a89e-844d4e4f4931)
  - Admin Dashboard Manage Barbers Page: ![image](https://github.com/user-attachments/assets/c8292389-1d13-4afc-bd90-5acfd74e3c8a)
  - Admin Dashboard Manage Users Page: ![Captura de ecrã 2025-04-16 012313](https://github.com/user-attachments/assets/5b67e3a6-f853-49fb-a25b-00226b257843)
  - Admin Dashboard Revenue Statistics Page: ![image](https://github.com/user-attachments/assets/c5c3f58c-1495-4b3e-b664-e26a08f763ac)

---

