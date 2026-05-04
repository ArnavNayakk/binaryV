import React from "react";

const TermsOfServices = () => {
  const services = [
    {
      id: 1,
      title: "Introduction",
      content:
        "Welcome to BinaryV. These Terms of Service ('Terms') govern your access to and use of our website, trading platform, mobile applications, and services (collectively, the 'Service'). By registering an account, accessing, or using the Service you agree to be bound by these Terms. If you do not agree, do not use the Service.",
    },
    {
      id: 2,
      title: "Eligibility",
      content:
        "You must be at least 18 years old or the minimum legal age in your jurisdiction to use the Service. By using the Service you represent and warrant that you meet the eligibility requirements and will comply with applicable laws, including any requirements related to taxation or financial regulation.",
    },
    {
      id: 3,
      title: "Account Registration & Security",
      content:
        "To access certain features you must register an account. You agree to provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorized use.",
    },
    {
      id: 4,
      title: "Trading, Risk Disclosure & No Investment Advice",
      content:
        "The Service enables users to make predictions on the price movement of assets. Trading carries significant risk and can result in the loss of your entire investment. Nothing in the Service or these Terms constitutes financial, investment, tax, or legal advice. We recommend consulting a licensed professional before trading.",
    },
    {
      id: 5,
      title: "Deposits, Withdrawals & Fees",
      content:
        "Deposits and withdrawals are subject to our funding policies and any fees set forth on the platform. We reserve the right to impose transaction limits, hold periods, or additional verification requirements. You are responsible for any network or third-party fees.",
    },
    {
      id: 6,
      title: "Prohibited Conduct",
      content: [
        "Using the Service for unlawful activities, fraud, market manipulation, or to violate any applicable laws.",
        " Attempting to access another user's account or the Service's backend systems.",
        " Using bots, scripts, or other automated means to interact with the Service unless explicitly permitted.",
      ],
    },
    {
      id: 7,
      title: "Intellectual Property",
      content:
        "All content, trademarks, logos, designs and software associated with BinaryV are our property or licensed to us. You may not copy, reproduce, or create derivative works without written permission.",
    },
    {
      id: 8,
      title: "Privacy & Data",
      content:
        "Our Privacy Policy explains how we collect, use, and share personal data. By using the Service you consent to such collection and processing in accordance with the Privacy Policy.",
    },
    {
      id: 9,
      title: "Disclaimers",
      content:
        "The Service is provided 'as is' and 'as available.' We disclaim all warranties to the fullest extent permitted by law, including any implied warranties of merchantability, fitness for a particular purpose, uptime, or accuracy.",
    },
    {
      id: 10,
      title: "Limitation of Liability",
      content:
        "To the maximum extent permitted by applicable law, BinaryV and its affiliates will not be liable for indirect, incidental, special, consequential or punitive damages, or loss of profits, trading losses, or loss of data arising out of or relating to these Terms or your use of the Service, even if we have been advised of the possibility of such damages. Our aggregate liability for direct damages will not exceed the greater of the fees you paid to BinaryV in the 12 months preceding the claim or $100.",
    },
    {
      id: 11,
      title: "Indemnification",
      content:
        "You agree to indemnify, defend and hold harmless BinaryV and its officers, directors, employees and agents from any claims, liabilities, damages, losses, and expenses arising out of your use of the Service or violation of these Terms.",
    },
    {
      id: 12,
      title: "Suspension & Termination",
      content:
        "We may suspend or terminate your access for violations of these Terms, suspected fraud, or as required by law. Upon termination, your rights to use the Service will end, but certain provisions of these Terms will survive (for example, limitations of liability and indemnity).",
    },
    {
      id: 13,
      title: "Amendments to the Terms",
      content:
        "We may modify these Terms from time to time. When changes are material, we will provide notice (e.g., email or platform notification). Continued use of the Service after notice constitutes acceptance of the updated Terms.",
    },
    {
      id: 14,
      title: "Governing Law & Dispute Resolution",
      content:
        "These Terms are governed by the laws of the jurisdiction set forth in our company information. Any dispute will be resolved in the competent courts of that jurisdiction unless otherwise agreed in writing.",
    },
    {
      id: 15,
      title: "Electronic Communications",
      content:
        "By using the Service, you consent to receiving electronic communications from us. These communications satisfy any legal requirement for written notice.",
    },
    {
      id: 16,
      title: "Contact",
      content:
        "If you have questions about these Terms, contact us at support@binaryv.com or by mail at BinaryV (Support), 123 Financial Ave, Suite 500.",
    },
  ];
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#e6eef6] font-inter py-15 px-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-md flex items-center justify-center bg-gradient-to-br from-green-500/10 to-green-600/10 border border-white/5">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 13L9 8L15 14L20 9"
                  stroke="white"
                  strokeOpacity="0.95"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold">BinaryV</h1>
              <p className="text-sm text-slate-400">
                Terms of Service — effective date:{" "}
                <strong>October 27, 2025</strong>
              </p>
            </div>
          </div>
          <nav className="text-sm text-slate-400">
            <a href="contact" className="ml-4 text-green-500 hover:underline">
              Contact
            </a>
          </nav>
        </header>

        <main className="bg-white/5 border border-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <section className="prose prose-invert max-w-none space-y-4">
            {services.map((service) => (
              <div key={service.id}>
                <p className="text-green">{service.title}</p>
                <p>{service.content}</p>
              </div>
            ))}

            <div className="h-px bg-gradient-to-r from-green-500/5 to-white/5 my-6"></div>

            <p className="text-sm text-slate-400 mt-4">
              Last updated: <strong>October 27, 2025</strong>. <em>Note:</em>{" "}
              This template is provided for convenience and does not constitute
              legal advice. We recommend that you obtain independent legal
              review to ensure compliance with applicable laws and regulations
              in the jurisdictions where you operate or where your users are
              located.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TermsOfServices;
