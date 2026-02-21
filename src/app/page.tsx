'use client';

import { useState } from 'react';
import { sanitizeInput } from '@/lib/security';
import { ShieldCheck, Waves, Wind, Navigation, AlertTriangle } from 'lucide-react';

export default function Home() {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{ id: number; text: string; date: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // SECURITY AT WORK: Sanitize the raw input directly here before it gets to the state/backend
    const safeComment = sanitizeInput(comment);

    if (safeComment.trim()) {
      setComments([
        ...comments,
        { id: Date.now(), text: safeComment, date: new Date().toLocaleTimeString() }
      ]);
      setComment('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Waves className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-100 to-neutral-500">
              SurfReport <span className="text-cyan-400">FR</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 px-4 py-2 rounded-full border border-emerald-400/20">
            <ShieldCheck className="w-4 h-4" />
            <span>Connexion Sécurisée</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Main Content: Surf Spots */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-3xl font-light mb-6">Spots en direct (Hossegor)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Card 1 */}
              <div className="group relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-1 hover:border-cyan-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-800 mb-4">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center brightness-75 group-hover:scale-105 group-hover:brightness-100 transition-all duration-700" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-sm font-medium border border-white/10 text-emerald-400 flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Épique
                    </span>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <h3 className="text-xl font-medium mb-3">La Gravière</h3>
                  <div className="flex items-center gap-6 text-neutral-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-cyan-400" />
                      <span className="text-neutral-200">2.5m - 3.0m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-cyan-400" />
                      <span>Offshore (Est)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 p-1 hover:border-cyan-500/50 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-48 rounded-2xl overflow-hidden bg-neutral-800 mb-4">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1415025148099-17fecefee049?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center brightness-75 group-hover:scale-105 group-hover:brightness-100 transition-all duration-700" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-sm font-medium border border-white/10 text-amber-400">
                      Moyen
                    </span>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <h3 className="text-xl font-medium mb-3">Les Estagnots</h3>
                  <div className="flex items-center gap-6 text-neutral-400 text-sm">
                    <div className="flex items-center gap-2">
                      <Waves className="w-4 h-4 text-cyan-400" />
                      <span className="text-neutral-200">1.0m - 1.5m</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-rose-400" />
                      <span>Onshore (Ouest)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>

        {/* Sidebar: Demo de Sécurité XSS & CSRF */}
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full" />

            <div className="flex items-start gap-3 mb-6">
              <div className="mt-1 p-2 bg-neutral-800 rounded-lg text-cyan-400 border border-neutral-700">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium">Test de Sécurité: Injection XSS</h3>
                <p className="text-sm text-neutral-400 mt-1 pb-4">
                  Essayez d'injecter ce script dans le formulaire :<br /><br />
                  <code className="bg-black text-rose-400 px-2 py-1 rounded-md text-xs border border-rose-900/50">
                    &lt;script&gt;alert('test')&lt;/script&gt;
                  </code>
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              <div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Laissez un rapport de session..."
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-sm text-neutral-200 placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all resize-none h-24"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-white text-black font-medium py-3 rounded-xl hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation className="w-4 h-4" /> Publier
              </button>
            </form>

            {/* Comments List */}
            <div className="mt-8 space-y-4">
              {comments.map((c) => (
                <div key={c.id} className="bg-neutral-950/50 border border-neutral-800 rounded-lg p-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-neutral-500 font-mono">{c.date}</span>
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                  </div>
                  {/* Notice that we are safely rendering the text. If they injected HTML, it's stripped out. */}
                  <p className="text-sm text-neutral-300 break-words">{c.text || <span className="text-neutral-600 italic">[Script bloqué par l'antisepsie]</span>}</p>
                </div>
              ))}
            </div>

          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 text-rose-400 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-medium">Protections Actives</h3>
            </div>
            <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-5 mt-4">
              <li>Header <strong>CSP</strong> : Empêche le chargement de scripts externes non validés.</li>
              <li><strong>Rate Limiting</strong> : Bloque l'IP après 100 requêtes dans la minute (Proxy Next.js).</li>
              <li><strong>Anti-CSRF</strong> : Vérification stricte des "Origins" sur les requêtes POST.</li>
              <li><strong>Sanitization (DOMPurify)</strong> : Nettoyage total du HTML en entrée.</li>
            </ul>
          </div>
        </div>

      </main>
    </div>
  );
}
