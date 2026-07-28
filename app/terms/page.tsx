import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Orphic",
  description: "Read the Terms of Service governing your use of Orphic autonomous workflows and service integrations.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0D0A06] text-amber-50/90 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background radial ambient glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_center,#C47A2B15,transparent_50%)]" />

      {/* Header / Navbar */}
      <header className="relative z-10 border-b border-white/10 bg-[#0D0A06]/80 backdrop-blur-md sticky top-0">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-amber-500 font-serif text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            <span>◈</span>
            <span className="text-white font-sans font-semibold">Orphic</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-amber-200/70">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-wider mb-4">
            Terms & Guidelines
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-amber-200/70 text-sm">
            Last updated: July 28, 2026 · Effective immediately
          </p>
        </div>

        <div className="space-y-10 text-base leading-relaxed text-amber-100/80">
          {/* Section 1 */}
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                01
              </span>
              <h2 className="text-xl font-semibold text-white">Provision of Service</h2>
            </div>
            <p>
              Orphic is provided <strong className="text-white">&quot;as-is&quot;</strong> for personal productivity and automated workflow execution. While we strive for maximum reliability and seamless integration, we offer no warranties regarding continuous availability or error-free execution.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                02
              </span>
              <h2 className="text-xl font-semibold text-white">User Responsibility</h2>
            </div>
            <p>
              You are solely responsible for the actions, commands, and content generated or executed through your connected third-party accounts (such as GitHub, Slack, Notion, Gmail, and Google Drive). Always review automated actions prior to execution where applicable.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                03
              </span>
              <h2 className="text-xl font-semibold text-white">Termination & Misuse</h2>
            </div>
            <p>
              We reserve the right to suspend or terminate access to Orphic immediately and without prior notice in the event of misuse, unauthorized API scraping, rate-limit abuse, or malicious activity.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                04
              </span>
              <h2 className="text-xl font-semibold text-white">Contact & Support</h2>
            </div>
            <p className="mb-4">
              For questions, terms inquiries, or feedback, please contact us at:
            </p>
            <a
              href="mailto:vy8477759@gmail.com"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:text-white transition-all font-mono text-sm"
            >
              ✉ vy8477759@gmail.com
            </a>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8 text-center text-xs text-amber-200/50">
        © {new Date().getFullYear()} Orphic · Do Beyond Ordinary
      </footer>
    </div>
  );
}
