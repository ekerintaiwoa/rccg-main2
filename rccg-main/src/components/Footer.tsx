import React from 'react';
import { Cross, Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6 text-white">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Cross className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">RCCG Lübeck</span>
            </div>
            <p className="max-w-xs mb-8">
              Empowering our community through faith, hope, and love. Join us this Sunday.
            </p>
            <div className="flex gap-4">
              <Facebook className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Instagram className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
              <Youtube className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Connect</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-blue-500" />
                123 Faith Lane, City, ST
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-blue-500" />
                (555) 123-4567
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-blue-500" />
                info@rccglübeck.com
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Resources</h4>
            <ul className="space-y-4 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">Sermon Archive</li>
              <li className="hover:text-white cursor-pointer transition-colors">Prayer Request</li>
              <li className="hover:text-white cursor-pointer transition-colors">Small Groups</li>
              <li className="hover:text-white cursor-pointer transition-colors">Giving</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-16 pt-8 flex flex-col md:row justify-between items-center gap-4 text-xs">
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
