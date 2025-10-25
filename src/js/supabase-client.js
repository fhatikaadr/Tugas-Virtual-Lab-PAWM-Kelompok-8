// Isi file: js/supabase-client.js

const SUPABASE_URL = 'https://odydiimcgbhownbtzueb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keWRpaW1jZ2Job3duYnR6dWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjY0NDQsImV4cCI6MjA3NjkwMjQ0NH0.tDsPXUF86-MVuUkwnEFblpmRzreC2SsbPg0YBpOPZIo';

// Inisialisasi client Supabase yang benar untuk penggunaan via CDN.
// The CDN exposes a global `createClient` function. We attach the
// initialized client to `window.supabase` so other scripts can call
// `supabase.auth.*` as expected.
// Initialize the Supabase client. Some CDNs or caches might not have
// `createClient` available immediately; handle both cases.
function _initSupabaseClient(){
	try {
		if (typeof createClient !== 'undefined') {
			window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
			return Promise.resolve(window.supabase);
		}
	} catch(e){}

	// If createClient isn't present, dynamically load the UMD bundle and
	// initialize after it loads.
	return new Promise((resolve, reject) => {
		const existing = document.querySelector('script[data-supabase-umd]');
		if (existing) {
			existing.addEventListener('load', () => {
				try { window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY); resolve(window.supabase); } catch(err){reject(err)}
			});
			existing.addEventListener('error', reject);
			return;
		}

		const s = document.createElement('script');
		s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js';
		s.async = true;
		s.setAttribute('data-supabase-umd','1');
		s.onload = () => {
			try { window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY); resolve(window.supabase); } catch(err){reject(err)}
		};
		s.onerror = (e) => reject(e);
		document.head.appendChild(s);
	});
}

// Start initialization immediately. Consumers can wait on window.__supabaseReady
window.__supabaseReady = _initSupabaseClient();