import AppBar from '@/components/AppBar';
import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div>
      <AppBar />
       <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 text-gray-900 px-6 py-12 sm:px-10 md:px-20">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10 space-y-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-center text-gray-900">Privacy Policy</h1>
        <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto">
          This Privacy Policy outlines how we handle your personal data in compliance with the General Data Protection Regulation (GDPR) when using our Visitor Management System.
        </p>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">1. Information We Collect</h2>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
            <li>Full name, email address, phone number, and company affiliation</li>
            <li>Visit logs including check-in and check-out times</li>
            <li>Photographs and digital signatures</li>
            <li>Device identifiers, browser type, IP address, and access timestamps</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">2. Legal Basis for Processing</h2>
          <p className="text-gray-700 mt-2">
            We process your data based on your consent, our legitimate interest in site security, or to comply with legal obligations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
            <li>To identify and register visitors securely</li>
            <li>To ensure workplace safety and regulatory compliance</li>
            <li>To improve the efficiency and security of visitor processes</li>
            <li>To notify hosts of visitor arrival and support audit trails</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">4. Sharing and Disclosure</h2>
          <p className="text-gray-700 mt-2">
            We do not sell personal data. We may share data with:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
            <li>Internal staff with access permissions</li>
            <li>Data processors under binding agreements</li>
            <li>Authorities where legally obligated</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">5. International Transfers</h2>
          <p className="text-gray-700 mt-2">
            If data is transferred outside the EU/EEA, we ensure appropriate safeguards, such as Standard Contractual Clauses, are in place.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">6. Data Retention</h2>
          <p className="text-gray-700 mt-2">
            We retain personal data only for as long as necessary to fulfill the purposes outlined, unless a longer retention period is required by law.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">7. Security</h2>
          <p className="text-gray-700 mt-2">
            We employ technical and organizational measures such as encryption, access restrictions, and monitoring to safeguard your data.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">8. Your Rights Under GDPR</h2>
          <ul className="list-disc list-inside text-gray-700 mt-2 space-y-2">
            <li>Right to access, rectify, or erase your data</li>
            <li>Right to data portability</li>
            <li>Right to object or restrict processing</li>
            <li>Right to withdraw consent at any time</li>
            <li>Right to lodge a complaint with a supervisory authority</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">9. Contact Us</h2>
          <p className="text-gray-700 mt-2">
            If you have questions about this policy or your data, contact our Data Protection Officer at <a href="mailto:dpo@yourdomain.eu" className="text-blue-600 underline">dpo@yourdomain.eu</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-800">10. Changes to This Policy</h2>
          <p className="text-gray-700 mt-2">
            We may update this policy to reflect legal or operational changes. Please check this page periodically for updates.
          </p>
        </section>

        <footer className="text-sm text-gray-500 border-t pt-6 text-center">
          Effective Date: June 12, 2025
        </footer>
      </div>
    </main>
    </div>
   
  );
}
