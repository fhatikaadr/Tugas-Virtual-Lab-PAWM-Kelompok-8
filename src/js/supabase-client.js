// Isi file: js/supabase-client.js

const SUPABASE_URL = 'https://odydiimcgbhownbtzueb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keWRpaW1jZ2Job3duYnR6dWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjY0NDQsImV4cCI6MjA3NjkwMjQ0NH0.tDsPXUF86-MVuUkwnEFblpmRzreC2SsbPg0YBpOPZIo';

// Inisialisasi client Supabase yang benar untuk penggunaan via CDN.
// The CDN exposes a global `createClient` function. We attach the
// initialized client to `window.supabase` so other scripts can call
// `supabase.auth.*` as expected.
window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);