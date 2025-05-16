import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Policy = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-[var(--surface)] rounded-2xl shadow-lg p-8 md:p-12">
          <div className="mb-8 flex items-center">
            <div className="rounded-full bg-[var(--primary-light)] p-2 inline-flex mr-3">
              <img src="/logo.svg" alt="KittyPay Logo" className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Privacy Policy
            </h1>
          </div>

          <div className="prose max-w-none" style={{ color: 'var(--text-primary)' }}>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Last updated: May 15, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                1. Introduction
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                KittyPay ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our website, mobile application, and other related services 
                (collectively, the "Services").
              </p>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                Please read this Privacy Policy carefully. By accessing or using our Services, you acknowledge that you have read, 
                understood, and agree to be bound by this Privacy Policy. If you do not agree with our policies and practices, please 
                do not use our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                2. Information We Collect
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We collect several types of information from and about users of our Services:
              </p>

              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                2.1 Personal Information
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                When you register for an account or use our Services, we may collect the following personal information:
              </p>
              <ul className="list-disc pl-6 mb-4" style={{ color: 'var(--text-primary)' }}>
                <li className="mb-2">Contact information (name, email address, phone number)</li>
                <li className="mb-2">Identity verification information (date of birth, government ID)</li>
                <li className="mb-2">Financial information (bank account details, UPI IDs)</li>
                <li className="mb-2">Profile information (username, password, profile picture)</li>
                <li className="mb-2">Transaction data (payment recipients, payment amounts, transaction dates)</li>
              </ul>

              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                2.2 Usage Information
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We automatically collect certain information about your device and how you interact with our Services, including:
              </p>
              <ul className="list-disc pl-6 mb-4" style={{ color: 'var(--text-primary)' }}>
                <li className="mb-2">Device information (device type, operating system, unique device identifiers)</li>
                <li className="mb-2">Log information (IP address, access times, pages viewed, app features used)</li>
                <li className="mb-2">Location information (with your consent)</li>
                <li className="mb-2">Usage patterns and preferences</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                3. How We Use Your Information
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We may use the information we collect for various purposes, including to:
              </p>
              <ul className="list-disc pl-6 mb-4" style={{ color: 'var(--text-primary)' }}>
                <li className="mb-2">Provide, maintain, and improve our Services</li>
                <li className="mb-2">Process transactions and send related notifications</li>
                <li className="mb-2">Verify your identity and prevent fraud</li>
                <li className="mb-2">Communicate with you about our Services</li>
                <li className="mb-2">Provide customer support and respond to inquiries</li>
                <li className="mb-2">Send promotional materials and notifications (you can opt out at any time)</li>
                <li className="mb-2">Monitor and analyze trends, usage, and activities</li>
                <li className="mb-2">Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                4. Information Sharing and Disclosure
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                4.1 With Other Users
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                When you use our Services to send or request money, we share limited information with the other party involved in the transaction, 
                such as your name, profile picture, transaction amount, and any message you include.
              </p>

              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                4.2 With Service Providers
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We may share information with third-party vendors, consultants, and service providers who perform services on our behalf, 
                such as payment processing, data analysis, and customer support.
              </p>

              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                4.3 For Legal Reasons
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We may disclose your information if required by law, regulation, legal process, or governmental request, or when we believe 
                disclosure is necessary to protect our rights, protect your safety or the safety of others, investigate fraud, or respond to 
                a government request.
              </p>

              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                4.4 Business Transfers
              </h3>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred 
                as part of that transaction. We will notify you of any such change in ownership or control of your personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                5. Data Security
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We implement appropriate technical and organizational measures to protect the information we collect and store. However, no method 
                of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                6. Your Choices and Rights
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                You have certain choices regarding the information you provide to us:
              </p>
              <ul className="list-disc pl-6 mb-4" style={{ color: 'var(--text-primary)' }}>
                <li className="mb-2">
                  <span className="font-medium">Account Information:</span> You can review and update your account information through your KittyPay account settings.
                </li>
                <li className="mb-2">
                  <span className="font-medium">Marketing Communications:</span> You can opt out of receiving promotional emails by following the instructions in those emails.
                </li>
                <li className="mb-2">
                  <span className="font-medium">Location Information:</span> You can control location tracking through your device settings.
                </li>
                <li className="mb-2">
                  <span className="font-medium">Data Access and Portability:</span> You may request a copy of your personal information that we hold.
                </li>
                <li className="mb-2">
                  <span className="font-medium">Deletion:</span> You may request that we delete your personal information, subject to certain exceptions provided by law.
                </li>
              </ul>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                To exercise these rights, please contact us at <a href="mailto:mihirnagda28@gmail.com" className="text-[var(--primary)] hover:underline">mihirnagda28@gmail.com</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                7. Cookies and Tracking Technologies
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We use cookies and similar tracking technologies to track activity on our Services and hold certain information. You can instruct 
                your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not 
                be able to use some portions of our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                8. Children's Privacy
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                Our Services are not intended for children under the age of 18. We do not knowingly collect personal information from children 
                under 18. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                9. International Data Transfers
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                Your information may be transferred to and processed in countries other than the country in which you reside. These countries 
                may have data protection laws that are different from those in your country. We take appropriate measures to ensure that your 
                personal information remains protected in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                10. Changes to This Privacy Policy
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this 
                page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                11. Contact Us
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:mihirnagda28@gmail.com" className="text-[var(--primary)] hover:underline">mihirnagda28@gmail.com</a>
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              © {currentYear} KittyPay. All rights reserved.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Policy;