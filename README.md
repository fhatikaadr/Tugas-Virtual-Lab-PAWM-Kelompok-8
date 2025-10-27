<div align="center">
  <img src="src/img/logo%20PhySphere.png" alt="PhySphere Logo" width="400"/>
</div>

<h1 align="center">PhySphere: Virtual Lab Gerak Harmonik Sederhana</h1>

**Tugas-Virtual-Lab-PAWM-Kelompok-8** adalah proyek media pembelajaran interaktif berbasis web yang dibangun untuk memenuhi tugas Mata Kuliah PAWM (Pengembangan Aplikasi Web Modern) / Virtual Lab TPB ITB.

Proyek ini, bernama **PhySphere**, berfokus pada materi Fisika tentang **Gerak Harmonik Sederhana (GHS)**. Aplikasi ini menyediakan materi pembelajaran, simulasi laboratorium virtual, dan sistem kuis interaktif yang terintegrasi dengan backend Supabase untuk autentikasi pengguna dan penyimpanan progres.

## 👥 Tim Pengembang (Kelompok 8)

Proyek ini dibuat oleh:
* **Florecita Natawirya** (18223040)
* **Fhatika Adhalisman Ryanjani** (18223062)

## ✨ Fitur Utama

PhySphere dirancang sebagai platform pembelajaran mandiri yang lengkap dengan lima modul utama:

### 1. 🏠 Beranda
* Halaman selamat datang yang modern dan responsif.
* Menyajikan ringkasan fitur aplikasi (Simulasi Interaktif, Kuis dengan Riwayat, Referensi Ringkas).
* Navigasi cepat untuk "Mulai Materi" atau "Coba Kuis".

### 2. 📚 Materi
* Modul pembelajaran komprehensif yang dibagi menjadi empat topik:
    * Getaran & Gelombang
    * Gerak Harmonik Sederhana (GHS)
    * Bandul
    * Pegas
* Setiap modul materi dilengkapi dengan ringkasan konsep, rumus kunci, dan video pembelajaran yang di-embed dari YouTube.
* **Pelacakan Progres:** Pengguna dapat menekan tombol "Tandai Dibaca". Status progres ini (`materi_progress`) disimpan secara *real-time* ke database Supabase untuk setiap pengguna.

### 3. 🔬 PhySphere Lab (Laboratorium Virtual)
* Simulasi fisika interaktif menggunakan HTML5 Canvas.
* **Dua Mode Simulasi:**
    1.  **Pegas:** Simulasi sistem pegas-massa.
    2.  **Bandul:** Simulasi bandul sederhana.
* **Parameter yang Dapat Diubah:** Pengguna dapat mengubah parameter fisika secara *real-time* melalui *slider*:
    * **Pegas:** Massa (m), Konstanta Pegas (k), Amplitudo (A).
    * **Bandul:** Panjang Tali (L), Gravitasi (g), Sudut Awal (θ).
* **Kontrol Simulasi:** Tombol untuk "Mulai", "Jeda", "Reset", dan "Skip (Lompat ke Akhir)" untuk melihat hasil kalkulasi akhir (Periode, Frekuensi Sudut, Energi, dll.).

### 4. 📝 Kuis
* Sistem kuis interaktif yang dibagi per topik materi (Getaran, GHS, Bandul, Pegas).
* **Tiga Jenis Soal:** (ditemukan di `script-full.js`)
    1.  Pilihan Ganda (`mcq`)
    2.  Mengurutkan (`order`)
    3.  Isian Singkat (`short`)
* **Fitur Kuis:**
    * Timer (batas waktu 2 menit per topik).
    * Penilaian otomatis dan umpan (pembahasan) setelah kuis selesai.
    * Tombol "Ulangi" untuk mencoba kuis kembali.
* **Integrasi Database:** Semua hasil kuis (skor, persentase, jawaban) disimpan ke tabel `quiz_history` di Supabase.

### 5. 👤 Profil & Autentikasi
* Sistem autentikasi pengguna penuh menggunakan **Supabase Auth**.
* **Metode Login:**
    * Email & Password (Daftar / Masuk).
    * Login dengan Google (OAuth).
