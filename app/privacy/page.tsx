import Metadata from "next";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Orphic",
  description: "Learn how Orphic collects, uses, and protects your data and connected integration tokens.",
};

export default function PrivacyPage() {
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
            <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12 border-b border-white/10 pb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-wider mb-4">
            Legal & Trust
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Privacy Policy
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
              <h2 className="text-xl font-semibold text-white">What Data We Collect</h2>
            </div>
            <p className="mb-4">
              Orphic only collects the minimal information required to provide multi-modal autonomous agent execution:
            </p>
            <ul className="list-disc list-inside space-y-2 text-amber-200/90 pl-2">
              <li><strong className="text-white">Google Account Email:</strong> Used to authenticate your user session and manage workspace permissions.</li>
              <li><strong className="text-white">OAuth Tokens for Connected Services:</strong> Secure access tokens for tools you explicitly authorize (e.g. GitHub, Slack, Notion, Gmail, Google Drive, Sheets, and Atlassian).</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                02
              </span>
              <h2 className="text-xl font-semibold text-white">How We Use Your Data</h2>
            </div>
            <p>
              Your connected integration tokens and account details are used strictly to perform automated workflows and multi-step actions <strong className="text-white">on your behalf</strong> via official protocol connectors. We never execute unauthorized actions or read data outside your configured scope.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                03
              </span>
              <h2 className="text-xl font-semibold text-white">Data Sharing & Privacy</h2>
            </div>
            <p className="text-emerald-400 font-medium">
              ✓ We do not sell your data or personal information to third parties under any circumstances.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-mono text-sm font-semibold">
                04
              </span>
              <h2 className="text-xl font-semibold text-white">Contact Us</h2>
            </div>
            <p className="mb-4">
              If you have any questions or data requests regarding this Privacy Policy, please reach out to us directly:
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
