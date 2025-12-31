"use client";

import Link from "next/link";
import { Mail, Lock } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="wrapper">
      {/* LEFT */}
      <div className="left">
        {/* BRAND */}
        <div className="brand">
          <h1>5 STAR WEDDINGS</h1>
          <span>Concierge Platform</span>
        </div>

        <h2>Admin access</h2>
        <p>Secure system login for platform administrators.</p>

        <form>
          <div className="field">
            <Mail size={14} />
            <input type="email" placeholder="Admin email" />
          </div>

          <div className="field">
            <Lock size={14} />
            <input type="password" placeholder="Password" />
          </div>

          <button type="submit">Sign in</button>

          <Link href="/forgot-password" className="forgot">
            Forgot password
          </Link>
        </form>

        <footer>
          © 2026 5 Star Weddings, Concierge Platform. Powered by Taigenic.ai ·{" "}
          <button>Cookie Preferences</button>
        </footer>
      </div>

      {/* RIGHT IMAGE */}
      <div className="right" />

      {/* STYLES */}
      <style jsx>{`
        .wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          font-family: "Nunito Sans", sans-serif;
        }

        .left {
          padding: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .brand {
          text-align: center;
          margin-bottom: 40px;
        }

        .brand h1 {
          font-family: "Gilda Display", serif;
          font-size: 44px;
          margin-bottom: 6px;
        }

        .brand span {
          font-size: 13px;
          letter-spacing: 2px;
          color: #c5a059;
          font-weight: 800;
        }

        h2 {
          font-family: "Gilda Display", serif;
          font-size: 32px;
          margin-bottom: 8px;
          text-align: center;
        }

        p {
          text-align: center;
          color: #666;
          margin-bottom: 32px;
          font-size: 15px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 14px 16px;
        }

        .field input {
          border: none;
          outline: none;
          width: 100%;
          font-size: 14px;
        }

        button[type="submit"] {
          margin-top: 12px;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: #183f34;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
        }

        .forgot {
          margin-top: 14px;
          text-align: center;
          font-size: 13px;
          color: #777;
          text-decoration: none;
        }

        footer {
          margin-top: 60px;
          text-align: center;
          font-size: 11px;
          color: #999;
        }

        footer button {
          background: none;
          border: none;
          color: #183f34;
          font-weight: 600;
          cursor: pointer;
          font-size: 11px;
        }

        .right {
          background-image: url("https://images.unsplash.com/photo-1500530855697-b586d89ba3ee");
          background-size: cover;
          background-position: center;
        }

        /* ✅ MOBILE FIX */
        @media (max-width: 900px) {
          .wrapper {
            grid-template-columns: 1fr;
          }

          .right {
            display: none;
          }

          .left {
            padding: 48px 24px;
          }

          .brand h1 {
            font-size: 36px;
          }

          h2 {
            font-size: 28px;
          }
        }
      `}</style>
    </div>
  );
}
