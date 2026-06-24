<div align="center">

# ✅ Taskly

**Aplikasi manajemen tugas modern berbasis web**
dibangun dengan React, Node.js, Express, dan MySQL

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white)

</div>

---

## 📌 Tentang Proyek

Taskly adalah aplikasi full-stack untuk manajemen tugas pribadi. Pengguna bisa mendaftar, login, lalu membuat, mengedit, menyelesaikan, dan menghapus tugas. Semua data tersimpan di database MySQL dan dilindungi dengan autentikasi JWT.

---

## ✨ Fitur

- 🔐 **Autentikasi** — Register & login dengan enkripsi password (bcrypt) + JWT
- ➕ **Tambah tugas** — Dengan judul dan deskripsi opsional
- ✏️ **Edit tugas** — Ubah judul, deskripsi, dan status lewat modal
- ✅ **Toggle status** — Tandai tugas selesai atau kembalikan ke in-progress
- 🗑️ **Hapus tugas** — Hapus tugas yang tidak diperlukan
- 📊 **Dashboard statistik** — Jumlah total, selesai, dan pending
- 📈 **Progress bar** — Visualisasi persentase tugas yang diselesaikan
- 🔍 **Filter tugas** — Tampilkan semua / in-progress / completed
- 🔔 **Toast notifikasi** — Feedback untuk setiap aksi
- 💾 **Sesi persisten** — Tetap login setelah refresh halaman

---

## 🛠️ Tech Stack

| Layer      | Teknologi                        |
|------------|----------------------------------|
| Frontend   | React 18, Vite, Axios            |
| Backend    | Node.js, Express.js              |
| Database   | MySQL 8                          |
| Auth       | JWT (jsonwebtoken), bcryptjs     |
| Dev Tools  | Nodemon, dotenv                  |

---

## 📁 Struktur Proyek

```
todo-improved/
├── client/                   # Frontend (React + Vite)
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       └── App.jsx           # Semua komponen UI
│
├── server/                   # Backend (Node.js + Express)
│   ├── server.js             # Entry point
│   ├── .env.example
│   ├── config/
│   │   └── db.js             # Koneksi MySQL
│   ├── controllers/
│   │   ├── authController.js
│   │   └── taskController.js
│   ├── middleware/
│   │   └── authMiddleware.js # JWT guard
│   └── routes/
│       ├── authRoutes.js
│       └── taskRoutes.js
│
├── schema.sql                # Script setup database
└── README.md
```

---

## 🚀 Cara Menjalankan

### Prasyarat

- Node.js v18+
- MySQL 8.0+
- npm

---

### 1. Clone Repository

```bash
git clone https://github.com/username/taskly.git
cd taskly
```

### 2. Setup Database

Buka terminal MySQL atau MySQL Workbench, lalu jalankan:

```bash
mysql -u root -p < todo_db.sql
```

Atau buka file `todo_db.sql` dan jalankan isinya di MySQL Workbench / phpMyAdmin.

### 3. Setup Server (Backend)

```bash
cd server
npm install
cp .env.example .env
```

Edit file `.env` sesuai konfigurasi lokal kamu:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password_mysql_kamu
DB_NAME=todo_db
JWT_SECRET=rahasia_jwt_kamu
PORT=5000
CLIENT_URL=http://localhost:5173
```

Jalankan server:

```bash
npm run dev
```

Server berjalan di `http://localhost:5000`

### 4. Setup Client (Frontend)

```bash
cd client
npm install
npm run dev
```

Buka browser di `http://localhost:5173`

---

## 🔌 API Endpoints

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint          | Auth | Deskripsi                     |
|--------|-------------------|:----:|-------------------------------|
| POST   | `/auth/register`  | ❌   | Daftar akun baru              |
| POST   | `/auth/login`     | ❌   | Login, mendapat JWT token     |
| GET    | `/auth/me`        | ✅   | Ambil data user dari token    |

### Tasks

| Method | Endpoint          | Auth | Deskripsi                     |
|--------|-------------------|:----:|-------------------------------|
| GET    | `/tasks`          | ✅   | Ambil semua tugas milik user  |
| POST   | `/tasks`          | ✅   | Buat tugas baru               |
| PUT    | `/tasks/:id`      | ✅   | Edit tugas (judul/deskripsi/status) |
| DELETE | `/tasks/:id`      | ✅   | Hapus tugas                   |

> Header yang dibutuhkan untuk endpoint dengan Auth:
> ```
> Authorization: Bearer <token>
> ```

---

## 🗄️ Skema Database

```sql
-- Tabel users
CREATE TABLE users (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  username   VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel tasks
CREATE TABLE tasks (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  title       VARCHAR(500) NOT NULL,
  description TEXT,
  status      ENUM('pending', 'completed') DEFAULT 'pending',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 📄 Lisensi

Proyek ini dibuat untuk keperluan belajar. Bebas digunakan dan dimodifikasi.

<div align="center">
  Dibuat dengan ☕ dan React
</div>