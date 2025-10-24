let isFirebaseLoaded = false;

try {
    const appMod = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
    const authMod = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
    const firestoreMod = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
    
    const { initializeApp } = appMod;
    const { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } = authMod;
    const { getFirestore, doc, getDoc, setDoc, onSnapshot, setLogLevel } = firestoreMod;
    
    setLogLevel('Debug');
    isFirebaseLoaded = true;

    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

    let db, auth, userId = null;

    async function initFirebase() {
        try {
            const app = initializeApp(firebaseConfig);
            auth = getAuth(app);
            db = getFirestore(app);

            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                await signInAnonymously(auth);
            }

            onAuthStateChanged(auth, (user) => {
                if (user) {
                    userId = user.uid;
                    console.log("Firebase Auth berhasil. User ID:", userId);
                    window.db = db;
                    window.auth = auth;
                    window.userId = userId;
                    window.appId = appId;
                    window.doc = doc;
                    window.setDoc = setDoc;
                    window.onSnapshot = onSnapshot;
                    window.getDoc = getDoc;
                    window.signOut = signOut;
                    window.isFirebaseReady = true;
                    window.initAppLogic();
                } else {
                    window.isFirebaseReady = false;
                    window.initAppLogic();
                }
            });
        } catch (error) {
            console.error("Error in Firebase initialization:", error);
            window.isFirebaseReady = false;
            window.initAppLogic();
        }
    }

    window.onload = initFirebase;

} catch (e) {
    console.warn("Firebase modules failed to load. Running app in offline mode.");
    window.isFirebaseReady = false;
    window.onload = window.initAppLogic;
}

let currentMateriProgress = 0;
const materiModules = ['pegas-1', 'pegas-2', 'bandul-1', 'bandul-2'];

const showModal = (title, message, isConfirmation = false, onConfirm = () => {}) => {
    const modal = document.getElementById('custom-modal');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').textContent = message;
    const okBtn = document.getElementById('modal-ok-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    if (isConfirmation) {
        cancelBtn.classList.remove('hidden');
        okBtn.textContent = 'Ya, Lanjut';
        okBtn.onclick = () => { onConfirm(); modal.classList.remove('open'); modal.classList.add('hidden'); };
        cancelBtn.onclick = () => { modal.classList.remove('open'); modal.classList.add('hidden'); };
    } else {
        cancelBtn.classList.add('hidden');
        okBtn.textContent = 'OK';
        okBtn.onclick = () => { modal.classList.remove('open'); modal.classList.add('hidden'); };
    }

    // Ensure modal is visible: remove hidden then add open state
    modal.classList.remove('hidden');
    modal.classList.add('open');
};

const toggleAccordion = (id) => {
    const content = document.getElementById(id);
    const icon = document.getElementById(`icon-${id}`);
    if (content && icon) {
        content.classList.toggle('open');
        icon.classList.toggle('-rotate-180');
    }
};

