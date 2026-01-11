import './Footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>📞 Phone: (555) 123-4567</p>
          <p>📧 Email: info@cleanpro.com</p>
        </div>
        <div className="footer-section">
          <h3>Hours</h3>
          <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
          <p>Saturday: 9:00 AM - 4:00 PM</p>
          <p>Sunday: Closed</p>
        </div>
        <div className="footer-section">
          <h3>Location</h3>
          <p>123 Clean Street</p>
          <p>Seattle, WA 98101</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 CleanPro Services. All rights reserved.</p>
      </div>
    </footer>
  );
}
