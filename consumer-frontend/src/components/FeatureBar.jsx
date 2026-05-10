import { Truck, Shield, HandHeart, Star } from 'lucide-react';
import './FeatureBar.css';

const features = [
  { icon: Truck, label: 'Free Delivery', desc: 'On orders above ₹499' },
  { icon: HandHeart, label: 'Handcrafted', desc: 'By Pahadi artisans' },
  { icon: Shield, label: 'Secure Payment', desc: 'Razorpay protected' },
  { icon: Star, label: 'Top Rated', desc: '4.8★ customer rating' },
];

const FeatureBar = () => (
  <section className="feature-bar">
    {features.map((f, i) => (
      <div key={i} className="feature-item animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
        <f.icon size={22} strokeWidth={1.5} className="feature-icon" />
        <div>
          <div className="feature-label">{f.label}</div>
          <div className="feature-desc">{f.desc}</div>
        </div>
      </div>
    ))}
  </section>
);

export default FeatureBar;
