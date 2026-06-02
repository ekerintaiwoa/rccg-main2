import React from 'react';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import logo from '../../logo.png';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-slate-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="RCCG Logo" className="w-12 h-12 object-contain" />
              <div>
                <div className="brand-heading text-white text-xl">RCCG Lübeck</div>
                <div className="text-sm text-slate-300">A warm, faith-filled church community</div>
              </div>
            </div>

            <p className="max-w-lg text-slate-300 mb-6">
              Empowering our community through worship, discipleship and service. Join our Sunday services or connect with a small group.
            </p>

            <div className="flex items-center gap-3">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Youtube className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-sky-300" />
                Wesleystraße 14-15, 23556 Lübeck
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-sky-300" />
                01786365757
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-sky-300" />
                info@rccgluebeck.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="hover:text-white cursor-pointer">Sermon Archive</li>
              <li className="hover:text-white cursor-pointer">Prayer Request</li>
              <li className="hover:text-white cursor-pointer">Small Groups</li>
              <li className="hover:text-white cursor-pointer">Giving</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2026 Redeemed Christian Church of God. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