* **Halaman Profil:**
    * Menampilkan data pengguna (Nama, Email).
    * **Nilai Tertinggi:** Menampilkan skor terbaik pengguna untuk setiap topik kuis (diambil dari tabel `user_best_score`).
    * **Riwayat Kuis:** Menampilkan daftar lengkap setiap percobaan kuis yang pernah diambil pengguna, lengkap dengan skor dan waktu (diambil dari tabel `quiz_history`).
    * Tombol Logout.

## 🛠️ Tumpukan Teknologi (Tech Stack)

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (dimuat via CDN) & CSS kustom (`src/css/style.css`).
* **Backend (BaaS):** [Supabase](https://supabase.com/)
    * **Autentikasi:** Supabase Auth (Email/Password & Google OAuth).
    * **Database:** Supabase Postgres (Database) untuk menyimpan data pengguna, progres materi, dan riwayat kuis.
* **Deployment:** [Vercel](https://vercel.com/) (dikonfigurasi melalui `vercel.json`).

## 🗄️ Arsitektur Database (Supabase)

Aplikasi ini bergantung pada beberapa tabel di database Supabase (berdasarkan `script-full.js`):

1.  **`profile`** (atau **`profiles`**)
    * Terkoneksi dengan `auth.users` (via `id`).
    * Menyimpan data publik pengguna seperti `full_name` dan `email`.
    * Menyimpan progres materi dalam satu kolom JSONB `materi_progress` (mis: `{"ghs": true, "pegas": false, ...}`).

2.  **`quiz_history`**
    * Menyimpan *setiap* percobaan kuis yang dilakukan pengguna.
    * Kolom utama: `user_id` (UUID), `quiz_key` (text), `quiz_name` (text), `score` (int), `max_score` (int), `percentage` (numeric), `passed` (boolean), `metadata` (jsonb, untuk jawaban), `created_at` (timestamptz).

3.  **`user_best_score`**
    * Tabel (atau View) yang menyimpan skor *tertinggi* pengguna untuk setiap `quiz_key`.
    * Kolom utama: `user_id` (UUID), `quiz_key` (text), `best_percentage` (numeric), `updated_at` (timestamptz).

## 📂 Struktur Direktori Proyek
Tugas-Virtual-Lab-PAWM-Kelompok-8/ ├── src/ │ ├── css/ │ │ └── style.css # Styling kustom │ ├── html/ │ │ ├── index.html # Halaman landing (pilihan Login/Register) │ │ ├── login.html # Halaman Login │ │ ├── register.html # Halaman Register │ │ └── PhySphere.html # Aplikasi utama (SPA) │ ├── img/ │ │ ├── google-logo.png # Logo Google │ │ └── logo PhySphere.png # Logo Aplikasi │ └── js/ │ ├── button-press.js # Efek visual tombol │ ├── nav-buttons.js # Logika navigasi antar halaman │ ├── script-full.js # Logika utama (VLab, Kuis, Auth, DB) │ ├── script.js # Skrip dasar (fallback) │ ├── supabase-client.js # Klien inisialisasi Supabase │ └── supabase.min.js # Library Supabase (Skypack CDN) ├── README.md # (File ini) └── vercel.json # Konfigurasi deployment Vercel (Rewrites)

## 🚀 Cara Menjalankan Proyek

### Prasyarat

1.  Akun [Supabase](https://supabase.com/).
2.  Web server lokal (misalnya: ekstensi "Live Server" di VS Code).

### 1. Setup Backend (Supabase)

1.  Buat proyek baru di Supabase.
2.  **Autentikasi:**
    * Buka **Authentication -> Providers**.
    * Aktifkan provider **Email** (disarankan menonaktifkan "Confirm email" untuk kemudahan testing).
    * Aktifkan provider **Google** dan konfigurasikan Klien ID & Secret OAuth Anda dari Google Cloud Console.
3.  **Database:**
    * Buka **SQL Editor**.
    * Jalankan kueri SQL berikut untuk membuat tabel yang diperlukan:

    ```sql
    -- 1. Tabel untuk menyimpan data profil pengguna
    -- (Aplikasi ini mencoba 'profile' dan 'profiles')
    CREATE TABLE IF NOT EXISTS public.profile (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name TEXT,
        email TEXT UNIQUE,
        materi_progress JSONB DEFAULT '{"ghs": false, "pegas": false, "bandul": false, "getaran": false}'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 2. Tabel untuk menyimpan riwayat setiap percobaan kuis
    CREATE TABLE IF NOT EXISTS public.quiz_history (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        quiz_key TEXT NOT NULL,
        quiz_name TEXT,
        score INT,
        max_score INT,
        percentage NUMERIC,
        passed BOOLEAN,
        metadata JSONB, -- Untuk menyimpan jawaban pengguna
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 3. Tabel untuk menyimpan skor tertinggi
    CREATE TABLE IF NOT EXISTS public.user_best_score (
        id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        quiz_key TEXT NOT NULL,
        best_percentage NUMERIC,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, quiz_key) -- Pastikan unik
    );

    -- 4. Fungsi trigger untuk mengisi tabel profile saat user baru mendaftar
    -- (register.html juga mencoba menyimpan 'full_name' via options.data)
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
        INSERT INTO public.profile (id, full_name, email, materi_progress)
        VALUES (
            NEW.id,
            NEW.raw_user_meta_data->>'full_name',
            NEW.email,
            '{"ghs": false, "pegas": false, "bandul": false, "getaran": false}'::jsonb
        )
        ON CONFLICT (id) DO NOTHING; -- Hindari error jika sudah ada
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;

    -- 5. Pasang trigger ke tabel auth.users
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    ```

4.  **Kebijakan RLS (Row Level Security):**
    * Pastikan RLS diaktifkan untuk semua tabel di atas.
    * Buat kebijakan (Policies) agar pengguna hanya dapat mengakses data mereka sendiri.
    * Contoh Policy untuk `profile` (SELECT & UPDATE): `auth.uid() = id`
    * Contoh Policy untuk `quiz_history` (SELECT & INSERT): `auth.uid() = user_id`
    * Contoh Policy untuk `user_best_score` (SELECT & INSERT/UPDATE): `auth.uid() = user_id`

### 2. Setup Frontend (Lokal)

1.  **Kloning Repositori:**
    ```bash
    git clone [https://github.com/username/Tugas-Virtual-Lab-PAWM-Kelompok-8.git](https://github.com/username/Tugas-Virtual-Lab-PAWM-Kelompok-8.git)
    cd Tugas-Virtual-Lab-PAWM-Kelompok-8
    ```

2.  **Konfigurasi Klien Supabase:**
    * Buka file `src/js/supabase-client.js`.
    * Ganti nilai `SUPABASE_URL` dan `SUPABASE_KEY` dengan "Project URL" dan "anon key" dari proyek Supabase Anda (ada di **Project Settings -> API**).

    ```javascript
    // src/js/supabase-client.js
    const SUPABASE_URL = '[https://PROYEK-ANDA.supabase.co](https://PROYEK-ANDA.supabase.co)';
    const SUPABASE_KEY = 'KUNCI-ANON-ANDA';
    // ...
    ```

3.  **Jalankan Aplikasi:**
    * Proyek ini adalah file HTML, CSS, dan JS statis, tetapi menggunakan *rewrites* (seperti di `vercel.json`) untuk navigasi.
    * Cara termudah adalah menggunakan ekstensi **"Live Server"** dari Visual Studio Code.
    * Klik kanan pada file `src/html/index.html` dan pilih "Open with Live Server".
    * Browser akan terbuka (contoh: `http://127.0.0.1:5500/src/html/index.html`).

### 3. Deployment (Vercel)

1.  Hubungkan repositori Git Anda (GitHub, GitLab, dll.) ke Vercel.
2.  Vercel akan otomatis mendeteksi file `vercel.json` dan menerapkan *rewrites* URL. Ini penting agar `domain.com/login` berfungsi.
3.  **PENTING:** Tambahkan URL deployment Vercel Anda (mis: `https://nama-proyek.vercel.app`) ke **Authentication -> URL Configuration -> Redirect URLs** di pengaturan Supabase Anda.
