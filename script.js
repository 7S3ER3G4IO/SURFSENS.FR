document.addEventListener('DOMContentLoaded', () => {

    // --- Hardcore Security & Console Obfuscation ---
    // Disable right-click
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Disable DevTools shortcuts (F12, Inspect, View Source etc)
    document.addEventListener('keydown', e => {
        if (e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.metaKey && e.altKey && (e.key === 'I' || e.key === 'J' || e.key === 'U')) ||
            (e.ctrlKey && e.key === 'U')) {
            e.preventDefault();
        }
    });

    // Obfuscate Console
    const noop = () => { };
    if (typeof window.console !== 'undefined') {
        window.console.log = noop;
        window.console.warn = noop;
        window.console.info = noop;
        window.console.error = noop;
        window.console.table = noop;
        window.console.dir = noop;
    }

    // Secure Data Helpers
    const getLeadsData = () => {
        try {
            const data = localStorage.getItem('_sf_ss_p'); // Obfuscated key name
            if (!data) return [];
            return JSON.parse(decodeURIComponent(escape(atob(data))));
        } catch (e) { return []; }
    };

    const setLeadsData = (leads) => {
        localStorage.setItem('_sf_ss_p', btoa(unescape(encodeURIComponent(JSON.stringify(leads)))));
    };

    // --- Dark Mode Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    // Modified to handle span instead of i, and safely check if themeToggle exists
    const icon = themeToggle ? themeToggle.querySelector('span, i') : null;

    function setTheme(isDark) {
        if (!icon) return;
        if (isDark) {
            htmlElement.setAttribute('data-theme', 'dark');
            icon.textContent = 'light_mode'; // if using material symbols span
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            icon.textContent = 'dark_mode';
        }
    }

    // Auto dark mode for early morning (e.g. before 8 AM or after 8 PM)
    const currentHour = new Date().getHours();
    let isAutoDark = false;
    // Check if early morning session (e.g., 0 to 8) or evening (20 to 24)
    if (currentHour < 8 || currentHour >= 20) {
        isAutoDark = true;
    }

    if (themeToggle) {
        setTheme(isAutoDark);

        themeToggle.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            setTheme(currentTheme !== 'dark');
            updateChartConfig(); // Update chart colors dynamically
        });
    }

    // --- Tide Line Chart Logic ---
    const tideChartCanvas = document.getElementById('tideChart');
    const ctx = tideChartCanvas ? tideChartCanvas.getContext('2d') : null;

    let chartInstance;

    function getChartColors() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            grid: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            text: isDark ? '#9CA3AF' : '#4B5563',
            line: isDark ? '#3B82F6' : '#00509D',
            fill: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 80, 157, 0.2)'
        };
    }

    function initChart() {
        if (typeof Chart === 'undefined' || !ctx) return; // Check if Chart.js is loaded
        const colors = getChartColors();

        // Mock tide data over 24 hours
        const labels = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '23:59'];
        const data = [2.1, 1.2, 0.8, 2.5, 3.1, 2.0, 0.9, 2.8, 3.2];

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Niveau d'eau (m)",
                    data: data,
                    borderColor: colors.line,
                    backgroundColor: colors.fill,
                    borderWidth: 3,
                    tension: 0.4, // Smoothes the curve
                    fill: true,
                    pointBackgroundColor: '#FF7B00',
                    pointBorderColor: '#fff',
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: colors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: colors.text
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: colors.text
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        });
    }

    function updateChartConfig() {
        if (!chartInstance) return;
        const colors = getChartColors();
        chartInstance.data.datasets[0].borderColor = colors.line;
        chartInstance.data.datasets[0].backgroundColor = colors.fill;
        chartInstance.options.scales.x.ticks.color = colors.text;
        chartInstance.options.scales.y.ticks.color = colors.text;
        chartInstance.options.scales.y.grid.color = colors.grid;
        chartInstance.update();
    }

    initChart();

    // --- Admin Panel Shortcut Logic ---
    // Listen for Cmd + Shift + A (Mac) or Ctrl + Shift + A (Win) to redirect to the admin panel
    document.addEventListener('keydown', (event) => {
        if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'a') {
            event.preventDefault(); // Prevent any default browser action
            window.location.href = 'admin.html';
        }
    });

    // --- Global Auth Modal Logic ---
    const authModal = document.getElementById('auth-modal');
    const authModalContent = document.getElementById('auth-modal-content');
    const closeAuthBtn = document.getElementById('close-auth');
    const navLoginBtn = document.getElementById('nav-login-btn');
    const navRegisterBtn = document.getElementById('nav-register-btn');

    const authForm = document.getElementById('global-auth-form');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const nameField = document.getElementById('name-field');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleBtn = document.getElementById('auth-toggle-btn');
    const authSuccess = document.getElementById('auth-success');

    let isLoginMode = true; // Default state

    function openModal(mode) {
        if (!authModal) return;

        isLoginMode = mode === 'login';
        updateModalUI();

        // Show modal with animation
        authModal.classList.remove('hidden');
        authModal.classList.add('flex');

        // Trigger reflow for animation
        void authModal.offsetWidth;

        authModal.classList.remove('opacity-0');
        authModalContent.classList.remove('scale-95', 'opacity-0');
        authModalContent.classList.add('scale-100', 'opacity-100');
    }

    function closeModal() {
        if (!authModal) return;

        authModal.classList.add('opacity-0');
        authModalContent.classList.remove('scale-100', 'opacity-100');
        authModalContent.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            authModal.classList.add('hidden');
            authModal.classList.remove('flex');
            // Reset form
            if (authForm) authForm.reset();
            if (authSuccess) authSuccess.classList.add('hidden', 'opacity-0');

            // Custom resetting for the 2FA views
            const mainView = document.getElementById('auth-main-view');
            const faView = document.getElementById('auth-2fa-view');
            const faForm = document.getElementById('form-2fa');
            const icon = document.getElementById('success-icon');

            if (mainView) mainView.classList.remove('hidden');
            if (faView) {
                faView.classList.add('hidden');
                faView.classList.remove('flex');
            }
            if (faForm) faForm.reset();
            if (icon) icon.classList.remove('scale-100');

            pendingUser = null;
        }, 300);
    }

    function updateModalUI() {
        if (isLoginMode) {
            authTitle.textContent = "Bon Retour";
            authSubtitle.textContent = "Connectez-vous pour accéder à vos prévisions.";
            if (nameField) nameField.classList.add('hidden');
            document.getElementById('auth-name').removeAttribute('required');
            submitBtn.textContent = "Se connecter";
            toggleText.textContent = "Pas encore de compte ?";
            toggleBtn.textContent = "S'inscrire";
        } else {
            authTitle.textContent = "Rejoindre SWELLSYNC";
            authSubtitle.textContent = "Accédez aux prévisions 100% fiables en temps réel.";
            if (nameField) nameField.classList.remove('hidden');
            document.getElementById('auth-name').setAttribute('required', 'true');
            submitBtn.innerHTML = 'Créer mon compte <span class="material-symbols-outlined text-lg">arrow_forward</span>';
            toggleText.textContent = "Déjà un compte ?";
            toggleBtn.textContent = "Se connecter";
        }
    }

    // Event Listeners
    if (navLoginBtn) navLoginBtn.addEventListener('click', () => openModal('login'));
    if (navRegisterBtn) navRegisterBtn.addEventListener('click', () => openModal('register'));
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeModal);

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode;
            updateModalUI();
        });
    }

    // --- Check logged in state ---
    function checkLoginState() {
        const loggedUser = localStorage.getItem('surfsens_logged_in_user');
        if (loggedUser) {
            const user = JSON.parse(loggedUser);
            // Hide auth buttons safely
            if (navLoginBtn) {
                navLoginBtn.style.display = 'none';
                navLoginBtn.classList.remove('sm:flex');
            }
            if (navRegisterBtn) navRegisterBtn.style.display = 'none';

            const authContainer = navLoginBtn ? navLoginBtn.parentElement : null;
            if (authContainer) {
                const existing = document.getElementById('user-profile-nav');
                if (existing) existing.remove();

                const fragment = document.createElement('div');
                fragment.id = 'user-profile-nav';
                fragment.className = 'flex items-center gap-3 bg-slate-100 dark:bg-slate-800 py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-700 animate-slide-down';
                const displayName = user.name || user.email.split('@')[0];
                let initials = 'U';
                if (displayName.length > 0) initials = displayName.charAt(0);

                fragment.innerHTML = `
                    <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">${initials}</div>
                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:block">${displayName}</span>
                    <button id="nav-logout-btn" class="text-slate-400 hover:text-rose-500 ml-1 transition-colors flex items-center" title="Se déconnecter"><span class="material-symbols-outlined text-[18px]">logout</span></button>
                `;

                authContainer.insertBefore(fragment, navLoginBtn);

                document.getElementById('nav-logout-btn').addEventListener('click', () => {
                    localStorage.removeItem('surfsens_logged_in_user');
                    window.location.reload();
                });
            }
        }
    }

    // Call it immediately
    checkLoginState();

    // --- Auth Transition Logic ---
    let pendingUser = null;

    function trigger2FA(email, name, method) {
        pendingUser = { email: email || method.toLowerCase().trim() + '@surfsens.pro', name: name || 'Utilisateur ' + method.trim() };

        // Update 2FA instruction text intelligently
        const faMsg = document.getElementById('2fa-message');
        if (faMsg) {
            if (email && email.includes('@')) {
                faMsg.innerHTML = `Un code a été envoyé à <b>${email}</b><br>Vérifiez vos emails.`;
            } else if (email) { // phone number heuristic if not an email
                faMsg.innerHTML = `Un SMS a été envoyé au <b>${email}</b>.`;
            } else {
                faMsg.innerHTML = `Validez avec votre compte <b>${method}</b> via votre appareil sécurisé.`;
            }
        }

        // Hide Main View, Show 2FA
        const main = document.getElementById('auth-main-view');
        const fView = document.getElementById('auth-2fa-view');

        if (main) main.classList.add('hidden');
        if (fView) {
            fView.classList.remove('hidden');
            fView.classList.add('flex');
        }

        // Auto-focus first digit
        const inputs = document.querySelectorAll('.2fa-input');
        if (inputs.length) setTimeout(() => inputs[0].focus(), 50);
    }

    // Auth Form Submission triggers 2FA
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            let name = document.getElementById('auth-name').value;
            if (!name && isLoginMode) name = email.split('@')[0];

            trigger2FA(email, name, 'form');
        });
    }

    // Social buttons trigger 2FA
    document.querySelectorAll('.social-login-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.textContent.trim();
            trigger2FA(null, null, method);
        });
    });

    // 2FA Back button
    const backBtn = document.getElementById('back-to-auth');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            const main = document.getElementById('auth-main-view');
            const fView = document.getElementById('auth-2fa-view');
            if (main) main.classList.remove('hidden');
            if (fView) {
                fView.classList.add('hidden');
                fView.classList.remove('flex');
            }
            pendingUser = null;
        });
    }

    // 2FA Input logic (auto advance & backspace)
    const inputs2fa = document.querySelectorAll('.2fa-input');
    inputs2fa.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Auto capitalize or allow numeric
            if (e.target.value.length === 1) {
                if (index < inputs2fa.length - 1) inputs2fa[index + 1].focus();
            }
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
                inputs2fa[index - 1].focus();
            }
        });
    });

    // 2FA Form submit (Actual Login complete)
    const form2fa = document.getElementById('form-2fa');
    if (form2fa) {
        form2fa.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!pendingUser) return;

            const email = pendingUser.email;
            const name = pendingUser.name;

            // Save to the leads pool for Admin using secure helpers
            let leads = getLeadsData();

            // Migrate old leads if they exist
            if (leads.length === 0) {
                try {
                    const oldLeads = JSON.parse(localStorage.getItem('surfsens_leads') || '[]');
                    if (oldLeads.length > 0) {
                        leads = oldLeads;
                        localStorage.removeItem('surfsens_leads');
                    }
                } catch (e) { }
            }

            const existingLeadIndex = leads.findIndex(l => l.email === email);

            if (existingLeadIndex === -1) {
                leads.push({
                    name: name || 'Utilisateur',
                    email: email,
                    date: new Date().toISOString(),
                    status: 'Active'
                });
                setLeadsData(leads);
            } else if (!isLoginMode && name) {
                leads[existingLeadIndex].name = name;
                setLeadsData(leads);
            }

            // Set current user session
            localStorage.setItem('surfsens_logged_in_user', JSON.stringify({
                name: name,
                email: email
            }));

            // Show Success overlay
            const successOverlay = document.getElementById('auth-success');
            if (successOverlay) {
                successOverlay.classList.remove('hidden');
                void successOverlay.offsetWidth;
                successOverlay.classList.remove('opacity-0');
            }

            // Icon pop 
            const successIcon = document.getElementById('success-icon');
            if (successIcon) setTimeout(() => successIcon.classList.add('scale-100'), 100);

            setTimeout(() => {
                closeModal();
                checkLoginState(); // Update Navbar automatically
            }, 1800);
        });
    }

    // Close modal on click outside
    if (authModal) {
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) closeModal();
        });
    }

});
