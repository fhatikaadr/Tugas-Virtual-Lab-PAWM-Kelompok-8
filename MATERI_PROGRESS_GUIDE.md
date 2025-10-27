# 📚 Panduan Sistem Progress Materi

## 🎯 Cara Kerja Sistem

### 1️⃣ **Struktur Data**

Progress materi disimpan dalam bentuk object dengan 4 modul:
```javascript
{
  "getaran": false,  // Getaran & Gelombang
  "ghs": false,      // Gerak Harmonik Sederhana
  "bandul": false,   // Bandul
  "pegas": false     // Pegas
}
```

- `true` = Sudah Dibaca
- `false` = Belum Dibaca

### 2️⃣ **Penyimpanan Data**

**Database (Supabase):**
- Tabel: `profile`
- Kolom: `materi_progress` (JSONB)
- Setiap user memiliki progress sendiri berdasarkan `id` (UUID)

**LocalStorage (Backup):**
- Key: `pysphere_progress_queue_v1`
- Digunakan jika koneksi database gagal
- Akan di-sync ke database saat koneksi tersedia

### 3️⃣ **Flow Kerja**

#### **Saat Login:**
1. User login via Supabase Auth
2. `loadProgressFromSupabase()` dipanggil
3. Data `materi_progress` diambil dari database
4. State di-update dan tombol di-refresh
5. Progress bar diperbarui (0-100%)

#### **Saat Klik "Tandai Dibaca":**
1. State lokal langsung diubah (optimistic update)
2. Tombol menampilkan "Menyimpan..."
3. `saveProgressToSupabase()` dipanggil
4. Data disimpan ke database
5. Jika gagal → masuk ke queue localStorage
6. Tombol berubah jadi "Sudah Dibaca" (warna abu-abu)
7. Progress bar diperbarui

#### **Saat Logout:**
1. State di-reset ke semua `false`
2. `user_id` di-clear
3. UI di-refresh ke state default
4. Progress bar kembali ke 0%

#### **Saat Login Ulang:**
1. Progress yang tersimpan di database dimuat kembali
2. Tombol kembali menampilkan status terakhir
3. Progress bar menampilkan persentase sebelumnya

### 4️⃣ **Komponen Utama**

#### **File: `src/js/script-full.js`**

**Variabel Global:**
```javascript
const MODULES = ['ghs', 'pegas', 'bandul', 'getaran'];
let state = {};     // State progress saat ini
let user_id = null; // ID user yang login
let loaded = false; // Flag apakah data sudah dimuat
```

**Fungsi Penting:**

1. **`loadProgressFromSupabase()`**
   - Memuat progress dari database
   - Normalize data (handle string/JSON/object)
   - Update UI setelah load

2. **`saveProgressToSupabase()`**
   - Menyimpan progress ke database
   - Mencoba UPDATE dulu, fallback ke UPSERT
   - Return true/false untuk success/fail

3. **`updateProgressUI()`**
   - Hitung persentase (jumlah true / total × 100%)
   - Update progress bar visual
   - Update text "X% selesai"

4. **`refreshButtons()`**
   - Loop semua tombol `mark-read`
   - Set text: "Tandai Dibaca" atau "Sudah Dibaca"
   - Set warna: biru (belum) atau abu-abu (sudah)

5. **`enqueueProgress(payload)`**
   - Simpan ke localStorage jika database gagal
   - Queue akan di-flush saat koneksi tersedia

6. **`flushProgressQueue()`**
   - Sync data dari queue ke database
   - Hapus item yang berhasil di-sync

#### **File: `src/html/PhySphere.html`**

**Tombol Tandai Dibaca:**
```html
<button class="mark-read vlab-button bg-blue-600 text-white" 
        data-module="getaran">
  Tandai Dibaca
</button>
```

**Progress Bar:**
```html
<div id="materi-progress-fill" style="width:0%"></div>
<span id="materi-progress-percent">0%</span>
```

### 5️⃣ **RLS Policies (Row Level Security)**

