import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="font-display text-2xl font-bold tracking-tighter">
              TIGHTHUG
            </Link>
            <p className="text-sm text-primary-foreground/70 max-w-xs">
              Premium streetwear for the modern individual. Quality meets style in every piece.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Shop</h3>
            <ul className="space-y-2">
              {['All Products', 'T-Shirts', 'Hoodies', 'Jackets', 'Pants'].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Help</h3>
            <ul className="space-y-2">
              {['Track Order', 'Returns & Exchanges', 'Shipping Info', 'Size Guide', 'Contact Us'].map((item) => (
                <li key={item}>
                  <Link
                    to="/"
                    className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider">Connect</h3>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-primary-foreground/70">
              support@tighthug.com
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-xs text-primary-foreground/50">
              © {new Date().getFullYear()} TightHug. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link to="/" className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/" className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
