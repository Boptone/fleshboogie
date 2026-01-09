/**
 * California Notice - CCPA Compliance Page
 */

export default function CaliforniaNotice() {
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
          CALIFORNIA NOTICE
        </h1>

        <div className="space-y-8 text-lg leading-relaxed">
          <section>
            <p className="mb-4">
              <strong>Last Updated:</strong> January 9, 2026
            </p>
            <p>
              This California Notice supplements the information in our Privacy Policy and applies solely to visitors, users, and others who reside in the State of California ("consumers" or "you"). We adopt this notice to comply with the California Consumer Privacy Act of 2018 (CCPA) and other California privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              INFORMATION WE COLLECT
            </h2>
            <p className="mb-4">
              FLESHBOOGIE collects information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device ("personal information").
            </p>
            <p className="mb-4">
              In the past twelve (12) months, we have collected the following categories of personal information from consumers:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Identifiers:</strong> Email addresses provided through newsletter signup</li>
              <li><strong>Internet Activity:</strong> Browsing behavior, page views, time on site (via analytics)</li>
              <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              HOW WE USE YOUR INFORMATION
            </h2>
            <p className="mb-4">
              We use the personal information we collect for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To send you our newsletter and updates about music and culture news</li>
              <li>To improve our website and user experience</li>
              <li>To analyze website traffic and usage patterns</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              SHARING YOUR INFORMATION
            </h2>
            <p className="mb-4">
              We <strong>DO NOT SELL</strong> your personal information to third parties.
            </p>
            <p className="mb-4">
              We may share your personal information with the following categories of third parties:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Email Service Providers:</strong> Mailchimp (for newsletter delivery)</li>
              <li><strong>Analytics Providers:</strong> For website analytics and performance monitoring</li>
              <li><strong>Hosting Providers:</strong> For website hosting and infrastructure</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              YOUR CALIFORNIA PRIVACY RIGHTS
            </h2>
            <p className="mb-4">
              Under the CCPA, California consumers have the following rights:
            </p>
            <ul className="list-disc list-inside space-y-3 ml-4">
              <li>
                <strong>Right to Know:</strong> You have the right to request that we disclose what personal information we collect, use, disclose, and sell about you.
              </li>
              <li>
                <strong>Right to Delete:</strong> You have the right to request that we delete any personal information we have collected from you.
              </li>
              <li>
                <strong>Right to Opt-Out:</strong> You have the right to opt-out of the sale of your personal information. (Note: We do not sell personal information.)
              </li>
              <li>
                <strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA rights.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              HOW TO EXERCISE YOUR RIGHTS
            </h2>
            <p className="mb-4">
              To exercise your rights described above, please submit a verifiable consumer request to us by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Email: <a href="mailto:privacy@fleshboogie.com" className="underline hover:opacity-70">privacy@fleshboogie.com</a></li>
              <li>Contact Form: <a href="/contact" className="underline hover:opacity-70">fleshboogie.com/contact</a></li>
            </ul>
            <p className="mt-4">
              Only you, or a person registered with the California Secretary of State that you authorize to act on your behalf, may make a verifiable consumer request related to your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              VERIFICATION PROCESS
            </h2>
            <p>
              We will verify your identity before responding to your request. We may ask you to provide information such as your email address and confirm details about your interactions with FLESHBOOGIE. We will only use personal information provided in a verifiable consumer request to verify your identity or authority to make the request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              RESPONSE TIMING
            </h2>
            <p>
              We will respond to verifiable consumer requests within forty-five (45) days of receipt. If we require more time (up to 90 days), we will inform you of the reason and extension period in writing.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">
              CONTACT US
            </h2>
            <p>
              If you have any questions or comments about this California Notice, our Privacy Policy, or how we handle your personal information, please contact us at:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> <a href="mailto:privacy@fleshboogie.com" className="underline hover:opacity-70">privacy@fleshboogie.com</a><br />
              <strong>Website:</strong> <a href="https://fleshboogie.com" className="underline hover:opacity-70">fleshboogie.com</a>
            </p>
          </section>

          <section className="border-t-2 border-foreground pt-8 mt-12">
            <p className="text-sm opacity-70">
              This California Notice is effective as of January 9, 2026 and will remain in effect except with respect to any changes in its provisions in the future, which will be in effect immediately after being posted on this page.
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
