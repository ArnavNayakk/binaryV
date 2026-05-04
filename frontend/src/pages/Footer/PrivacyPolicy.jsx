import React from "react";

const privacyData = {
  title: "Privacy Policy",
  effective_date: "October 27, 2025",
  sections: [
    {
      title: "1. Introduction",
      content:
        "BinaryV ('we', 'our', or 'us') values your privacy and is committed to protecting your personal data. This Privacy Policy outlines how we collect, use, store, and share your information when you use our platform, website, or services (collectively, the 'Service').",
    },
    {
      title: "2. Information We Collect",
      points: [
        "Personal Information: Includes name, email address, phone number, and identification details provided during registration or verification.",
        "Financial Data: Includes deposit and withdrawal details, wallet addresses, and payment transaction information.",
        "Usage Data: Includes information about how you access and use the platform, IP address, device type, browser, and activity logs.",
        "Cookies & Tracking: We use cookies and similar technologies to enhance user experience, personalize content, and analyze traffic.",
      ],
    },
    {
      title: "3. How We Use Your Information",
      points: [
        "To operate, maintain, and improve the Service.",
        "To verify your identity and prevent fraud or misuse.",
        "To process transactions and provide customer support.",
        "To send important updates, security alerts, and promotional content (where permitted).",
        "To comply with legal and regulatory obligations.",
      ],
    },
    {
      title: "4. Data Sharing & Disclosure",
      content:
        "We do not sell your personal data. However, we may share data with:",
      points: [
        "Service providers and partners assisting in platform operation and security.",
        "Regulatory authorities and law enforcement when required by law.",
        "Payment processors and KYC verification services.",
      ],
    },
    {
      title: "5. Data Retention",
      content:
        "We retain your information as long as necessary to provide our services, comply with our legal obligations, resolve disputes, and enforce our agreements. When data is no longer required, we securely delete or anonymize it.",
    },
    {
      title: "6. Data Security",
      content:
        "We implement technical and organizational measures to protect your data from unauthorized access, alteration, disclosure, or destruction. However, no electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.",
    },
    {
      title: "7. Your Rights",
      content:
        "You may have the right to access, correct, or delete your personal data, withdraw consent, or object to data processing. To exercise your rights, contact us at privacy@binaryv.com.",
    },
    {
      title: "8. International Transfers",
      content:
        "Your information may be transferred to and processed in countries other than your own. We ensure such transfers comply with applicable data protection laws.",
    },
    {
      title: "9. Cookies Policy",
      content:
        "Cookies are small text files stored on your device. We use cookies for authentication, analytics, and personalization. You can control cookie preferences through your browser settings, but disabling cookies may affect platform functionality.",
    },
    {
      title: "10. Third-Party Links",
      content:
        "Our Service may contain links to third-party websites. We are not responsible for their privacy practices or content. We encourage users to review the privacy policies of third-party sites before providing personal data.",
    },
    {
      title: "11. Updates to This Policy",
      content:
        "We may update this Privacy Policy periodically. We will notify you of any significant changes by posting an updated version on this page and updating the effective date above.",
    },
    {
      title: "12. Contact Us",
      content:
        "If you have questions or concerns about this Privacy Policy, please contact us at privacy@binaryv.com or by mail at BinaryV (Privacy Office), 123 Financial Ave, Suite 500.",
    },
  ],
  footer_note:
    "Last updated: October 27, 2025. This Privacy Policy is for informational purposes only and does not constitute legal advice.",
};

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0a0f0a] text-gray-200 flex flex-col items-center py-12 px-4 sm:px-8">
      <div className="max-w-4xl w-full">
        {/* Title */}
        <h1 className="text-4xl font-bold text-green mb-3 text-center">
          {privacyData.title}
        </h1>
        <p className="text-gray-400 text-center mb-10">
          Effective Date: {privacyData.effective_date}
        </p>

        {/* Dynamic Sections */}
        {privacyData.sections.map((section, index) => (
          <section key={index} className="mb-6">
            <h2 className="text-2xl text-green-300 font-semibold mb-2">
              {section.title}
            </h2>

            {section.content && (
              <p className="text-gray-300 leading-relaxed mb-2">
                {section.content}
              </p>
            )}

            {section.points && (
              <ul className="list-disc ml-6 text-gray-300 space-y-2">
                {section.points.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-12 border-t border-green-900 pt-6">
          {privacyData.footer_note}
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