**PENTING:** Database harus memiliki policies yang benar!

```sql
-- User bisa SELECT progress sendiri
CREATE POLICY "profile_select_own" ON profile
FOR SELECT USING (auth.uid() = id);

-- User bisa INSERT progress sendiri
CREATE POLICY "profile_insert_own" ON profile
FOR INSERT WITH CHECK (auth.uid() = id);

-- User bisa UPDATE progress sendiri
CREATE POLICY "profile_update_own" ON profile
FOR UPDATE USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

### 6️⃣ **Debugging**

**Console Logs yang Berguna:**

```javascript
// Saat load progress
console.log('loadProgressFromSupabase: loaded progress from DB:', state);

// Saat klik tombol
console.log('mark-read clicked:', mod, 'new state:', state);

// Saat save berhasil
console.log('Progress saved to DB successfully!');

// Jika save gagal
console.error('saveProgress UPDATE error on profile:', error);
console.error('saveProgress UPSERT error on profile:', error);
```

**Cara Debug:**
1. Buka DevTools (F12) → Console
2. Login ke aplikasi
3. Klik tombol "Tandai Dibaca"
4. Lihat log untuk memastikan:
   - State berubah
   - Save berhasil/gagal
   - Error RLS (code: 42501)

### 7️⃣ **Testing Checklist**

- [ ] Login → Progress dimuat dari database
- [ ] Klik "Tandai Dibaca" → Tombol berubah jadi "Sudah Dibaca"
- [ ] Progress bar meningkat (misal 0% → 25% → 50%)
- [ ] Refresh halaman → Progress tetap tersimpan
- [ ] Logout → Progress ter-reset (tombol kembali "Tandai Dibaca")
- [ ] Login lagi → Progress yang lama muncul kembali
- [ ] Buka tab Materi → Status tombol ter-update otomatis
- [ ] Console tidak ada error RLS (42501)

### 8️⃣ **Troubleshooting**

**Masalah: Progress tidak tersimpan saat refresh**
- ✅ Cek Console untuk error save
- ✅ Pastikan RLS policies sudah benar
- ✅ Lihat di Supabase Table Editor apakah `materi_progress` ter-update

**Masalah: Tombol tidak berubah setelah klik**
- ✅ Pastikan event listener terpasang
- ✅ Cek apakah `refreshButtons()` dipanggil
- ✅ Lihat Console untuk error

**Masalah: Progress user A muncul di user B**
- ✅ Pastikan `user_id` di-reset saat logout
- ✅ Cek RLS policy (`auth.uid() = id`)
- ✅ Clear localStorage jika perlu

**Masalah: Progress hilang setelah logout/login**
- ✅ Cek database, apakah data benar-benar tersimpan
- ✅ Pastikan `loadProgressFromSupabase()` dipanggil saat login
- ✅ Lihat auth state listener di Console

### 9️⃣ **Fitur Tambahan**

**Auto-save:**
- Setiap klik langsung save ke database
- Tidak perlu tombol "Simpan" manual

**Offline Support:**
- Jika database offline → save ke localStorage
- Saat online lagi → auto-sync ke database

**Multi-device Sync:**
- Login di browser lain → progress sama
- Update di satu device → langsung tersedia di device lain (saat refresh)

**Progress Bar:**
- Visual feedback real-time
- Warna gradient ungu-cyan
- Smooth animation (0.4s transition)

---

## 🚀 Quick Start

1. **Login** ke aplikasi
2. **Buka tab "Materi"**
3. **Klik tombol "Tandai Dibaca"** pada materi yang sudah dipelajari
4. **Lihat progress bar** meningkat
5. **Refresh halaman** → Progress tetap tersimpan
6. **Logout dan login lagi** → Progress masih ada

## 📝 Notes

- Progress adalah **per-user**, tidak shared antar akun
- Database adalah **single source of truth** untuk logged-in users
- LocalStorage hanya untuk **backup/queue** jika database gagal
- **RLS policies** sangat penting untuk security dan data isolation
