# Testing Materi Progress Persistence

## Persiapan
1. Pastikan Anda sudah login di website PhySphere
2. Buka browser DevTools (tekan F12)
3. Pergi ke tab **Console** untuk melihat log

## Test Case 1: Save & Refresh (User Login)

### Langkah:
1. Login ke website
2. Buka halaman **Materi**
3. Klik tombol "Tandai Dibaca" pada salah satu modul (mis. "Getaran & Gelombang")
4. Perhatikan:
   - Tombol berubah jadi "Sudah Dibaca" dengan warna abu-abu
   - Progress bar di sidebar meningkat (mis. 0% → 25%)
   - Di console, lihat log `saveProgressToSupabase: user_id= ... payload= ...`
5. **Refresh halaman** (tekan F5)
6. ✅ **Expected Result**: 
   - Progress masih tampil (progress bar tetap 25%)
   - Tombol masih "Sudah Dibaca"
   - Di console, lihat log `loadProgressFromSupabase: final state = { getaran: true, ghs: false, ... }`

## Test Case 2: Logout & Login Kembali

### Langkah:
1. Tandai beberapa materi sebagai "Sudah Dibaca" (mis. 2-3 modul)
2. Catat persentase progress (mis. 75%)
3. Klik tombol **Logout**
4. Login kembali dengan akun yang sama
5. Buka halaman **Materi**
6. ✅ **Expected Result**: 
   - Progress masih tampil sesuai sebelum logout (75%)
   - Modul yang sudah ditandai masih "Sudah Dibaca"

## Test Case 3: Verifikasi Database (Supabase)

### Langkah:
1. Buka [Supabase Dashboard](https://app.supabase.com)
2. Pilih project Anda
3. Pergi ke **Table Editor** → pilih tabel `profile` atau `profiles`
4. Cari row dengan `id` = user ID Anda (bisa dilihat di console log)
5. ✅ **Expected Result**: 
   - Kolom `materi_progress` berisi JSON seperti:
     ```json
     {
       "ghs": false,
       "pegas": false,
       "bandul": false,
       "getaran": true
     }
     ```
   - Nilai `true` untuk modul yang sudah ditandai dibaca

## Test Case 4: Multiple Browsers / Devices

### Langkah:
1. Login di Browser A (mis. Chrome)
2. Tandai beberapa materi sebagai "Sudah Dibaca"
3. Buka website di Browser B (mis. Firefox) atau device lain
4. Login dengan akun yang sama
5. ✅ **Expected Result**: 
   - Progress yang sudah dibuat di Browser A tampil di Browser B

## Troubleshooting

### Progress hilang setelah refresh?

Periksa di Console (F12):

1. **Apakah ada error saat save?**
   - Cari log: `saveProgressToSupabase: update/upsert failed`
   - Jika ada, periksa koneksi internet atau kredensial Supabase

2. **Apakah ada error saat load?**
   - Cari log: `loadProgressFromSupabase: Error loading progress`
   - Jika ada, periksa tabel database (apakah tabel `profile` atau `profiles` ada?)

3. **Apakah user_id null?**
   - Cari log: `loadProgressFromSupabase: user_id = null`
   - Ini berarti user belum login atau session expired

4. **Apakah state kosong setelah load?**
   - Cari log: `loadProgressFromSupabase: final state = {}`
   - Ini berarti database belum punya data untuk user ini (normal untuk user baru)

### Jika masalah persist

Jalankan query SQL berikut di Supabase SQL Editor untuk memverifikasi data:

```sql
-- Lihat semua progress yang tersimpan
SELECT id, full_name, email, materi_progress 
FROM profiles 
WHERE id = 'YOUR_USER_ID_HERE';

-- Atau jika tabel bernama 'profile' (singular)
SELECT id, full_name, email, materi_progress 
FROM profile 
WHERE id = 'YOUR_USER_ID_HERE';
```

Ganti `YOUR_USER_ID_HERE` dengan user ID Anda (bisa dilihat di console log).

## localStorage Fallback (Offline Mode)

Jika Supabase tidak tersedia atau user belum login:

1. Data progress disimpan di **localStorage** browser dengan key:
   - `pysphere_materi_progress_local_v1:USERID` (untuk user login)
   - `pysphere_materi_progress_local_v1:anon` (untuk anonymous)

2. Data juga di-enqueue di:
   - `pysphere_progress_queue_v1`

3. Saat user login/koneksi kembali, queue akan di-flush ke Supabase

### Cara cek localStorage:

1. Buka DevTools → tab **Application** (Chrome) atau **Storage** (Firefox)
2. Expand **Local Storage** → pilih domain website Anda
3. Cari key yang dimulai dengan `pysphere_`
4. ✅ **Expected**: Ada entry dengan value JSON progress Anda

---

## Summary Checklist

- [ ] Progress tersimpan saat klik "Tandai Dibaca"
- [ ] Progress tetap ada setelah refresh
- [ ] Progress tetap ada setelah logout & login kembali
- [ ] Data tersimpan di database Supabase (kolom `materi_progress`)
- [ ] Console log menunjukkan operasi save/load berhasil
- [ ] Progress sync antar browser/device

Jika semua checklist ✅, persistence sudah berfungsi dengan baik!
