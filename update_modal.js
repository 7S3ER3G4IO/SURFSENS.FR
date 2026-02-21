const fs = require('fs');

const files = [
    'index.html',
    'actus.html',
    'webcams.html',
    'map.html',
    'hossegor.html',
    'biarritz.html',
    'latorche.html',
    'seignosse.html',
    'admin.html'
];

const modalHTML = `<!-- Global Auth Modal -->
    <div id="auth-modal" class="fixed inset-0 z-[100] hidden items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 transition-opacity duration-300">
        <div class="relative w-full max-w-md transform rounded-2xl bg-white dark:bg-slate-900 shadow-2xl transition-all scale-95 opacity-0" id="auth-modal-content">
            
            <!-- Close Button -->
            <button id="close-auth" class="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 z-20">
                <span class="material-symbols-outlined">close</span>
            </button>

            <div class="p-8 relative">
                <!-- Main Auth View -->
                <div id="auth-main-view">
                    <!-- Header -->
                    <div class="text-center mb-6">
                        <img src="images/logo.svg" alt="SWELLSYNC" class="w-12 h-12 mx-auto mb-4" />
                        <h3 id="auth-title" class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Rejoindre SWELLSYNC</h3>
                        <p id="auth-subtitle" class="text-sm text-slate-500">Accédez aux prévisions 100% fiables.</p>
                    </div>

                    <!-- Social Login -->
                    <div class="grid grid-cols-2 gap-3 mb-6">
                        <button type="button" class="social-login-btn flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5" alt="Google">
                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Google</span>
                        </button>
                        <button type="button" class="social-login-btn flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                            <img src="https://www.svgrepo.com/show/511330/apple-173.svg" class="w-5 h-5 dark:invert" alt="Apple">
                            <span class="text-xs font-bold text-slate-700 dark:text-slate-300">Apple</span>
                        </button>
                    </div>

                    <div class="relative flex py-2 items-center mb-6">
                        <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                        <span class="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold">OU PAR EMAIL / SMS</span>
                        <div class="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                    </div>

                    <!-- Auth Form -->
                    <form id="global-auth-form" class="space-y-4">
                        <div id="name-field" class="hidden">
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Nom Complet</label>
                            <input type="text" id="auth-name" class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white transition-colors" placeholder="John Doe">
                        </div>
                        
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Email ou Téléphone</label>
                            <input type="text" id="auth-email" required class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white transition-colors" placeholder="vous@exemple.com ou 06...">
                        </div>

                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Mot de passe</label>
                                <a href="#" class="text-xs text-primary hover:underline font-medium">Oublié ?</a>
                            </div>
                            <input type="password" id="auth-password" class="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary text-slate-900 dark:text-white transition-colors" placeholder="••••••••">
                        </div>

                        <button type="submit" id="auth-submit-btn" class="w-full py-3.5 bg-primary hover:bg-[#0b6bc9] text-white rounded-lg font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 mt-6 flex justify-center items-center gap-2">
                            Continuer <span class="material-symbols-outlined text-lg">arrow_forward</span>
                        </button>
                    </form>

                    <!-- Footer Toggle -->
                    <div class="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
                        <span id="auth-toggle-text">Déjà un compte ?</span>
                        <button id="auth-toggle-btn" class="text-primary font-bold hover:underline ml-1">Se connecter</button>
                    </div>
                </div>

                <!-- 2FA View (Hidden by default) -->
                <div id="auth-2fa-view" class="hidden flex-col items-center animate-slide-down">
                    <button type="button" id="back-to-auth" class="absolute left-6 top-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 text-sm font-semibold">
                        <span class="material-symbols-outlined text-lg">arrow_back</span> Retour
                    </button>
                    
                    <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 mt-4">
                        <span class="material-symbols-outlined text-3xl text-primary">lock_person</span>
                    </div>
                    <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Vérification A2F</h4>
                    <p class="text-sm text-slate-500 text-center mb-6" id="2fa-message">Un code à 6 chiffres a été envoyé pour sécuriser votre connexion.</p>
                    
                    <form id="form-2fa" class="w-full space-y-4">
                        <div class="flex gap-2 justify-center mb-4 text-slate-900 dark:text-white">
                            <input type="text" maxlength="1" class="2fa-input w-12 h-14 text-center text-2xl font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                            <input type="text" maxlength="1" class="2fa-input w-12 h-14 text-center text-2xl font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                            <input type="text" maxlength="1" class="2fa-input w-12 h-14 text-center text-2xl font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                            <input type="text" maxlength="1" class="2fa-input w-12 h-14 text-center text-2xl font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                            <input type="text" maxlength="1" class="2fa-input w-12 h-14 text-center text-2xl font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                            <input type="text" maxlength="1" class="2fa-input w-12 h-14 text-center text-2xl font-bold rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors">
                        </div>
                        <button type="submit" class="w-full py-3.5 bg-primary hover:bg-[#0b6bc9] text-white rounded-lg font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 flex justify-center items-center gap-2">
                            <span class="material-symbols-outlined text-lg">verified</span> Valider le code
                        </button>
                    </form>
                    <button class="text-sm font-medium text-slate-500 hover:text-primary transition-colors mt-6">Renvoyer le code</button>
                </div>
            </div>
            
            <!-- Success Overlay -->
            <div id="auth-success" class="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center hidden opacity-0 transition-opacity duration-300 z-50">
                <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 scale-0 transition-transform duration-500" id="success-icon">
                    <span class="material-symbols-outlined text-3xl text-emerald-500">check_circle</span>
                </div>
                <h4 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Authentification Réussie</h4>
                <p class="text-sm text-slate-500 mb-6">Redirection sécurisée...</p>
                <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
    </div>
`;


files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const parts = content.split('<!-- Global Auth Modal -->');
    if (parts.length > 1) {
        const postModal = parts[1].substring(parts[1].indexOf('</body>'));
        content = parts[0] + modalHTML + '\n' + postModal;
        fs.writeFileSync(file, content);
        console.log("Updated", file);
    }
});
