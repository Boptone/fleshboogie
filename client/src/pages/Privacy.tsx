export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#f5f1e8] text-black">
      <div className="container max-w-4xl py-12">
        <h1 className="font-['Helvetica_Neue',Helvetica,Arial,sans-serif] text-5xl font-bold mb-8">
          PRIVACY POLICY
        </h1>
        
        <div className="font-['Courier_New',Courier,monospace] text-sm leading-relaxed space-y-6">
          <p className="text-xs text-gray-600">
            <strong>Effective Date:</strong> January 6, 2026<br />
            <strong>Last Updated:</strong> January 6, 2026
          </p>

          <section>
            <h2 className="font-bold text-lg mb-3">1. INTRODUCTION</h2>
            <p>
              FLESHBOOGIE℠ ("we," "us," or "our") operates the website fleshboogie.com (the "Site"). 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you visit our Site and subscribe to our newsletter, The Boogie Blast.
            </p>
            <p className="mt-2">
              We are based in Los Angeles County, California, USA, and comply with the California Consumer 
              Privacy Act (CCPA) and other applicable privacy laws.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">2. INFORMATION WE COLLECT</h2>
            <p><strong>Personal Information:</strong></p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Email address (when you subscribe to The Boogie Blast newsletter)</li>
              <li>Timezone information (automatically detected for newsletter delivery)</li>
            </ul>
            <p className="mt-3"><strong>Automatically Collected Information:</strong></p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent on the Site</li>
              <li>Referring website addresses</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">3. HOW WE USE YOUR INFORMATION</h2>
            <p>We use your information to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Send you The Boogie Blast newsletter (if you subscribe)</li>
              <li>Improve and optimize our Site</li>
              <li>Analyze Site usage and trends</li>
              <li>Respond to your inquiries and requests</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">4. THIRD-PARTY SERVICE PROVIDERS</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Mailchimp:</strong> For email newsletter delivery and subscriber management</li>
              <li><strong>Analytics Services:</strong> For website traffic analysis</li>
            </ul>
            <p className="mt-2">
              These providers have access to your information only to perform tasks on our behalf and are 
              obligated not to disclose or use it for other purposes.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">5. YOUR CALIFORNIA PRIVACY RIGHTS (CCPA)</h2>
            <p>If you are a California resident, you have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Know:</strong> Request disclosure of personal information we collect, use, and share</li>
              <li><strong>Delete:</strong> Request deletion of your personal information</li>
              <li><strong>Opt-Out:</strong> Opt out of the sale of your personal information (we do not sell your data)</li>
              <li><strong>Non-Discrimination:</strong> Not receive discriminatory treatment for exercising your rights</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at <a href="mailto:hello@fleshboogie.com" className="underline">hello@fleshboogie.com</a>.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">6. DATA RETENTION</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined 
              in this Privacy Policy, unless a longer retention period is required or permitted by law.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">7. COOKIES AND TRACKING</h2>
            <p>
              We use cookies and similar tracking technologies to analyze Site traffic and improve user experience. 
              You can control cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">8. DATA SECURITY</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of 
              transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">9. CHILDREN'S PRIVACY</h2>
            <p>
              Our Site is not intended for children under 13. We do not knowingly collect personal information 
              from children under 13. If you believe we have collected such information, contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">10. CHANGES TO THIS POLICY</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with 
              an updated "Last Updated" date.
            </p>
          </section>

          <section>
            <h2 className="font-bold text-lg mb-3">11. CONTACT US</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2">
              <strong>FLESHBOOGIE℠</strong><br />
              Los Angeles County, California, USA<br />
              Email: <a href="mailto:hello@fleshboogie.com" className="underline">hello@fleshboogie.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
