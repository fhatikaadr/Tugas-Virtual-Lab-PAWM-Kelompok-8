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
	// Preferred fast path: if a global createClient exists (some UMD builds)
	try {
		if (typeof createClient !== 'undefined') {
			window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
			return Promise.resolve(window.supabase);
		}
	} catch(e){}

	// If window.supabase namespace already exists and exposes createClient (UMD namespace),
	// call it to produce a client instance and assign back to window.supabase.
	try {
		if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
			// note: this will replace the namespace with the client instance
			window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
			return Promise.resolve(window.supabase);
		}
	} catch(e){}

	// Fallback: load a stable UMD bundle from CDN (avoid dynamic +esm imports that can be rewritten to invalid optimized paths)
	return new Promise((resolve, reject) => {
		const tryScript = (src) => new Promise((res, rej) => {
			const existing = document.querySelector('script[data-supabase-umd][src="' + src + '"]');
			if (existing) {
				existing.addEventListener('load', () => {
					try {
						// After UMD loaded, the global may be either createClient or a supabase namespace
						if (typeof createClient !== 'undefined') {
							window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
							return res(window.supabase);
						}
						if (window.supabase && typeof window.supabase.createClient === 'function') {
							window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
							return res(window.supabase);
						}
						rej(new Error('Loaded script but createClient/supabase.createClient not found'));
					} catch(err){ rej(err); }
				});
				existing.addEventListener('error', rej);
				return;
			}

			const s = document.createElement('script');
			s.src = src;
			s.async = true;
			s.setAttribute('data-supabase-umd','1');
			s.onload = () => {
				try {
					if (typeof createClient !== 'undefined') {
						window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
						return res(window.supabase);
					}
					if (window.supabase && typeof window.supabase.createClient === 'function') {
						window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
						return res(window.supabase);
					}
					rej(new Error('Loaded script but createClient/supabase.createClient not found'));
				} catch(err){ rej(err); }
			};
			s.onerror = (e) => rej(new Error('Failed to load script: ' + src));
			document.head.appendChild(s);
		});

		// Try a known stable UMD CDN first. jsDelivr UMD path is reliable for browser usage.
		tryScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js')
			.then(resolve)
			.catch((err) => {
				// Attach error for debugging and reject
				window.__supabaseInitError = err && err.message ? err.message : String(err);
				reject(err);
			});
	});
}

// Start initialization immediately. Consumers can wait on window.__supabaseReady
window.__supabaseReady = _initSupabaseClient();