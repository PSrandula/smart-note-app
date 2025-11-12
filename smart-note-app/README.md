# 🧠 Smart Note App

A **Progressive Web Application (PWA)** for creating, editing, and managing notes both **online and offline**.  
Built with **React**, **Firebase**, and **IndexedDB**, this app ensures a seamless note-taking experience that syncs automatically when internet connectivity is restored.

---

## 🚀 Features

✅ **Offline Support** – Create, edit, and delete notes without an internet connection.  
✅ **Real-Time Sync** – Automatically syncs notes to Firebase when you go online.  
✅ **Local Backup** – Uses IndexedDB to store notes locally for offline access.  
✅ **Responsive UI** – Works perfectly across mobile, tablet, and desktop.  
✅ **Share Notes** – Generate shareable links to view notes publicly.  
✅ **Dark/Light Mode** – Toggle between themes for a personalized experience.  
✅ **Search and Filter** – Quickly find notes by title or content.  
✅ **Version History (Optional)** – Keep a history of note edits.  
✅ **Client-Side Encryption (Optional)** – Secure your note content before syncing.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Database:** Firebase Firestore
- **Offline Storage:** IndexedDB (via `idb`)
- **Hosting:** Firebase Hosting
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **Language:** JavaScript (ES6+)

---

## 📁 Project Structure

smart-note-app/
├── public/ # Static assets
├── src/
│ ├── components/ # Reusable components (NoteCard, SyntaxHighlighter, etc.)
│ ├── hooks/ # Custom hooks (useNetworkStatus, etc.)
│ ├── pages/ # App pages (Home, SharedNoteView)
│ ├── utils/ # Firebase sync & IndexedDB logic
│ ├── App.jsx
│ ├── index.css
│ └── main.jsx
├── .firebaserc
├── firebase.json
├── vite.config.js
├── package.json
└── README.md


---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

git clone https://github.com/PSrandula/smart-note-app.git
cd smart-note-app

2️⃣ Install dependencies
npm install

3️⃣ Set up Firebase

Go to Firebase Console

Create a new Firebase project

Enable Firestore Database

Enable Hosting

Copy your Firebase config and paste it into your project (e.g., firebaseConfig.js)

4️⃣ Run locally
npm run dev


Then visit:
👉 http://localhost:5173/

5️⃣ Build for production
npm run build
