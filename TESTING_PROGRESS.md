# 🧪 Cara Test Materi Progress Persistence

## ✅ Test Cepat (5 menit)

### 1. Buka Browser DevTools
- Tekan **F12** di keyboard
- Pilih tab **Console**

### 2. Login & Tandai Materi
1. Login ke website
2. Buka halaman **Materi**
3. Klik tombol **"Tandai Dibaca"** pada salah satu modul (misal: Getaran & Gelombang)
4. Lihat di Console, harus muncul log:
   ```
   saveProgressToSupabase: user_id= ... payload= {"getaran":true, "ghs":false, ...}
   saveProgress update ok on profile ...
   ```
5. Perhatikan:
   - ✅ Tombol berubah jadi **"Sudah Dibaca"** (warna abu-abu)
   - ✅ Progress bar meningkat (misal: 0% → 25%)

### 3. Test Refresh (PENTING!)
1. **Refresh halaman** (tekan F5 atau Ctrl+R)
2. Lihat di Console, harus muncul log:
   ```
   loadProgressFromSupabase: starting...
   loadProgressFromSupabase: user_id = ...
   loadProgressFromSupabase: final state = {"getaran":true, "ghs":false, ...}
   ```
3. ✅ **EXPECTED**: Progress masih 25%, tombol masih "Sudah Dibaca"

### 4. Test Logout & Login Kembali
1. Tandai 2-3 materi (progress jadi 50-75%)
2. Klik **Logout**
3. **Login kembali** dengan akun yang sama
4. Buka halaman Materi
5. ✅ **EXPECTED**: Progress masih tersimpan, materi masih "Sudah Dibaca"

---

## 🔍 Troubleshooting

### ❌ Progress hilang setelah refresh?

**Cek Console untuk error:**

1. **Error saat save?**
   ```
   saveProgress: update/upsert failed for all candidate tables
   ```
   → Solusi: Cek apakah tabel `profile` atau `profiles` ada di Supabase

2. **User_id null?**
   ```
   loadProgressFromSupabase: User tidak login
   ```
   → Solusi: Pastikan Anda sudah login

3. **State kosong setelah load?**
   ```
   loadProgressFromSupabase: final state = {}
   ```
   → Ini normal untuk user baru (belum pernah tandai materi)

4. **Tidak ada log sama sekali?**
   → Solusi: Cek apakah file `script-full.js` ter-load dengan benar

### 🗄️ Cek Database (Supabase)

1. Buka https://app.supabase.com
2. Pilih project Anda
3. **Table Editor** → pilih tabel `profile` atau `profiles`
4. Cari row dengan `id` = user ID Anda
5. Kolom `materi_progress` harus berisi JSON:
   ```json
   {
     "getaran": true,
     "ghs": false,
     "bandul": false,
     "pegas": false
   }
   ```

### 📱 Cek localStorage (Fallback)

1. DevTools → tab **Application** (Chrome) atau **Storage** (Firefox)
2. **Local Storage** → pilih domain website
3. Cari key: `pysphere_materi_progress_local_v1:USERID`
4. Harus ada JSON progress Anda

---

## 📋 Checklist Final

- [ ] Klik "Tandai Dibaca" → tombol berubah jadi "Sudah Dibaca"
- [ ] Progress bar bertambah (25%, 50%, 75%, 100%)
- [ ] Console log menunjukkan `saveProgressToSupabase: ... payload= ...`
- [ ] Refresh halaman → progress masih tersimpan
- [ ] Console log menunjukkan `loadProgressFromSupabase: final state = ...`
- [ ] Logout & login kembali → progress masih ada
- [ ] Database Supabase → kolom `materi_progress` terisi JSON

**Jika semua ✅ maka persistence sudah berfungsi sempurna!**

---

## 🆘 Masih Bermasalah?

Kirim screenshot dari:
1. **Console log** (F12 → Console) setelah klik "Tandai Dibaca" dan setelah refresh
2. **Supabase Table Editor** (tabel profile/profiles, kolom materi_progress)
3. Error message (jika ada)

Good luck! 🚀
