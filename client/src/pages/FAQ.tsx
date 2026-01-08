/**
 * FAQ Page for FLESHBOOGIE
 * Helps AI search engines understand the site and provide direct answers
 */

import { useEffect } from 'react';

export default function FAQ() {
  // Set page title and add FAQ schema
  useEffect(() => {
    document.title = 'FAQ - FLESHBOOGIE';
    
    // Add FAQ Schema for AI search engines
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is FLESHBOOGIE?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FLESHBOOGIE is an independent music and culture news aggregator that curates the best links from across the web. We update 24/7 with the latest news, reviews, and discoveries in music, film, art, and underground culture."
          }
        },
        {
          "@type": "Question",
          "name": "How often is FLESHBOOGIE updated?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FLESHBOOGIE updates automatically every 15 minutes by fetching the latest content from 25+ curated RSS feeds. This ensures you always have access to the freshest music and culture news."
          }
        },
        {
          "@type": "Question",
          "name": "What kind of content does FLESHBOOGIE feature?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FLESHBOOGIE focuses on independent music, underground culture, film, art, and creative movements. We filter out celebrity gossip, politics, violence, and mainstream pop to surface voices and stories that deserve attention."
          }
        },
        {
          "@type": "Question",
          "name": "Who runs FLESHBOOGIE?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FLESHBOOGIE was built in Los Angeles by Scottie Diablo. It's a labor of love dedicated to curation over algorithm."
          }
        },
        {
          "@type": "Question",
          "name": "How can I subscribe to FLESHBOOGIE?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can subscribe to The Boogie Blast, our daily email newsletter delivered every morning at 6 AM PST (9 AM EST). Just enter your email at the bottom of the homepage. We also offer RSS and Atom feeds at https://fleshboogie.com/rss.xml and https://fleshboogie.com/atom.xml"
          }
        },
        {
          "@type": "Question",
          "name": "Does FLESHBOOGIE host original content?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FLESHBOOGIE is a news aggregator that links to articles published by other sources. We curate and organize content under Fair Use (17 U.S.C. § 107) but do not host full articles. All links direct to the original publishers."
          }
        },
        {
          "@type": "Question",
          "name": "How do I contact FLESHBOOGIE?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can reach us at hello@fleshboogie.com for editorial inquiries, feedback, or DMCA takedown requests. We're also on X/Twitter at @fleshboogie."
          }
        },
        {
          "@type": "Question",
          "name": "What is the Featured Artist section?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "The Featured Artist section highlights underground and independent musicians who deserve attention. Each featured artist includes bio, genres, origin, links to their music platforms (Bandcamp, Spotify, SoundCloud), and curator notes explaining why they're worth discovering."
          }
        }
      ]
    };
    
    let script = document.getElementById('faq-schema') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.id = 'faq-schema';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqSchema);
    
    return () => {
      const existingScript = document.getElementById('faq-schema');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8 border-b-4 border-foreground pb-4">
          <a href="/" className="inline-block no-underline">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight hover:opacity-70 transition-opacity">
              FLESHBOOGIE
            </h1>
          </a>
          <p className="text-sm uppercase tracking-wider mt-2">
            Frequently Asked Questions
          </p>
        </header>

        {/* FAQ Content */}
        <article className="space-y-8">
          <section>
            <h2 className="text-2xl font-black mb-3 border-l-4 border-foreground pl-3">
              What is FLESHBOOGIE?
            </h2>
            <p className="leading-relaxed">
              FLESHBOOGIE is an independent music and culture news aggregator that curates the best links from across the web. 
              We update 24/7 with the latest news, reviews, and discoveries in music, film, art, and underground culture.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-3 border-l-4 border-foreground pl-3">
              How often is FLESHBOOGIE updated?
            </h2>
            <p className="leading-relaxed">
              FLESHBOOGIE updates automatically <strong>every 15 minutes</strong> by fetching the latest content from 25+ curated RSS feeds. 
              This ensures you always have access to the freshest music and culture news.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-3 border-l-4 border-foreground pl-3">
              What kind of content does FLESHBOOGIE feature?
            </h2>
            <p className="leading-relaxed">
              FLESHBOOGIE focuses on <strong>independent music, underground culture, film, art, and creative movements</strong>. 
              We filter out celebrity gossip, politics, violence, and mainstream pop to surface voices and stories that deserve attention.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-3 border-l-4 border-foreground pl-3">
              Who runs FLESHBOOGIE?
            </h2>
            <p className="leading-relaxed">
              FLESHBOOGIE was built in Los Angeles by <strong>Scottie Diablo</strong>. 
              It's a labor of love dedicated to curation over algorithm.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-3 border-l-4 border-foreground pl-3">
              How can I subscribe to FLESHBOOGIE?
            </h2>
            <p className="leading-relaxed mb-3">
              You can subscribe to <strong>The Boogie Blast</strong>, our daily email newsletter delivered every morning at 6 AM PST (9 AM EST). 
              Just enter your email at the bottom of the homepage.
            </p>
            <p className="leading-relaxed">
              We also offer RSS and Atom feeds:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><a href="https://fleshboogie.com/rss.xml" className="underline hover:opacity-70">RSS Feed</a></li>
              <li><a href="https://fleshboogie.com/atom.xml" className="underline hover:opacity-70">Atom Feed</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-3 border-l-4 border-foreground pl-3">
              Does FLESHBOOGIE host original content?
            </h2>
            <p className="leading-relaxed">
              FLESHBOOGIE is a news aggregator that <strong>links to articles published by other sources</strong>. 
              We curate and organize content under Fair Use (17 U.S.C. § 107) but do not host full articles. 
              All links direct to the original publishers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-3 border-l-4 border-foreground pl-3">
              How do I contact FLESHBOOGIE?
            </h2>
            <p className="leading-relaxed">
              You can reach us at <a href="mailto:hello@fleshboogie.com" className="underline hover:opacity-70">hello@fleshboogie.com</a> for editorial inquiries, feedback, or DMCA takedown requests. 
              We're also on X/Twitter at <a href="https://x.com/fleshboogie" className="underline hover:opacity-70" target="_blank" rel="noopener noreferrer">@fleshboogie</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-3 border-l-4 border-foreground pl-3">
              What is the Featured Artist section?
            </h2>
            <p className="leading-relaxed">
              The <strong>Featured Artist</strong> section highlights underground and independent musicians who deserve attention. 
              Each featured artist includes bio, genres, origin, links to their music platforms (Bandcamp, Spotify, SoundCloud), 
              and curator notes explaining why they're worth discovering.
            </p>
          </section>
        </article>

        {/* Footer Navigation */}
        <footer className="mt-12 pt-8 border-t-4 border-foreground">
          <nav className="flex flex-wrap gap-4 text-sm uppercase tracking-wider">
            <a href="/" className="hover:opacity-70 transition-opacity">Home</a>
            <a href="/about" className="hover:opacity-70 transition-opacity">About</a>
            <a href="/archive" className="hover:opacity-70 transition-opacity">Archive</a>
            <a href="/privacy" className="hover:opacity-70 transition-opacity">Privacy</a>
            <a href="/terms" className="hover:opacity-70 transition-opacity">Terms</a>
          </nav>
        </footer>
      </div>
    </div>
  );
}
