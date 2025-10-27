# 🐛 Debug Login Status - Quick Guide

## ❌ **Error Yang Muncul:**

```
Cannot save to Supabase (not logged in or SDK not ready), enqueueing
```

## 🔍 **Penyebab:**

1. **User belum login** ke aplikasi
2. **Supabase client belum ready**
3. **Session expired**

## ✅ **Solusi:**

### **1. LOGIN KE APLIKASI**

Aplikasi PhySphere **WAJIB login** untuk menyimpan progress:

```
1. Buka: http://localhost/src/html/login.html
   atau: file:///C:/Users/tika/Downloads/.../src/html/login.html

2. Masukkan email & password
3. Klik "Masuk"
4. Akan redirect ke PhySphere.html
```

### **2. Verifikasi Login Berhasil**

Buka **Console (F12)** dan lihat log:

✅ **BERHASIL LOGIN:**
```
🔒 Auth Guard: User logged in as user@example.com
✅ User logged in: user@example.com
```

❌ **BELUM LOGIN:**
```
🔒 Auth Guard: NO SESSION - REDIRECTING to login
⚠️ User NOT logged in - progress will NOT be saved to database
```

### **3. Test Progress Setelah Login**

```
1. Login berhasil
2. Buka tab "Materi"
3. Klik "Tandai Dibaca" pada materi "Getaran"
4. Console harus menampilkan:
   ✅ mark-read clicked: getaran new state: {getaran: true, ...}
   ✅ Debug save - user_id: abc-123-def-456
   ✅ Progress saved to DB successfully!

5. Refresh halaman (F5)
6. Buka tab "Materi" lagi
7. Tombol "Getaran" harus tetap "Sudah Dibaca" (warna abu-abu)
```

## 📋 **Debug Checklist:**

### **A. Cek Auth Guard (di PhySphere.html)**

Buka Console saat load halaman:

- [ ] Muncul: `🔒 Auth Guard: Starting...`
- [ ] Muncul: `✅ Auth Guard: User logged in as ...`
- [ ] TIDAK ada redirect ke login.html

Jika redirect terus → **User memang belum login, silakan login dulu**

### **B. Cek User ID**

Klik tombol "Tandai Dibaca", lalu lihat Console:

```javascript
🔍 Debug save - user_id: abc-123-def-456  ✅ OK
🔍 Debug save - user_id: NOT LOGGED IN    ❌ MASALAH!
```

Jika "NOT LOGGED IN" → **Harus login ulang**

### **C. Cek Supabase Client**

```javascript
🔍 Debug save - supabase client: Available     ✅ OK
🔍 Debug save - supabase client: NOT AVAILABLE ❌ MASALAH!
```

Jika "NOT AVAILABLE" → **supabase-client.js gagal load**

### **D. Cek Warning Banner**

Jika belum login, akan muncul banner kuning di atas halaman:

```
⚠️ Anda belum login! Progress materi tidak akan tersimpan. [Login Sekarang]
```

Klik "Login Sekarang" untuk redirect ke halaman login.

## 🎯 **Flow Login Yang Benar:**

```
┌─────────────────┐
│ Buka login.html │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│ Input email/password│
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ Klik "Masuk"        │
└────────┬────────────┘
         │
         ▼
┌───────────────────────────┐
│ Supabase Auth Login       │
│ - Create session          │
│ - Store token in cookie   │
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────┐
│ Redirect to PhySphere.html│
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────┐
│ Auth Guard Check Session  │
│ ✅ Session valid → Continue│
│ ❌ No session → Redirect  │
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────┐
│ loadProgressFromSupabase()│
│ - Set user_id             │
│ - Load dari database      │
└────────┬──────────────────┘
         │
         ▼
┌───────────────────────────┐
│ READY! Progress tersimpan │
└───────────────────────────┘
```

## 🚨 **Common Issues:**

### **Issue 1: Redirect Loop**

**Gejala:** PhySphere.html terus redirect ke login.html

**Penyebab:** Session tidak tersimpan di cookie

**Solusi:**
```
1. Clear browser cookies
2. Login ulang
3. Pastikan tidak ada adblocker yang block cookies
```

### **Issue 2: Progress Di-queue Terus**

**Gejala:** Console selalu "enqueueing", tidak pernah "saved to DB"

**Penyebab:** `user_id` kosong

**Solusi:**
```
1. Logout (jika ada tombol logout)
2. Close browser
3. Buka lagi dan login fresh
4. Lihat Console untuk konfirmasi user_id ter-set
```

### **Issue 3: Warning Banner Tidak Hilang**

**Gejala:** Banner "Anda belum login" masih muncul padahal sudah login

**Penyebab:** `checkLoginStatus()` tidak dipanggil

**Solusi:**
```
1. Refresh halaman (Ctrl+F5)
2. Buka tab Materi untuk trigger checkLoginStatus()
3. Banner harus hilang otomatis
```

## 🔧 **Manual Debug Commands:**

Buka Console (F12) dan jalankan:

### **Cek Supabase Client:**
```javascript
console.log('Supabase:', window.supabase);
```

Output harapan:
```javascript
Supabase: {auth: {...}, from: ƒ, ...}  ✅
Supabase: undefined                      ❌
```

### **Cek Current User:**
```javascript
const {data} = await window.supabase.auth.getUser();
console.log('Current user:', data.user);
```

Output harapan:
```javascript
Current user: {id: "abc-123", email: "user@example.com", ...}  ✅
Current user: null                                              ❌
```

### **Cek Session:**
```javascript
const {data} = await window.supabase.auth.getSession();
console.log('Session:', data.session);
```

Output harapan:
```javascript
Session: {access_token: "...", user: {...}, ...}  ✅
Session: null                                      ❌
```

### **Force Check Login:**
```javascript
await window.checkLoginStatus();
```

Output harapan:
```
✅ User logged in: user@example.com
```

## 📝 **Next Steps:**

1. **LOGIN** ke aplikasi via login.html
2. **Verify** di Console bahwa user_id ter-set
3. **Test** tandai materi sebagai "Sudah Dibaca"
4. **Confirm** di Console: "Progress saved to DB successfully!"
5. **Refresh** dan verify progress tetap tersimpan

---

## 🎉 **Jika Sudah Login:**

Console akan menampilkan:
```
✅ User logged in: your@email.com
🔍 Debug save - user_id: abc-123-def-456
🔍 Debug save - supabase client: Available
✅ Progress saved to DB successfully!
```

Banner kuning akan **HILANG** dan progress akan **TERSIMPAN KE DATABASE**! 🚀
