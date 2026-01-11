import { Link } from 'react-router-dom';
import './Home.css';

export function Home() {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Professional Cleaning Services</h1>
          <p>Transform your space with our expert cleaning solutions</p>
          <Link to="/book" className="cta-button">Book Appointment</Link>
        </div>
      </section>

      <section className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Standard Cleaning</h3>
              <p>Regular maintenance cleaning for your home or office</p>
              <ul>
                <li>Dusting and vacuuming</li>
                <li>Kitchen and bathroom cleaning</li>
                <li>Floor mopping</li>
              </ul>
              <p className="price">Starting at $120</p>
            </div>
            
            <div className="service-card">
              <h3>Deep Clean</h3>
              <p>Thorough cleaning for those hard-to-reach areas</p>
              <ul>
                <li>Everything in Standard</li>
                <li>Baseboards and window sills</li>
                <li>Inside appliances</li>
                <li>Detailed bathroom scrubbing</li>
              </ul>
              <p className="price">Starting at $220</p>
            </div>
            
            <div className="service-card">
              <h3>Move-Out Cleaning</h3>
              <p>Complete cleaning for moving in or out</p>
              <ul>
                <li>Everything in Deep Clean</li>
                <li>Inside cabinets and drawers</li>
                <li>Window cleaning</li>
                <li>Carpet shampooing (optional)</li>
              </ul>
              <p className="price">Starting at $350</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
