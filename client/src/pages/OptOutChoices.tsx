/**
 * Opt-Out Choices - CCPA Compliance Page
 */

export default function OptOutChoices() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-2 border-foreground p-4">
        <div className="max-w-4xl mx-auto">
          <a href="/" className="text-4xl font-bold hover:opacity-70 transition-none">
            FLESHBOOGIE
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-8 border-b-4 border-foreground pb-4">
          OPT-OUT CHOICES
        </h1>

        <div className="space-y-8 text-lg leading-relaxed">
          <section>
            <p className="mb-4">
              <strong>Last Updated:</strong> January 9, 2026
            </p>
            <p>
              This page provides information about your choices regarding the collection, use, and sharing of your personal information by FLESHBOOGIE. We are committed to respecting your privacy and providing you with control over your data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              DO NOT SELL MY PERSONAL INFORMATION
            </h2>
            <p className="mb-4">
              <strong>FLESHBOOGIE DOES NOT SELL YOUR PERSONAL INFORMATION.</strong>
            </p>
            <p className="mb-4">
              We do not sell, rent, or trade your personal information to third parties for monetary or other valuable consideration. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email addresses collected through newsletter signups</li>
              <li>Browsing behavior and analytics data</li>
              <li>Device information and IP addresses</li>
            </ul>
            <p className="mt-4">
              If our practices change in the future, we will update this page and provide you with a clear and conspicuous link to opt-out of any sales of personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              NEWSLETTER OPT-OUT
            </h2>
            <p className="mb-4">
              If you have subscribed to our newsletter, you can opt-out at any time by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Clicking the "Unsubscribe" link at the bottom of any newsletter email</li>
              <li>Emailing us at <a href="mailto:unsubscribe@fleshboogie.com" className="underline hover:opacity-70">unsubscribe@fleshboogie.com</a></li>
              <li>Contacting us through our <a href="/contact" className="underline hover:opacity-70">contact form</a></li>
            </ul>
            <p className="mt-4">
              Once you unsubscribe, you will stop receiving marketing emails from us within 10 business days. Please note that we may still send you transactional or administrative emails related to your account or requests.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              COOKIE OPT-OUT
            </h2>
            <p className="mb-4">
              FLESHBOOGIE uses cookies and similar tracking technologies to improve your experience and analyze website traffic. You can control cookies through your browser settings:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Block All Cookies:</strong> Configure your browser to reject all cookies</li>
              <li><strong>Delete Cookies:</strong> Clear cookies stored on your device</li>
              <li><strong>Third-Party Cookies:</strong> Block third-party cookies while allowing first-party cookies</li>
            </ul>
            <p className="mt-4">
              Please note that blocking or deleting cookies may affect your ability to use certain features of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              ANALYTICS OPT-OUT
            </h2>
            <p className="mb-4">
              We use analytics services to understand how visitors use our website. You can opt-out of analytics tracking by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Using browser extensions that block analytics scripts (e.g., uBlock Origin, Privacy Badger)</li>
              <li>Enabling "Do Not Track" (DNT) in your browser settings</li>
              <li>Contacting us to request exclusion from analytics tracking</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              CALIFORNIA RESIDENTS - ADDITIONAL RIGHTS
            </h2>
            <p className="mb-4">
              If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
            </p>
            <ul className="list-disc list-inside space-y-3 ml-4">
              <li>
                <strong>Right to Know:</strong> Request information about the personal information we collect, use, and share
              </li>
              <li>
                <strong>Right to Delete:</strong> Request deletion of your personal information
              </li>
              <li>
                <strong>Right to Opt-Out of Sale:</strong> Opt-out of the sale of your personal information (Note: We do not sell personal information)
              </li>
              <li>
                <strong>Right to Non-Discrimination:</strong> Exercise your rights without facing discrimination
              </li>
            </ul>
            <p className="mt-4">
              To learn more about your California privacy rights, visit our <a href="/california-notice" className="underline hover:opacity-70">California Notice</a> page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              HOW TO EXERCISE YOUR OPT-OUT RIGHTS
            </h2>
            <p className="mb-4">
              To exercise any of the opt-out rights described above, please contact us:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Email:</strong> <a href="mailto:privacy@fleshboogie.com" className="underline hover:opacity-70">privacy@fleshboogie.com</a></li>
              <li><strong>Contact Form:</strong> <a href="/contact" className="underline hover:opacity-70">fleshboogie.com/contact</a></li>
            </ul>
            <p className="mt-4">
              We will process your request within 45 days and confirm your opt-out preferences in writing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              THIRD-PARTY SERVICES
            </h2>
            <p className="mb-4">
              FLESHBOOGIE uses the following third-party services that may collect or process your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Mailchimp:</strong> Email newsletter delivery - <a href="https://mailchimp.com/legal/privacy/" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">Privacy Policy</a></li>
              <li><strong>Analytics Provider:</strong> Website analytics - Opt-out instructions available in their privacy policy</li>
            </ul>
            <p className="mt-4">
              Each third-party service has its own privacy policy and opt-out mechanisms. We encourage you to review their policies and exercise your rights directly with them if needed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              CONTACT US
            </h2>
            <p>
              If you have questions about your opt-out choices or need assistance exercising your rights, please contact us:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> <a href="mailto:privacy@fleshboogie.com" className="underline hover:opacity-70">privacy@fleshboogie.com</a><br />
              <strong>Website:</strong> <a href="https://fleshboogie.com" className="underline hover:opacity-70">fleshboogie.com</a>
            </p>
          </section>

          <section className="border-t-2 border-foreground pt-8 mt-12">
            <p className="text-sm opacity-70">
              This Opt-Out Choices page is effective as of January 9, 2026 and may be updated from time to time. Any changes will be posted on this page with an updated "Last Updated" date.
            </p>
          </section>
        </div>

        {/* Back to Home */}
        <div className="mt-12 pt-8 border-t-2 border-foreground">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-foreground text-background font-bold hover:opacity-80 transition-none"
          >
            ← BACK TO HOME
          </a>
        </div>
      </main>
    </div>
  );
}
