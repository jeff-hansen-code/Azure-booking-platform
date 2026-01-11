import './Contact.css';

export function Contact() {
  return (
    <div className="contact">
      <div className="container">
        <h1>Contact Us</h1>
        
        <div className="contact-content">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>Have questions? We'd love to hear from you!</p>
            
            <div className="contact-details">
              <div className="contact-item">
                <h3>📞 Phone</h3>
                <p>(555) 123-4567</p>
              </div>
              
              <div className="contact-item">
                <h3>📧 Email</h3>
                <p>info@cleanpro.com</p>
              </div>
              
              <div className="contact-item">
                <h3>📍 Address</h3>
                <p>123 Clean Street<br/>Seattle, WA 98101</p>
              </div>
              
              <div className="contact-item">
                <h3>🕐 Business Hours</h3>
                <p>
                  Monday - Friday: 8:00 AM - 6:00 PM<br/>
                  Saturday: 9:00 AM - 4:00 PM<br/>
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
