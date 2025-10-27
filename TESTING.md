# Testing Guide - PhySphere

## Cara Test Aplikasi Lokal

### 1. Buka Login Page (Halaman Utama)
```powershell
# Dari folder project
cd src/html
# Double-click index.html atau buka di browser
```

Atau gunakan server lokal (lebih baik):
```powershell
# Dari root folder project
python -m http.server 5500
# Buka: http://127.0.0.1:5500/src/html/login.html
```

### 2. Test Login/Register
- ✅ Tab "Masuk" dan "Daftar" bisa di-switch
- ✅ Form input bisa diisi
- ✅ Tombol "Masuk" / "Daftar" bisa diklik
- ✅ Tombol "Masuk dengan Google" bisa diklik
- ✅ Setelah login sukses → redirect ke PhySphere.html

### 3. Test Navigasi di PhySphere.html
Buka DevTools Console (F12) dan cek:
```javascript
// Cek apakah ada error
// Cek apakah tombol navbar ada
document.querySelectorAll('.tab-button').length // harus > 0

// Test klik manual
document.querySelector('.tab-button[data-page="materi"]').click()
document.querySelector('.tab-button[data-page="quiz"]').click()
document.querySelector('.tab-button[data-page="profile"]').click()
```

### 4. Test Tab yang Harus Berfungsi
- ✅ **Beranda** - halaman utama
- ✅ **Materi** - konten pembelajaran
- ✅ **PhySphere Lab** - simulasi (harus selesai materi dulu)
- ✅ **Kuis** - pertanyaan interaktif
- ✅ **Profil** - data user & riwayat

### 5. Test Profil
Jika sudah login:
- ✅ Nama user tampil
- ✅ Email tampil
- ✅ Tombol Logout berfungsi

Jika belum login:
- ✅ Tombol "Login" dan "Register" tampil
- ✅ Bisa klik untuk redirect ke login page

## Troubleshooting

### Tombol Navbar Tidak Bisa Diklik
1. Buka DevTools Console
2. Cek error JavaScript
3. Pastikan script-full.js termuat dengan benar
4. Cek apakah ada overlay yang blocking (modal masih visible)

### Resource 404 (Not Found)
- Pastikan menggunakan relative path (../js/, ../css/, ../img/)
- Atau gunakan server lokal

### Profil Kosong
1. Cek login status: `window.supabase.auth.getSession()`
2. Cek Supabase init: `!!window.supabase`
3. Tunggu `window.__supabaseReady` selesai

## Struktur File
```
src/
├── css/
│   └── style.css          (styling)
├── html/
│   ├── index.html         (redirect ke login)
│   ├── login.html         (halaman utama login/register)
│   ├── PhySphere.html     (aplikasi utama)
│   └── register.html      (redirect ke login)
├── img/
│   └── logo PhySphere.png
└── js/
    ├── supabase-client.js  (init Supabase)
    ├── script-full.js      (logic utama)
    ├── nav-buttons.js      (navigasi)
    └── button-press.js     (UI feedback)
```

## Fixed Issues
- ✅ Path absolut → relatif (bisa dibuka tanpa server)
- ✅ Auth guard disabled di PhySphere (bisa lihat profil)
- ✅ Navigation wrapped in DOMContentLoaded
- ✅ Redirect paths fixed (PhySphere.html instead of /PhySphere)
- ✅ Login page sebagai entry point
