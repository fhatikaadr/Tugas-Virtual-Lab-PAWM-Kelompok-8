
const SUPABASE_URL = 'https://odydiimcgbhownbtzueb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keWRpaW1jZ2Job3duYnR6dWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMjY0NDQsImV4cCI6MjA3NjkwMjQ0NH0.tDsPXUF86-MVuUkwnEFblpmRzreC2SsbPg0YBpOPZIo';

function _initSupabaseClient(){
	try {
		if (typeof createClient !== 'undefined') {
			window.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
			return Promise.resolve(window.supabase);
		}
	} catch(e){}

	try {
		if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
			window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
			return Promise.resolve(window.supabase);
		}
	} catch(e){}

	return new Promise((resolve, reject) => {
		const tryScript = (src) => new Promise((res, rej) => {
			const existing = document.querySelector('script[data-supabase-umd][src="' + src + '"]');
			if (existing) {
				existing.addEventListener('load', () => {
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

		tryScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js')
			.then(resolve)
			.catch((err) => {
				window.__supabaseInitError = err && err.message ? err.message : String(err);
				reject(err);
			});
	});
}

window.__supabaseReady = _initSupabaseClient();