const navigate = (pageId) => {
    console.log("Navigating to:", pageId, "Progress:", currentMateriProgress);
    if (pageId === 'vlab') {
        if (currentMateriProgress !== 100) {
            showModal(
                "Akses Ditolak",
                "Anda harus menyelesaikan semua materi belajar (100%) sebelum dapat mengakses Virtual Lab.",
                false
            );
            return;
        }
    }

    document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
    document.getElementById(pageId + '-page').classList.remove('hidden');

    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-button[data-page="${pageId}"]`).classList.add('active');

    if (window.isFirebaseReady === true && window.initAppLogic) {
        if (pageId === 'materi') {
            window.loadMateriProgress();
        } else if (pageId === 'quiz') {
            window.renderQuiz();
        } else if (pageId === 'profile') {
            window.loadUserProgress();
        }
    } else if (window.isFirebaseReady === false) {
        if (pageId === 'materi') {
            updateMateriDisplayOffline();
        } else if (pageId === 'profile') {
            updateProfileDisplayOffline();
        }
    }
};

// Bind UI handlers in a way that works even if this script runs after DOMContentLoaded
const setupTabAndAccordions = () => {
    document.querySelectorAll('.tab-button').forEach(btn => {
        // avoid duplicate handlers if called multiple times
        btn.replaceWith(btn.cloneNode(true));
    });

    // Re-select after cloning
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.addEventListener('click', () => navigate(btn.dataset.page));
    });

    document.querySelectorAll('.module-header').forEach(header => {
        // same clone-protect pattern for module headers
        header.replaceWith(header.cloneNode(true));
    });

    document.querySelectorAll('.module-header').forEach(header => {
        header.addEventListener('click', () => toggleAccordion(header.dataset.target));
    });

    navigate('materi');
};

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', setupTabAndAccordions);
} else {
    // DOM already ready — set up immediately
    setupTabAndAccordions();
}

const updateMateriDisplayOffline = () => {
    let readCount = 0;
    materiModules.forEach(module => {
        readCount++;
        const statusEl = document.getElementById(`status-${module}`);
        const btnEl = document.querySelector(`.materi-read-btn[data-module="${module}"]`);
        
        if (statusEl && btnEl) {
            statusEl.textContent = 'Mode Lokal ✔️';
            statusEl.className = 'text-xs ml-3 text-gray-500 font-semibold';
            btnEl.disabled = true;
            btnEl.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            btnEl.classList.add('bg-gray-400', 'cursor-not-allowed');
        }
    });
    
    currentMateriProgress = 100;
    document.getElementById('materi-progress-percent').textContent = `100% (Lokal)`;
    document.getElementById('materi-progress-fill').style.width = `100%`;
};

const updateProfileDisplayOffline = () => {
    document.getElementById('profile-user-id').textContent = 'MODE LOKAL/OFFLINE';
    document.getElementById('display-fullname').textContent = 'Pengguna Lokal';
    document.getElementById('display-username').textContent = '@lokal';
    document.getElementById('score-display').innerHTML = '<p class="text-red-500">Fitur skor tidak tersedia di mode lokal.</p>';
    document.getElementById('history-log').innerHTML = '<p class="text-red-500">Fitur riwayat tidak tersedia di mode lokal.</p>';
};

window.initAppLogic = () => {
    if (window.isFirebaseReady === false) {
        updateMateriDisplayOffline();
        updateProfileDisplayOffline();
        return;
    }
    
    const db = window.db;
    const auth = window.auth;
    let userId = window.userId;
    const appId = window.appId;
    const doc = window.doc;
    const setDoc = window.setDoc;
    const onSnapshot = window.onSnapshot;
    const getDoc = window.getDoc;
    const signOut = window.signOut;
    const userRef = doc(db, "artifacts", appId, "users", userId);

    const saveMateriProgress = async (moduleId) => {
        const updateData = {};
        updateData[`materi_read_${moduleId}`] = true;

        try {
            await setDoc(userRef, updateData, { merge: true });
            showModal("Progress Tersimpan", `Sub-Modul ${moduleId.toUpperCase()} berhasil ditandai sebagai sudah dibaca.`, false);
        } catch (error) {
            console.error("Gagal menyimpan progress materi:", error);
            showModal("Error", "Gagal menyimpan progress membaca.", false);
        }
    };

    const loadMateriProgress = () => {
        onSnapshot(userRef, (docSnap) => {
            const data = docSnap.data() || {};
            let readCount = 0;

            materiModules.forEach(module => {
                const isRead = data[`materi_read_${module}`] || false;
                const statusEl = document.getElementById(`status-${module}`);
                const btnEl = document.querySelector(`.materi-read-btn[data-module="${module}"]`);

                if (statusEl && btnEl) {
                    if (isRead) {
                        statusEl.textContent = 'Sudah dibaca ✔️';
                        statusEl.className = 'text-xs ml-3 text-green-600 font-semibold';
                        btnEl.disabled = true;
                        btnEl.classList.remove('bg-blue-500', 'hover:bg-blue-600');
                        btnEl.classList.add('bg-gray-400', 'cursor-not-allowed');
                        readCount++;
                    } else {
                        statusEl.textContent = 'Belum dibaca ❌';
                        statusEl.className = 'text-xs ml-3 text-red-500 font-semibold';
                        btnEl.disabled = false;
                        btnEl.classList.add('bg-blue-500', 'hover:bg-blue-600');
                        btnEl.classList.remove('bg-gray-400', 'cursor-not-allowed');
                    }
                }
            });

            const totalModules = materiModules.length;
            const percent = Math.round((readCount / totalModules) * 100);
            currentMateriProgress = percent;

            document.getElementById('materi-progress-percent').textContent = `${percent}%`;
            document.getElementById('materi-progress-fill').style.width = `${percent}%`;
        }, (error) => {
            console.error("Error loading materi progress:", error);
        });
    };
    window.loadMateriProgress = loadMateriProgress;

    document.querySelectorAll('.materi-read-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            saveMateriProgress(btn.dataset.module);
        });
    });

    const quizzes = {
        pegas: {
            title: "Tes Pegas (Osilasi GHS)",
            questions: [
                { q: "Periode GHS Pegas berbanding terbalik dengan akar kuadrat...", a: "Konstanta Pegas (k)", options: ["Massa Benda (m)", "Amplitudo (A)", "Konstanta Pegas (k)", "Percepatan Gravitasi (g)", "Kecepatan Awal (v₀)"] },
                { q: "Di titik simpangan maksimum (x=A), energi benda berbentuk...", a: "Energi Potensial", options: ["Energi Kinetik", "Energi Mekanik", "Energi Potensial", "Energi Termal"] },
                { q: "Jika Massa (m) pegas dikalikan 4, Periode (T) akan menjadi...", a: "2 kali lipat", options: ["2 kali lipat", "Setengah kali lipat", "4 kali lipat", "Tidak berubah"] },
                { q: "Bagaimana Amplitudo (A) mempengaruhi Periode (T) GHS murni?", a: "Tidak mempengaruhinya", options: ["Meningkatkan T", "Menurunkan T", "Meningkatkan T dua kali lipat", "Tidak mempengaruhinya"] },
                { q: "Di titik setimbang, total gaya yang bekerja pada benda adalah...", a: "Nol", options: ["Maksimum", "Nol", "Setengah dari maksimum"] }
            ]
        },
        bandul: {
            title: "Tes Bandul Matematis",
            questions: [
                { q: "Variabel yang TIDAK mempengaruhi periode Bandul Matematis adalah...", a: "Massa Bandul", options: ["Panjang tali (L)", "Gravitasi (g)", "Massa Bandul", "Sudut awal (θ₀)"] },
                { q: "Jika bandul dibawa ke planet dengan Gravitasi 4 kali lebih besar, periodenya akan menjadi...", a: "Setengah kali lipat", options: ["2 kali lipat", "Setengah kali lipat", "4 kali lipat", "Tetap sama"] },
                { q: "Syarat utama agar Gerak Bandul dianggap GHS adalah sudut ayunan...", a: "Sangat kecil (<15°)", options: ["Besar (>60°)", "Sangat kecil (<15°)", "Tepat 45°", "Bebas berapapun"] },
                { q: "Di mana kecepatan bandul mencapai maksimum?", a: "Titik setimbang", options: ["Titik simpangan tertinggi", "Titik setimbang", "Di tengah antara titik tertinggi dan setimbang"] },
                { q: "Periode Bandul berbanding lurus dengan...", a: "Akar kuadrat panjang tali", options: ["Panjang tali kuadrat", "Akar kuadrat panjang tali", "Panjang tali saja", "Kuadrat Gravitasi"] }
            ]
        },
        final: {
            title: "Tes Akhir GHS (Komprehensif)",
            questions: [
                { q: "Persamaan mana yang menggambarkan GHS?", a: "a ∝ -x", options: ["a ∝ x", "a ∝ -v", "a ∝ -x", "a ∝ v²"] },
                { q: "Di manakah Energi Potensial maksimum terjadi pada GHS?", a: "Titik simpangan terjauh", options: ["Titik setimbang", "Titik simpangan terjauh", "Setiap saat"] },
                { q: "Apakah Periode Bandul sama dengan Periode Pegas jika L=1m, g=10, k=10N/m, m=1kg?", a: "Ya", options: ["Ya", "Tidak, periode pegas lebih besar", "Tidak, periode bandul lebih besar"] },
                { q: "Dalam GHS, frekuensi adalah kebalikan dari...", a: "Periode", options: ["Amplitudo", "Kecepatan", "Percepatan", "Periode"] },
                { q: "Gaya pemulih pada GHS selalu berarah menuju...", a: "Titik setimbang", options: ["Titik simpangan maksimum", "Titik setimbang", "Tergantung arah kecepatan"] }
            ]
        }
    };

    const renderQuiz = (testId = null) => {
        const quizArea = document.getElementById('quiz-area');
        document.getElementById('quiz-results').classList.add('hidden');
        quizArea.innerHTML = '';

        if (!testId) {
            quizArea.innerHTML = '<p class="text-gray-500 text-center">Silakan pilih tes untuk memulai.</p>';
            return;
        }

        const test = quizzes[testId];
        if (!test) return;

        const maxScore = test.questions.length;
        let html = `<h4 class="text-xl font-bold mb-4 text-blue-700">${test.title} (5 Soal)</h4><form id="quiz-form" data-test-id="${testId}" class="space-y-6">`;

        test.questions.forEach((q, index) => {
            html += `
                <div class="p-4 border border-gray-200 rounded-lg">
                    <p class="font-semibold mb-3 text-gray-800">Soal ${index + 1}: ${q.q}</p>
                    <div class="space-y-2">
            `;
            q.options.forEach((option, optIndex) => {
                html += `
                    <label class="flex items-center space-x-2 text-gray-700 cursor-pointer hover:bg-gray-50 p-2 rounded-md">
                        <input type="radio" name="q${index}" value="${option}" required class="text-blue-600 focus:ring-blue-500">
                        <span>${option}</span>
                    </label>
                `;
            });
            html += `
                    </div>
                </div>
            `;
        });

        html += `<button type="submit" class="vlab-button bg-green-600 text-white hover:bg-green-700 w-full mt-4">Kumpulkan Jawaban</button></form>`;
        quizArea.innerHTML = html;

        document.getElementById('quiz-form').addEventListener('submit', handleQuizSubmit);
    };
    window.renderQuiz = renderQuiz;

    const handleQuizSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;
        const testId = form.dataset.testId;
        const test = quizzes[testId];
        const maxScore = test.questions.length;
        let score = 0;

        test.questions.forEach((q, index) => {
            const selected = form.querySelector(`input[name="q${index}"]:checked`);
            if (selected && selected.value === q.a) {
                score++;
            }
        });

        const resultText = `Anda mendapatkan skor: ${score} dari ${maxScore} soal.`;

        document.getElementById('quiz-score').textContent = resultText;
        document.getElementById('quiz-results').classList.remove('hidden');

        if (!window.isFirebaseReady) {
            showModal("Kuis Selesai (Mode Lokal)", `${resultText} Data tidak dapat disimpan di mode lokal/offline.`, false);
            return;
        }

        const newLogEntry = {
            testId: testId,
            score: score,
            maxScore: maxScore,
            timestamp: Date.now()
        };

        const maxScoreKey = `max_score_${testId}`;
        
        try {
            const docSnap = await getDoc(userRef);
            const currentData = docSnap.data() || {};
            
            const currentMaxScore = currentData[maxScoreKey] || 0;
            const newMaxScore = Math.max(currentMaxScore, score);

            const historyLogArray = currentData.history_log || [];
            historyLogArray.push(newLogEntry);
            if (historyLogArray.length > 50) {
                historyLogArray.sort((a, b) => b.timestamp - a.timestamp);
                historyLogArray.splice(50);
            }

            const updateData = {};
            updateData[maxScoreKey] = newMaxScore;
            updateData.history_log = historyLogArray;

            if (!currentData.fullName) updateData.fullName = 'Pengguna Baru';
            if (!currentData.username) updateData.username = 'Anonim';

            await setDoc(userRef, updateData, { merge: true });
            console.log("Skor dan Log berhasil disimpan di Firestore.");
            showModal("Kuis Selesai", `${resultText} Skor dan riwayat Anda telah disimpan!`, false);
        } catch (error) {
            console.error("Gagal menyimpan skor ke Firestore:", error);
            showModal("Error Simpan Skor", "Skor Anda berhasil dihitung, tetapi gagal disimpan di database. Cek konsol untuk detail.", false);
        }
    };

    document.querySelectorAll('.quiz-select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            renderQuiz(btn.dataset.test);
            document.getElementById('quiz-results').classList.add('hidden');
        });
    });

    const loadUserProgress = () => {
        const scoreDisplay = document.getElementById('score-display');
        const historyLog = document.getElementById('history-log');
        const displayFullname = document.getElementById('display-fullname');
        const displayUsername = document.getElementById('display-username');
        
        if (!window.isFirebaseReady) {
            updateProfileDisplayOffline();
            return;
        }
        
        document.getElementById('profile-user-id').textContent = userId;
        scoreDisplay.innerHTML = '<p>Memuat data skor...</p>';
        historyLog.innerHTML = '<p class="text-gray-500">Memuat riwayat tes...</p>';

        onSnapshot(userRef, (docSnap) => {
            const data = docSnap.data() || {};
            
            const savedFullName = data.fullName || 'Pengguna Baru';
            const savedUsername = data.username || 'Anonim';
            
            displayFullname.textContent = savedFullName;
            displayUsername.textContent = `@${savedUsername}`;

            const maxPegas = data.max_score_pegas !== undefined ? data.max_score_pegas : '--';
            const maxBandul = data.max_score_bandul !== undefined ? data.max_score_bandul : '--';
            const maxFinal = data.max_score_final !== undefined ? data.max_score_final : '--';

            scoreDisplay.innerHTML = `
                <p class="font-bold text-gray-800">Skor Tertinggi Tes Pegas: <span class="text-blue-600">${maxPegas} / 5</span></p>
                <p class="font-bold text-gray-800">Skor Tertinggi Tes Bandul: <span class="text-blue-600">${maxBandul} / 5</span></p>
                <p class="font-bold text-gray-800">Skor Tertinggi Tes Akhir: <span class="text-blue-600">${maxFinal} / 5</span></p>
            `;

            const history = data.history_log || [];
            if (history.length === 0) {
                historyLog.innerHTML = '<p class="text-gray-500">Belum ada riwayat tes yang tercatat.</p>';
                return;
            }

            history.sort((a, b) => b.timestamp - a.timestamp);

            historyLog.innerHTML = history.map(log => {
                const date = new Date(log.timestamp);
                const timeString = date.toLocaleString('id-ID', {
                    day: 'numeric', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                });
                const colorClass = log.score === log.maxScore ? 'text-green-600' : 'text-orange-500';

                return `
                    <div class="bg-white p-3 border-b border-gray-100 flex justify-between items-center text-sm">
                        <div>
                            <span class="font-semibold text-gray-800">${quizzes[log.testId].title}</span>
                            <p class="text-xs text-gray-500">${timeString}</p>
                        </div>
                        <span class="${colorClass} font-bold text-lg">${log.score} / ${log.maxScore}</span>
                    </div>
                `;
            }).join('');
        }, (error) => {
            console.error("Error loading progress:", error);
            scoreDisplay.innerHTML = '<p class="text-red-500">Gagal memuat skor. Cek koneksi internet.</p>';
            historyLog.innerHTML = '<p class="text-red-500">Gagal memuat riwayat.</p>';
        });
    };
    window.loadUserProgress = loadUserProgress;
    
    loadMateriProgress();
};

const canvas = document.getElementById('physicsCanvas');
const ctx = canvas.getContext('2d');
let animationFrameId;
let isRunning = false;
let mode = 'pegas';
let m, k, amplitudeVal, lengthVal, g, thetaMaxVal;
let displacement = 0.5, v = 0;
let theta, omega;
const dt = 0.01;

const drawSpring = (xCenter, startY, endY) => {
    const numCoils = 15;
    const coilWidth = 20;
    ctx.beginPath();
    ctx.moveTo(xCenter, startY);

    const dy = (endY - startY) / numCoils;
    for (let i = 1; i <= numCoils; i++) {
        const y = startY + i * dy;
        const xOffset = (i % 2 === 0) ? coilWidth : -coilWidth;
        if (i === numCoils) {
            ctx.lineTo(xCenter, y);
        } else {
            ctx.lineTo(xCenter + xOffset, y);
        }
    }
    ctx.stroke();
};

const initValues = () => {
    m = parseFloat(document.getElementById('mass-slider').value);
    k = parseFloat(document.getElementById('k-slider').value);
    amplitudeVal = parseFloat(document.getElementById('amp-slider').value);
    lengthVal = parseFloat(document.getElementById('length-slider').value);
    g = parseFloat(document.getElementById('g-slider').value);
    thetaMaxVal = parseFloat(document.getElementById('theta-slider').value) * (Math.PI / 180);

    displacement = amplitudeVal;
    v = 0;
    theta = thetaMaxVal;
    omega = 0;
    
    document.getElementById('omega-output').textContent = '--';
    document.getElementById('period-output').textContent = '--';
    document.getElementById('pos-output').textContent = '--';
    document.getElementById('vel-output').textContent = '--';
    document.getElementById('acc-output').textContent = '--';
    document.getElementById('ep-output').textContent = '--';
    document.getElementById('ek-output').textContent = '--';
    document.getElementById('et-output').textContent = '--';
    
    draw();
};

const draw = () => {
    const W = canvas.width;
    const H = canvas.height;
    const W_CENTER = W / 2;
    const H_CENTER = H / 2;

    ctx.clearRect(0, 0, W, H);
    
    if (mode === 'pegas') {
        document.getElementById('pos-unit').textContent = 'y'; document.getElementById('vel-unit').textContent = 'v'; document.getElementById('acc-unit').textContent = 'a';
        const equilibriumY = H_CENTER - 100; const blockHeight = 50;
        const currentY = equilibriumY + (displacement * 100);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(W_CENTER - 150, equilibriumY); ctx.lineTo(W_CENTER + 150, equilibriumY); ctx.stroke(); ctx.setLineDash([]);

        const springStart = 20; ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 3; drawSpring(W_CENTER, springStart, currentY);

        ctx.fillStyle = '#f97316'; ctx.fillRect(W_CENTER - 50, currentY, 100, blockHeight);
        ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 2; ctx.strokeRect(W_CENTER - 50, currentY, 100, blockHeight);

        ctx.fillStyle = 'white'; ctx.font = '16px Inter'; ctx.textAlign = 'center'; ctx.fillText(`M = ${m.toFixed(1)} kg`, W_CENTER, currentY + 30);
        ctx.fillStyle = 'white'; ctx.font = '14px Inter'; ctx.fillText(`Y = ${displacement.toFixed(3)} m`, W_CENTER, currentY + blockHeight + 20);

    } else {
        document.getElementById('pos-unit').textContent = 'θ'; document.getElementById('vel-unit').textContent = 'v'; document.getElementById('acc-unit').textContent = 'a';
        const pivotX = W_CENTER; const pivotY = 50;
        const scaledL = lengthVal * 150;
        const bobX = pivotX + scaledL * Math.sin(theta);
        const bobY = pivotY + scaledL * Math.cos(theta);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'; ctx.setLineDash([5, 5]); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(pivotX, H); ctx.stroke(); ctx.setLineDash([]);

        ctx.strokeStyle = '#9ca3af'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bobX, bobY); ctx.stroke();

        ctx.fillStyle = '#4b5563';
        ctx.beginPath(); ctx.arc(pivotX, pivotY, 8, 0, 2 * Math.PI); ctx.fill();

        const bobRadius = 25;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath(); ctx.arc(bobX, bobY, bobRadius, 0, 2 * Math.PI); ctx.fill();
        ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 2; ctx.stroke();

        ctx.fillStyle = 'white'; ctx.font = '16px Inter'; ctx.textAlign = 'center';
        ctx.fillText(`L = ${lengthVal.toFixed(1)} m`, pivotX - 50, pivotY + 20);
        ctx.fillText(`θ = ${(theta * 180 / Math.PI).toFixed(1)}°`, bobX, bobY - bobRadius - 10);
    }
};

const stopSimulationAndShowResults = () => {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
    document.getElementById('start-btn').textContent = 'Mulai Simulasi';
    
    if (mode === 'pegas') {
        const omega_val = Math.sqrt(k / m);
        const period_val = 2 * Math.PI / omega_val;
        document.getElementById('omega-output').textContent = omega_val.toFixed(3);
        document.getElementById('period-output').textContent = period_val.toFixed(3);
    } else {
        const omega_val = Math.sqrt(g / lengthVal);
        const period_val = 2 * Math.PI / omega_val;
        document.getElementById('omega-output').textContent = omega_val.toFixed(3);
        document.getElementById('period-output').textContent = period_val.toFixed(3);
    }
};

const updateSimulation = (timestamp) => {
    if (!isRunning) return;

    if (mode === 'pegas') {
        const a_calc = (-k * displacement) / m;
        v = v + a_calc * dt;
        displacement = displacement + v * dt;
        
        const EP = 0.5 * k * displacement * displacement;
        const EK = 0.5 * m * v * v;
        const ET = EP + EK;

        document.getElementById('pos-output').textContent = `${displacement.toFixed(3)} m`;
        document.getElementById('vel-output').textContent = `${v.toFixed(3)} m/s`;
        document.getElementById('acc-output').textContent = `${a_calc.toFixed(3)} m/s²`;
        document.getElementById('ep-output').textContent = EP.toFixed(3);
        document.getElementById('ek-output').textContent = EK.toFixed(3);
        document.getElementById('et-output').textContent = ET.toFixed(3);

    } else {
        const m_bob = 1;
        const alpha = - (g / lengthVal) * Math.sin(theta);

        omega = omega + alpha * dt;
        theta = theta + omega * dt;
        
        const y_height = lengthVal * (1 - Math.cos(theta));
        const a_calc = alpha * lengthVal;
        const v_linear = omega * lengthVal;

        const EP = m_bob * g * y_height;
        const EK = 0.5 * m_bob * v_linear * v_linear;
        const ET = EP + EK;

        document.getElementById('pos-output').textContent = `${(theta * 180 / Math.PI).toFixed(2)} °`;
        document.getElementById('vel-output').textContent = `${v_linear.toFixed(3)} m/s`;
        document.getElementById('acc-output').textContent = `${a_calc.toFixed(3)} m/s²`;
        document.getElementById('ep-output').textContent = EP.toFixed(3);
        document.getElementById('ek-output').textContent = EK.toFixed(3);
        document.getElementById('et-output').textContent = ET.toFixed(3);
    }

    draw();
    animationFrameId = requestAnimationFrame(updateSimulation);
};

const resizeCanvas = () => {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    initValues();
};

const setupVlabListeners = () => {
    document.getElementById('start-btn').addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            document.getElementById('start-btn').textContent = 'Berjalan...';
            document.getElementById('omega-output').textContent = '--';
            document.getElementById('period-output').textContent = '--';
            requestAnimationFrame(updateSimulation);
        }
    });
    
    document.getElementById('skip-btn').addEventListener('click', stopSimulationAndShowResults);

    document.getElementById('reset-btn').addEventListener('click', () => {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
        document.getElementById('start-btn').textContent = 'Mulai Simulasi';
        initValues();
    });

    const pegasControls = document.getElementById('pegas-controls');
    const bandulControls = document.getElementById('bandul-controls');
    document.getElementById('mode-pegas').addEventListener('click', () => {
        mode = 'pegas';
        pegasControls.classList.remove('hidden'); bandulControls.classList.add('hidden');
        document.getElementById('mode-pegas').classList.add('bg-blue-500', 'text-white'); document.getElementById('mode-pegas').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('mode-bandul').classList.remove('bg-blue-500', 'text-white'); document.getElementById('mode-bandul').classList.add('bg-gray-200', 'text-gray-700');
        document.getElementById('reset-btn').click();
    });
    document.getElementById('mode-bandul').addEventListener('click', () => {
        mode = 'bandul';
        pegasControls.classList.add('hidden'); bandulControls.classList.remove('hidden');
        document.getElementById('mode-bandul').classList.add('bg-blue-500', 'text-white'); document.getElementById('mode-bandul').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('mode-pegas').classList.remove('bg-blue-500', 'text-white'); document.getElementById('mode-pegas').classList.add('bg-gray-200', 'text-gray-700');
        document.getElementById('reset-btn').click();
    });

    const updateSlider = (id, displayId) => {
        document.getElementById(id).addEventListener('input', (e) => {
            document.getElementById(displayId).textContent = parseFloat(e.target.value).toFixed(2);
            if (!isRunning) initValues();
        });
    };
    updateSlider('mass-slider', 'm-val'); updateSlider('k-slider', 'k-val'); updateSlider('amp-slider', 'a-val');
    updateSlider('length-slider', 'l-val'); updateSlider('theta-slider', 'theta-val'); updateSlider('g-slider', 'g-val');

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    initValues();
};

window.addEventListener('DOMContentLoaded', setupVlabListeners);