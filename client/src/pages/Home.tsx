/**
 * FLESHBOOGIE - Xerox Brutalism Design Philosophy
 * 
 * Core principles applied to this page:
 * - Stark black-on-newsprint monochrome palette
 * - Information density as power
 * - Helvetica for headlines, Courier for body
 * - No animations, instant interactions
 * - High-contrast hierarchy through size and weight
 */

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { NewsletterSignup } from "@/components/NewsletterSignup";

// Theme toggle component with sun/moon icon
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  if (!toggleTheme) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="text-lg hover:bg-foreground hover:text-background transition-none px-2 py-1"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? '☾' : '☀'}
    </Button>
  );
}

interface LinkItem {
  title: string;
  url: string;
  timestamp?: string;
}

interface AggregatorContent {
  splash: {
    headline: string;
    url: string;
    image?: string;
  };
  mainColumn: LinkItem[];
  column1: LinkItem[];
  column2: LinkItem[];
  column3: LinkItem[];
  automated: LinkItem[];
  lastUpdated: string;
}

export default function Home() {
  const [content, setContent] = useState<AggregatorContent | null>(null);
  const [relativeTime, setRelativeTime] = useState('Just now');

  // Calculate relative time (e.g., "5 minutes ago")
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  // Set page title for SEO
  useEffect(() => {
    document.title = 'FLESHBOOGIE - Music & Culture News Aggregator';
  }, []);

  // Generate JSON-LD structured data for all articles
  useEffect(() => {
    if (!content) return;

    // Collect all articles from all sections
    const allArticles = [
      // Splash headline
      {
        headline: content.splash.headline,
        url: content.splash.url,
        datePublished: content.lastUpdated,
      },
      // Main column articles
      ...content.mainColumn.map(item => ({
        headline: item.title,
        url: item.url,
        datePublished: content.lastUpdated,
      })),
      // Automated feed articles
      ...content.automated.map(item => ({
        headline: item.title,
        url: item.url,
        datePublished: content.lastUpdated,
      })),
    ];

    // Create ItemList with NewsArticle items
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": allArticles.map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": article.headline,
          "url": article.url,
          "datePublished": article.datePublished,
          "publisher": {
            "@type": "Organization",
            "name": "Fleshboogie",
            "url": "https://fleshboogie.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://fleshboogie.com/logo.png"
            }
          },
          "author": {
            "@type": "Person",
            "name": "Scottie Diablo"
          }
        }
      }))
    };

    // Insert or update structured data script
    let script = document.getElementById('structured-data-articles') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'structured-data-articles';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);

    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById('structured-data-articles');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [content]);

  // Fetch content from JSON file
  useEffect(() => {
    fetch('/data/content.json')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content:', err));
  }, []);

  // Update relative time every minute
  useEffect(() => {
    if (!content?.lastUpdated) return;

    // Initial update
    setRelativeTime(getRelativeTime(content.lastUpdated));

    // Update every minute
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTime(content.lastUpdated));
    }, 60000);

    return () => clearInterval(interval);
  }, [content?.lastUpdated]);

  if (!content) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-xl font-bold">LOADING...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Masthead */}
      <header className="border-b-4 border-foreground py-6 mb-8">
        <div className="container">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase">
            FLESHBOOGIE
          </h1>
          <div className="flex justify-between items-center mt-2">
            <p className="text-sm uppercase tracking-wide">
              Music • Culture • News • Whatever
            </p>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <p className="text-sm uppercase tracking-wide" title={content.lastUpdated ? new Date(content.lastUpdated).toLocaleString() : ''}>
                Updated {relativeTime}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container pb-16">
        {/* Splash Headline */}
        <section className="mb-12 border-b-2 border-foreground pb-8">
          <a 
            href={content.splash.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block no-underline hover:no-underline"
          >
            <h2 className="text-3xl md:text-6xl font-black uppercase leading-tight mb-4 hover:bg-foreground hover:text-background transition-none break-words">
              {content.splash.headline}
            </h2>
          </a>
        </section>

        {/* Main Column */}
        <section className="mb-12 border-b-2 border-foreground pb-8">
          <div className="space-y-3">
            {content.mainColumn.map((item, index) => (
              <div key={index} className="flex gap-3 items-baseline">
                {item.timestamp && (
                  <span className="text-sm font-bold shrink-0">[{item.timestamp}]</span>
                )}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base md:text-lg break-words"
                >
                  {item.title}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Automated Feed Section */}
        {content.automated && content.automated.length > 0 && (
          <section className="mb-12 border-b-2 border-foreground pb-8">
            <h3 className="text-xl font-black uppercase mb-4 tracking-wide">LATEST FROM THE WIRE</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {content.automated.slice(0, 10).map((item, index) => (
                <div key={index} className="flex gap-2 items-baseline">
                  {item.timestamp && (
                    <span className="text-xs font-bold shrink-0">[{item.timestamp}]</span>
                  )}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm break-words"
                  >
                    {item.title}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Three Column Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {/* Column 1 */}
          <div className="space-y-4 border-t-2 md:border-t-0 md:border-r-2 border-foreground pt-4 md:pt-0 md:pr-6">
            {content.column1.map((item, index) => (
              <div key={index}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm md:text-base block break-words"
                >
                  • {item.title}
                </a>
              </div>
            ))}
          </div>

          {/* Column 2 */}
          <div className="space-y-4 border-t-2 md:border-t-0 md:border-r-2 border-foreground pt-4 md:pt-0 md:pr-6">
            {content.column2.map((item, index) => (
              <div key={index}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm md:text-base block break-words"
                >
                  • {item.title}
                </a>
              </div>
            ))}
          </div>

          {/* Column 3 */}
          <div className="space-y-4 border-t-2 md:border-t-0 border-foreground pt-4 md:pt-0">
            {content.column3.map((item, index) => (
              <div key={index}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm md:text-base block break-words"
                >
                  • {item.title}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <NewsletterSignup />

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t-4 border-foreground">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-wide font-bold">Fleshboogie</p>
              <p className="text-xs">Curated music and culture links, updated 24/7</p>
            </div>
            <div className="flex gap-6 text-sm items-center">
              <a href="/about" className="uppercase hover:underline">About</a>
              <a href="/archive" className="uppercase hover:underline">Archive</a>
              <a href="/privacy" className="uppercase hover:underline">Privacy</a>
              <a href="/terms" className="uppercase hover:underline">Terms</a>
              <a href="mailto:hello@fleshboogie.com" className="uppercase hover:underline">Contact</a>
              <a href="https://x.com/fleshboogie" target="_blank" rel="noopener noreferrer" className="hover:opacity-70" aria-label="Follow Fleshboogie on X">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-6 text-xs text-center md:text-left">
            <p>© {new Date().getFullYear()} Fleshboogie℠. All links property of their respective sources.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
