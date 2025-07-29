# 💸 Personal Finance Tracker 🎯

A modern single-page application to manage personal income and expenses. Built with **React (Vite + TypeScript)**, styled using **Tailwind CSS**, and powered by **Firebase (Auth + Firestore)**.

---

## ✨ Features

- 🔐 **User Authentication** (Email/Password via Firebase)
- ➕ **Add Transactions** (with description, amount, type, category, and date)
- 📄 **List of Transactions** (sortable and filterable)
- 🧮 **Balance Summary** with total income/expense
- 🥧 **Donut Chart** breakdown of income vs expenses
- 🛠️ **Edit/Delete Transactions**
- 🔍 **Filter by Type and Category**
- 🔃 **Sort by Date/Amount**
- ☁️ **Firebase Firestore** for persistent storage
- ✅ **Form Validation**
- 🌈 **Responsive UI** with Tailwind CSS

---

## 🧱 Tech Stack

| Tech            | Description                          |
|-----------------|--------------------------------------|
| [Vite](https://vitejs.dev/)           | Fast build tool and dev server     |
| [React](https://reactjs.org/)         | Frontend library                   |
| [TypeScript](https://www.typescriptlang.org/) | Static typing for JS              |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework        |
| [Firebase](https://firebase.google.com/) | Auth + Firestore Database          |

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Create-source1/finance-tracker.git
cd finance-tracker
```

### 2. Install dependencies
```bash
npm install
```

### 3. Firebase Setup
```
.env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run the App
```
npm run dev
```
---
## 📁 Folder Structure
src/
│
├── components/         # Reusable UI components
├── hooks/              # Custom Firebase hooks
├── pages/              # Page-level components (Dashboard, Auth)
├── types/              # TypeScript interfaces
├── firebase/           # Firebase config
└── App.tsx             # Main app router

---
## ✅ Todos
 - [ ] Add category color tagging
 - [ ] Export transactions to CSV
 - [ ] Add dark mode
 - [ ] Add pie chart by category (Recharts)
 ---

 ## Author 👤 : Pooja Jaiswal