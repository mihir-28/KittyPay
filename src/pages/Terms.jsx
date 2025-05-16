import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Terms = () => {
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
              Terms of Service
            </h1>
          </div>

          <div className="prose max-w-none" style={{ color: 'var(--text-primary)' }}>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Last updated: May 15, 2025
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                1. Acceptance of Terms
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                By accessing or using KittyPay services, including our website, mobile applications, and any related 
                services (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not 
                agree to these terms, please do not use our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                2. Description of Services
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                KittyPay provides digital payment and financial services that allow users to send, receive, and manage funds
                electronically. Our services include but are not limited to peer-to-peer money transfers, bill payments, digital
                wallet management, and transaction history reporting.
              </p>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                KittyPay is not a bank and does not provide banking services. We facilitate transactions between users but do not
                hold deposits or provide credit services unless explicitly stated otherwise.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                3. User Accounts
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                To access certain features of our Services, you must register for a KittyPay account. When you register, you agree to:
              </p>
              <ul className="list-disc pl-6 mb-4" style={{ color: 'var(--text-primary)' }}>
                <li className="mb-2">Provide accurate, current, and complete information</li>
                <li className="mb-2">Maintain and promptly update your information as needed</li>
                <li className="mb-2">Keep your password secure and confidential</li>
                <li className="mb-2">Notify KittyPay immediately of any unauthorized use of your account</li>
                <li className="mb-2">Accept responsibility for all activities that occur under your account</li>
              </ul>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                You must be at least 18 years old to create an account. KittyPay reserves the right to refuse service, terminate
                accounts, or cancel transactions at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                4. Privacy and Data Collection
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                Your privacy is important to us. Our <Link to="/privacy-policy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link> explains
                how we collect, use, disclose, and safeguard your information. By using our Services, you consent to the data practices
                described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                5. User Conduct
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                When using our Services, you agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4" style={{ color: 'var(--text-primary)' }}>
                <li className="mb-2">Violate any applicable laws or regulations</li>
                <li className="mb-2">Use the Services for illegal activities, including money laundering or fraud</li>
                <li className="mb-2">Infringe upon intellectual property rights</li>
                <li className="mb-2">Attempt to gain unauthorized access to our systems or other user accounts</li>
                <li className="mb-2">Transmit malware, viruses, or any code designed to disrupt our Services</li>
                <li className="mb-2">Engage in any activity that could damage, disable, or impair our Services</li>
                <li className="mb-2">Use our Services to harass, abuse, or harm another person or entity</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                6. Fees and Charges
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                KittyPay may charge fees for certain transactions or services. All applicable fees will be clearly disclosed before you
                complete a transaction. We reserve the right to change our fee structure at any time by posting updated fees on our website
                or mobile application.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                7. Modifications to the Services
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                KittyPay reserves the right to modify, suspend, or discontinue any part of our Services at any time, with or without notice.
                We shall not be liable to you or any third party for any modification, suspension, or discontinuation of our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                8. Intellectual Property
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                All content, features, and functionality of our Services, including but not limited to text, graphics, logos, icons, images, 
                audio clips, and software, are owned by KittyPay, its licensors, or other providers and are protected by copyright, trademark, 
                patent, and other intellectual property laws.
              </p>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                You are granted a limited, non-exclusive, non-transferable license to use our Services solely for your personal, non-commercial purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                9. Disclaimer of Warranties
              </h2>
              <p className="mb-4 uppercase text-sm" style={{ color: 'var(--text-secondary)' }}>
                Our services are provided "as is" and "as available," without any warranties of any kind, either express or implied. 
                To the fullest extent permitted by law, KittyPay disclaims all warranties, including but not limited to warranties of 
                merchantability, fitness for a particular purpose, and non-infringement.
              </p>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                We do not guarantee that our Services will be uninterrupted, timely, secure, or error-free, or that any defects will be corrected.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                10. Limitation of Liability
              </h2>
              <p className="mb-4 uppercase text-sm" style={{ color: 'var(--text-secondary)' }}>
                To the maximum extent permitted by law, KittyPay shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages, including but not limited to loss of profits, data, use, or goodwill, resulting from your access to or use of 
                our Services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                11. Indemnification
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                You agree to indemnify, defend, and hold harmless KittyPay and its officers, directors, employees, and agents from any claims, 
                liabilities, damages, losses, costs, or expenses, including reasonable attorneys' fees, arising out of or in any way connected 
                with your access to or use of our Services, your violation of these Terms, or your violation of any rights of another.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                12. Governing Law
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                Any dispute arising from these Terms shall be resolved exclusively in the courts of Mumbai, India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                13. Changes to Terms
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                KittyPay reserves the right to update or change these Terms at any time by posting the revised Terms on our website. Your continued 
                use of the Services after any such changes constitutes your acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                14. Contact Information
              </h2>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                If you have any questions about these Terms, please contact us at:
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

export default Terms;