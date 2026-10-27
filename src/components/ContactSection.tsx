import React, { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Github, FileText, ArrowUpRight, Copy, Check } from 'lucide-react';
import { assetUrl } from '../lib/assetUrl';

export const ContactSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText('kishoresathyagala@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer id="contact" className="relative w-full pl-[84px] pr-4 pt-28 pb-24 md:pl-[120px] md:pr-8 lg:px-8 text-white z-10 border-t border-white/10">
      <div className="max-w-[720px] xl:max-w-[800px] 2xl:max-w-[880px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/65 block mb-2">
              Get In Touch
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight text-white">
              Contact
            </h2>
          </div>
          <p className="max-w-md text-xs md:text-sm text-white/75 font-light mt-4 md:mt-0 font-sans leading-relaxed">
            Looking for a Software Engineer Intern role. Reach out for opportunities, collaboration, or technical inquiries.
          </p>
        </div>

        {/* Contact Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Email */}
          <div className="velvet-card p-6 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-white/65 uppercase tracking-wider block">Email</span>
              <a
                href="mailto:kishoresathyagala@gmail.com"
                className="text-xs font-mono text-white hover:text-amber-200 transition-colors block mt-1 break-all"
              >
                kishoresathyagala@gmail.com
              </a>
            </div>
            <button
              onClick={copyEmail}
              className="text-[10px] font-mono text-white/65 hover:text-white flex items-center space-x-1 pt-1"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied to clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy email</span>
                </>
              )}
            </button>
          </div>

          {/* Phone */}
          <div className="velvet-card p-6 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-white/65 uppercase tracking-wider block">Phone</span>
              <a
                href="tel:+918971301934"
                className="text-xs font-mono text-white hover:text-emerald-300 transition-colors block mt-1"
              >
                +91 8971301934
              </a>
            </div>
            <span className="text-[10px] font-mono text-white/65 block pt-1">
              Call / WhatsApp
            </span>
          </div>

          {/* Location */}
          <div className="velvet-card p-6 space-y-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono text-white/65 uppercase tracking-wider block">Location</span>
              <p className="text-xs font-mono text-white mt-1">
                SVP Nagar, Mysuru
              </p>
            </div>
            <span className="text-[10px] font-mono text-white/65 block pt-1">
              Karnataka, India
            </span>
          </div>

          {/* Social Profiles */}
          <div className="velvet-card p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/90">
                <Linkedin className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono text-white/65 uppercase tracking-wider block">Profiles</span>
            </div>

            <div className="space-y-2 pt-2 border-t border-white/10">
              <a
                href="https://www.linkedin.com/in/kishore-s-v-948b92290/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-xs font-mono text-white/80 hover:text-white transition-colors"
              >
                <span className="inline-flex items-center space-x-1.5">
                  <Linkedin className="w-3 h-3 text-white/70" />
                  <span>LinkedIn</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/Mr-K-17"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-xs font-mono text-white/80 hover:text-white transition-colors"
              >
                <span className="inline-flex items-center space-x-1.5">
                  <Github className="w-3 h-3 text-white/70" />
                  <span>GitHub</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href={assetUrl('/resume.pdf')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-xs font-mono text-white/80 hover:text-white transition-colors"
              >
                <span className="inline-flex items-center space-x-1">
                  <FileText className="w-3 h-3" />
                  <span>Resume PDF</span>
                </span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-white/65 gap-4">
          <p>© {new Date().getFullYear()} KISHORE S V. All rights reserved.</p>
          <p>Portfolio v1.2 • Built with React, TypeScript & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};
