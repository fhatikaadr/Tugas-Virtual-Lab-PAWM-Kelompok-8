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

		// If createClient isn't present, try to dynamically load a UMD bundle.
		// Try a local copy first (/src/js/supabase.min.js) so deployments that
		// block the CDN still work. If local isn't present or fails, fall back
		// to the CDN.
		return new Promise((resolve, reject) => {
			const tryScript = (src) => new Promise((res, rej) => {
				const existing = document.querySelector('script[data-supabase-umd][src="' + src + '"]');
				if (existing) {
					if (typeof createClient !== 'undefined') {
						try { window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY); res(window.supabase); } catch(e){ rej(e); }
						return;
					}
					existing.addEventListener('load', () => {
						try { window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY); res(window.supabase); } catch(err){ rej(err); }
					});
					existing.addEventListener('error', rej);
					return;
				}

				const s = document.createElement('script');
				s.src = src;
				s.async = true;
				s.setAttribute('data-supabase-umd','1');
				s.onload = () => {
					try { window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY); res(window.supabase); } catch(err){ rej(err); }
				};
				s.onerror = (e) => rej(new Error('Failed to load script: ' + src));
				document.head.appendChild(s);
			});

				// Prefer dynamic ESM imports for local files (some local copies are ESM).
				// Try dynamic import of a local ESM first; if that fails, try the UMD bundle
				// from a CDN, and finally fall back to dynamic ESM import (+esm) from the CDN.
				const tryImport = (src) => import(src)
					.then((m) => {
						if (m && typeof m.createClient === 'function') {
							window.supabase = m.createClient(SUPABASE_URL, SUPABASE_KEY);
							return window.supabase;
						}
						throw new Error('Imported module loaded but createClient not found: ' + src);
					});

				// 1) Try dynamic import of local ESM (works if /src/js/supabase.min.js is an ESM bundle)
				tryImport('/src/js/supabase.min.js')
					.catch(() => {
						// 2) If local ESM fails, try to load a UMD bundle via script tag from a CDN
						// Use the UMD build path which should expose a global createClient.
						return tryScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
					})
					.catch(() => {
						// 3) As a last resort attempt dynamic ESM import from jsdelivr (+esm).
						return import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
							.then((m) => {
								if (m && typeof m.createClient === 'function') {
									window.supabase = m.createClient(SUPABASE_URL, SUPABASE_KEY);
									return window.supabase;
								}
								throw new Error('ESM import succeeded but createClient not found');
							});
					})
					.then(resolve)
					.catch((err) => {
						// Attach error to a global for debugging and reject.
						window.__supabaseInitError = err && err.message ? err.message : String(err);
						reject(err);
					});
		});
}

// Start initialization immediately. Consumers can wait on window.__supabaseReady
window.__supabaseReady = _initSupabaseClient();