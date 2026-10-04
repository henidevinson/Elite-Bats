import './Contact.css';

function Contact() {
  const business = {
    brand: 'Elite Bats',
    contactPerson: 'Shreedhar',
    phone: '7339410995',
    whatsapp: '7339410995',
    email: 'silvashreedhar539@gmail.com',
    instagram: 'ms.shreedhar'
  };

  // 1. WhatsApp direct link with pre-filled message
  const whatsappPreFilledText = 'Hello Elite Bats, I would like to know more about your cricket bats.';
  const whatsappUrl = `https://wa.me/91${business.whatsapp}?text=${encodeURIComponent(whatsappPreFilledText)}`;

  // 2. Direct Call protocol
  const phoneCallUrl = `tel:${business.phone}`;

  // 3. Mailto link with pre-filled subject and recipient
  const emailSubject = 'Enquiry - Elite Bats Cricket Equipment';
  const emailBody = `Hi ${business.contactPerson},\n\nI am contacting you from the Elite Bats website. I would like more information regarding bat models, available weights, and shipping.\n\nThank you!`;
  const mailtoUrl = `mailto:${business.email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // 4. Instagram link
  const instagramUrl = `https://instagram.com/${business.instagram}`;

  return (
    <div className="contact-page-container">
      {/* Page Heading */}
      <div className="contact-header">
        <span className="contact-tag">Direct Consultations</span>
        <h1 className="contact-title">Contact Elite Bats</h1>
        <p className="contact-subtitle">
          Have questions about willow grades, grain profiles, weight selection,
          or knocking-in services? Speak directly with <strong>{business.contactPerson}</strong>.
        </p>
      </div>

      {/* Prominent WhatsApp Feature Banner */}
      <div className="contact-highlight-banner">
        <div className="highlight-banner-text">
          <h3>Instant Bat Consultation on WhatsApp</h3>
          <p>Request live bat ping videos, balance checks, and grain photos directly on your phone.</p>
        </div>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-whatsapp-hero"
        >
          <span>💬 Chat with {business.contactPerson}</span>
        </a>
      </div>

      {/* 4 Interactive Contact Channels */}
      <div className="contact-cards-grid">
        {/* 1. Phone Call */}
        <div className="contact-channel-card">
          <div className="channel-icon-bubble bubble-phone">📞</div>
          <h3 className="channel-name">Phone Support</h3>
          <p className="channel-subtext">Direct voice call for urgent bat enquiries and order guidance.</p>
          <a href={phoneCallUrl} className="btn-channel-action btn-phone-action">
            <span>Call {business.phone}</span>
          </a>
        </div>

        {/* 2. WhatsApp Direct */}
        <div className="contact-channel-card">
          <div className="channel-icon-bubble bubble-whatsapp">💬</div>
          <h3 className="channel-name">WhatsApp</h3>
          <p className="channel-subtext">Instant messaging, video pings, and photo verification.</p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-channel-action btn-whatsapp-action"
          >
            <span>Message on WhatsApp</span>
          </a>
        </div>

        {/* 3. Email Inquiries */}
        <div className="contact-channel-card">
          <div className="channel-icon-bubble bubble-email">✉️</div>
          <h3 className="channel-name">Email</h3>
          <p className="channel-subtext">{business.email}</p>
          <a href={mailtoUrl} className="btn-channel-action btn-email-action">
            <span>Send Email Enquiry</span>
          </a>
        </div>

        {/* 4. Instagram Profile */}
        <div className="contact-channel-card">
          <div className="channel-icon-bubble bubble-instagram">📸</div>
          <h3 className="channel-name">Instagram</h3>
          <p className="channel-subtext">Follow our latest bat drops and workshop stories @{business.instagram}</p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-channel-action btn-instagram-action"
          >
            <span>View @{business.instagram}</span>
          </a>
        </div>
      </div>

      {/* Workshop Information & Business Credentials */}
      <div className="workshop-info-card">
        <div className="workshop-header">
          <h3>Customer Support & Custom Orders</h3>
          <span className="workshop-badge">Verified Artisan Workshop</span>
        </div>

        <div className="workshop-details-grid">
          <div>
            <div className="workshop-item-title">Contact Person</div>
            <div className="workshop-item-desc">{business.contactPerson}</div>
          </div>

          <div>
            <div className="workshop-item-title">Specialized Services</div>
            <div className="workshop-item-desc">
              Custom weight matching, double-oil knocking-in, and professional toe protection.
            </div>
          </div>

          <div>
            <div className="workshop-item-title">Official Brand Handle</div>
            <div className="workshop-item-desc">
              Instagram: <strong>@{business.instagram}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
