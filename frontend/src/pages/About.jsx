import { Link } from 'react-router-dom';
import './Pages.css';

function About() {
  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'center', borderBottom: 'none', marginBottom: '1.5rem' }}>
        <span style={{ color: '#cda35f', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.2px' }}>
          Craftsmanship & Heritage
        </span>
        <h1 className="page-title" style={{ fontSize: '2.5rem', color: '#0b0c0e', marginTop: '0.35rem' }}>
          About Elite Bats
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
          Dedicated to bringing player-grade English and Kashmir willow cricket blades directly to batsmen who demand perfection.
        </p>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid #e2e8f0',
        borderRadius: '12px',
        padding: '3rem 2rem',
        maxWidth: '900px',
        margin: '0 auto 3rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo.png" alt="Elite Bats" style={{ height: '70px', objectFit: 'contain' }} />
        </div>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b0c0e', marginBottom: '0.85rem' }}>
          Our Bat-Making Philosophy
        </h3>
        <p style={{ color: '#475569', lineHeight: '1.8', fontSize: '1rem', marginBottom: '1.5rem' }}>
          Led by <strong>Shreedhar</strong>, Elite Bats was founded on a simple truth: every batsman has a unique backlift, pick-up preference, and stroke dynamic. We hand-select clefts with straight, even grains and press them to optimal density, ensuring unmatched sweet spot rebound without sacrificing featherlight balance.
        </p>

        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0b0c0e', marginBottom: '0.85rem' }}>
          Workshop Services
        </h3>
        <ul style={{ color: '#475569', lineHeight: '1.9', paddingLeft: '1.25rem', marginBottom: '2rem' }}>
          <li><strong>Individual Cleft Selection:</strong> Grade 1 to Grade 3 English Willow and select seasoned Kashmir Willow.</li>
          <li><strong>Hand-Knocking & Oiling:</strong> Multi-stage mallet knocking and linseed oil preparation for match readiness.</li>
          <li><strong>Custom Weight Matching:</strong> Shaving and spine tuning to match your exact gram preference.</li>
          <li><strong>Toe-Guarding & Extratec Protection:</strong> Shielding edges and toes against fast-bowler yorkers.</li>
        </ul>

        <div style={{
          backgroundColor: '#0b0c0e',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h4 style={{ color: '#cda35f', fontSize: '1.15rem', marginBottom: '0.25rem' }}>Have Custom Specifications?</h4>
            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0 }}>Consult with Shreedhar for cleft recommendations.</p>
          </div>
          <Link to="/contact" className="btn-primary" style={{ padding: '0.7rem 1.4rem', fontSize: '0.92rem' }}>
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
}

export default About;
