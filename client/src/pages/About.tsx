/**
 * About Page - FLESHBOOGIE
 * Simple, direct statement of origin and curation
 */

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Masthead */}
      <header className="border-b-4 border-foreground py-6 mb-8">
        <div className="container">
          <a href="/" className="no-underline">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase hover:bg-foreground hover:text-background transition-none">
              FLESHBOOGIE
            </h1>
          </a>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm uppercase tracking-wide">
              Music • Culture • News
            </p>
          </div>
        </div>
      </header>

      <main className="container pb-16">
        <article className="max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-black uppercase mb-8 border-b-4 border-foreground pb-4">
            ABOUT
          </h2>
          
          <div className="space-y-6 text-lg font-mono">
            <p>
              FLESHBOOGIE was built in Los Angeles by Scottie Diablo.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t-2 border-foreground">
            <a 
              href="/"
              className="inline-block text-xl font-black uppercase hover:bg-foreground hover:text-background px-4 py-2 border-2 border-foreground transition-none"
            >
              ← BACK TO FLESHBOOGIE
            </a>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t-4 border-foreground">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <p className="text-xs font-mono">© 2026 FLESHBOOGIE℠</p>
              <p className="text-xs font-mono">Los Angeles, CA</p>
            </div>
            <nav className="flex gap-6 text-sm uppercase font-bold">
              <a href="/privacy" className="hover:bg-foreground hover:text-background px-2 py-1">Privacy</a>
              <a href="/terms" className="hover:bg-foreground hover:text-background px-2 py-1">Terms</a>
              <a href="mailto:hello@fleshboogie.com" className="hover:bg-foreground hover:text-background px-2 py-1">Contact</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
