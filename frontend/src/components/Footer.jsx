import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-col">
          <Link to="/" className="footer-logo-link">
            <img
              src={logoImg}
              alt="Elite Bats"
              className="footer-brand-logo"
            />
          </Link>
          <p className="footer-desc">
            Premium handcrafted English and Kashmir willow cricket bats engineered for
            unmatched ping, balance, and durability.
          </p>
          <p className="footer-person">
            <strong>Contact Person:</strong> Shreedhar
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop Collection</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact & Enquiry</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4 className="footer-title">Direct Contact</h4>
          <ul className="footer-contact-list">
            <li>
              <span>Phone:</span>{' '}
              <a href="tel:7339410995" className="contact-link">7339410995</a>
            </li>
            <li>
              <span>WhatsApp:</span>{' '}
              <a
                href="https://wa.me/917339410995"
                target="_blank"
                rel="noreferrer"
                className="contact-link"
              >
                +91 7339410995
              </a>
            </li>
            <li>
              <span>Email:</span>{' '}
              <a href="mailto:silvashreedhar539@gmail.com" className="contact-link">
                silvashreedhar539@gmail.com
              </a>
            </li>
            <li>
              <span>Instagram:</span>{' '}
              <a
                href="https://instagram.com/ms.shreedhar"
                target="_blank"
                rel="noreferrer"
                className="contact-link"
              >
                @ms.shreedhar
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {currentYear} Elite Bats. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
