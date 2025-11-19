import React from "react";
import Logo from "../pages/logo";
import "../css/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div>
          <div className="flex items-center gap-3 mb-4">
            <Logo size="40" />
            <h3 className="logo-footer">Hello Dr</h3>
          </div>
          <p className="footer-text">
            Connecting patients with healthcare professionals for better outcomes.
          </p>
        </div>

        <div>
          <h4 className="footer-title">Support</h4>
          <ul className="footer-links">
            <li><button>Help Center</button></li>
            <li><button>Privacy Policy</button></li>
            <li><button>Terms of Service</button></li>
            <li><button>Contact Us</button></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
