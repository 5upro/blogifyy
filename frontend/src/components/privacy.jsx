import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/App.css';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <nav className="bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/[0.06] fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <img src="/blog.png" alt="blogify" className="h-10 w-14 object-contain" />
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Blogify
              </span>
            </button>
            <button
              onClick={() => navigate(-1)}
              className="bg-white/[0.06] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.1] px-6 py-2.5 rounded-xl font-medium transition-all"
            >
              Back
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="privacy-content">
            <h1 className="text-5xl font-bold text-white/90 mb-4">Privacy Policy</h1>
            <p className="last-updated text-white/40 mb-8">Last Updated: March 14, 2026</p>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">1. Scope</h2>
              <p className="text-white/60 leading-relaxed">
                This Privacy Policy explains how Blogify collects, uses, and protects information when you use our website and API.
                It is based on the features currently implemented in our frontend and backend codebase.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">2. Information We Collect</h2>

              <h3 className="text-2xl font-semibold text-white/80 mb-3">2.1 Account Information</h3>
              <p className="text-white/60 mb-3">When you register or use authentication features, we collect:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li><strong>Name:</strong> Stored in your account profile and shown as the blog author name.</li>
                <li><strong>Email address:</strong> Used for login, OTP verification, and password reset flows.</li>
                <li><strong>Password:</strong> Stored as a hashed password (not plain text).</li>
                <li><strong>Role:</strong> Stored as <strong>user</strong> or <strong>admin</strong> for access control.</li>
              </ul>

              <h3 className="text-2xl font-semibold text-white/80 mb-3">2.2 Verification and Security Data</h3>
              <p className="text-white/60 mb-3">For account verification and recovery, we process:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li><strong>Email verification OTP:</strong> Temporary 6-digit code and expiry time.</li>
                <li><strong>Password reset OTP:</strong> Temporary 6-digit code and expiry time.</li>
                <li><strong>Authentication tokens:</strong> JWT used for authenticated API access.</li>
              </ul>

              <h3 className="text-2xl font-semibold text-white/80 mb-3">2.3 Blog Content Data</h3>
              <p className="text-white/60 mb-3">When you create or edit blogs, we store:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li><strong>Blog title and content:</strong> Main post text and markdown content.</li>
                <li><strong>Tags and publish status:</strong> Categorization and draft/published state.</li>
                <li><strong>Author reference:</strong> Link to the account that created the post.</li>
                <li><strong>Timestamps:</strong> Creation and update times.</li>
              </ul>

              <h3 className="text-2xl font-semibold text-white/80 mb-3">2.4 Image Upload Data</h3>
              <p className="text-white/60 mb-3">If you upload blog images, we process:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li><strong>Uploaded image file:</strong> Image selected by the user (jpg/png/jpeg).</li>
                <li><strong>Image URL and filename:</strong> Returned after upload and saved with blog data.</li>
              </ul>

              <h3 className="text-2xl font-semibold text-white/80 mb-3">2.5 Contact Form Data</h3>
              <p className="text-white/60 mb-3">If you use the Contact page, we submit:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li><strong>Name, email, subject, and message:</strong> Sent directly from frontend to Web3Forms.</li>
                <li><strong>Access key value:</strong> Included in the form payload for Web3Forms routing.</li>
              </ul>

              <h3 className="text-2xl font-semibold text-white/80 mb-3">2.6 Technical and Session Data</h3>
              <p className="text-white/60 mb-3">During API usage and security controls, we process:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li><strong>IP address and request metadata:</strong> Logged by backend request logging and rate-limiting middleware.</li>
                <li><strong>Token cookie:</strong> HTTP-only cookie named <strong>token</strong> set on login/OTP verification and cleared on logout.</li>
                <li><strong>Local storage token:</strong> JWT stored in browser localStorage by frontend auth flow.</li>
                <li><strong>Error telemetry:</strong> Client errors are monitored through Sentry when configured.</li>
                <li><strong>reCAPTCHA token:</strong> Collected in the registration UI to reduce automated sign-ups.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">3. How We Use Information</h2>
              <p className="text-white/60 mb-3">We use collected information to operate and secure Blogify:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li><strong>Authentication and access control:</strong> Login, verification, token validation, and role-based authorization.</li>
                <li><strong>Blog platform functionality:</strong> Creating, editing, publishing, and displaying blog posts.</li>
                <li><strong>Password recovery and account safety:</strong> OTP generation, validation, and reset processing.</li>
                <li><strong>Operational communication:</strong> Sending OTP, welcome, and password reset emails.</li>
                <li><strong>Abuse prevention:</strong> Request rate limiting, slowdown middleware, and basic request monitoring.</li>
                <li><strong>Issue monitoring:</strong> Detecting frontend runtime errors via Sentry to improve reliability.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">4. Services We Use (Data Processors)</h2>
              <p className="text-white/60 mb-3">To provide current app features, data may be processed by:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li><strong>Cloudinary:</strong> Stores blog image uploads.</li>
                <li><strong>Brevo:</strong> Sends authentication and account-related transactional emails.</li>
                <li><strong>Web3Forms:</strong> Receives contact form submissions from the Contact page.</li>
                <li><strong>Google reCAPTCHA:</strong> Used on registration UI to reduce bot activity.</li>
                <li><strong>Sentry:</strong> Receives frontend error/diagnostic data when Sentry DSN is configured.</li>
              </ul>
              <p className="text-white/60"><strong>We do not sell personal data.</strong></p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">5. Data Security</h2>
              <p className="text-white/60 mb-3">
                Security controls currently present in the app include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li>Password hashing using bcrypt before storage.</li>
                <li>JWT-based authentication with expiry.</li>
                <li>HTTP-only auth cookie support and protected routes.</li>
                <li>Rate limiting and request slowdown in production mode.</li>
                <li>Input validation on key backend endpoints.</li>
              </ul>
              <p className="text-white/60">
                No internet service is fully risk-free, but we continuously work to improve security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">6. Data Retention</h2>
              <p className="text-white/60">
                We retain account and blog data while your account and content remain active in the system.
                Temporary OTP values are stored only for their short validity window and then cleared when used or expired.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">7. Public Content and Admin Access</h2>
              <p className="text-white/60 mb-3">Please note the following behavior in current app functionality:</p>
              <ul className="list-disc list-inside space-y-2 text-white/60 mb-6">
                <li><strong>Published blogs are public:</strong> Posts marked as published are visible through public blog listing endpoints.</li>
                <li><strong>Admin moderation tools:</strong> Admin users can view user lists, change user roles, and delete users and their blogs.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">8. Your Choices</h2>
              <p className="text-white/60">
                You can stop using the service at any time, and you can contact us for account or privacy-related requests.
                You may also clear local storage in your browser, but protected API access will then require re-authentication.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">9. Policy Updates</h2>
              <p className="text-white/60">
                We may update this Privacy Policy when app behavior changes.
                The date at the top of this page indicates the latest revision.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-3xl font-bold text-white/90 mb-4">10. Contact</h2>
              <p className="text-white/60 mb-3">For privacy or data questions related to Blogify, contact:</p>
              <div className="bg-white/[0.04] p-6 rounded-xl border border-white/[0.06]">
                <p className="text-white/60"><strong>Blogify Support Team</strong></p>
                <p className="text-white/60">Email: blogify-privacy@surajitsen.live </p>
                <p className="text-white/60">Website: blogify.surajitsen.live</p>
              </div>
            </section>

            <footer className="border-t border-white/[0.06] pt-8 mt-12">
              <p className="text-center text-white/40">&copy; 2026 Blogify. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
