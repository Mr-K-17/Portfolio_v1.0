import React from 'react';
import { ExternalLink, FolderOpen } from 'lucide-react';

interface CertItem {
  title: string;
  date: string;
  url: string;
}

interface IssuerGroup {
  issuer: string;
  items: CertItem[];
}

const CERTIFICATE_GROUPS: IssuerGroup[] = [
  {
    issuer: 'NPTEL (IIT Madras)',
    items: [
      {
        title: 'The Joy of Computing Using Python',
        date: 'Jul–Oct 2024',
        url: 'https://drive.google.com/file/d/1to7aDhQOhd7Hd694nFccdjGWaQBJ8Vz1/view?usp=sharing',
      },
      {
        title: 'Introduction to Large Language Models (LLMs)',
        date: 'Jul–Oct 2025',
        url: 'https://drive.google.com/file/d/1oueEdB4rUTqiUyDXQ_IHr9rf-6pG6QtW/view?usp=sharing',
      },
    ],
  },
  {
    issuer: 'Infosys Springboard',
    items: [
      {
        title: 'Fundamentals of Data Networking',
        date: 'May 2025',
        url: 'https://drive.google.com/file/d/1LBvc5aDE-CXDrnYl-LpzQ1JfEfd-pnaw/view?usp=sharing',
      },
      {
        title: 'Azure DevOps',
        date: 'May 2025',
        url: 'https://drive.google.com/file/d/1SVYkio3fd6a7nf4qTi08_7iN4OkzDGkS/view?usp=sharing',
      },
      {
        title: 'Introduction to NoSQL Databases',
        date: 'Apr 2026',
        url: 'https://drive.google.com/file/d/1-1A6hJYsMQGLSFlYL4gcU1arRe_t9T0f/view?usp=drive_link',
      },
      {
        title: 'Agile Scrum in Practice',
        date: 'Apr 2026',
        url: 'https://drive.google.com/file/d/1cCnX_EzSWHdwKpV-TX4FdP6fL3kDtU2S/view?usp=drive_link',
      },
      {
        title: 'Agile Scrum Certification',
        date: 'May 2026',
        url: 'https://drive.google.com/file/d/1sEZ2wHLrfqmksxrarg4v09zDEUJpFZH_/view?usp=drive_link',
      },
      {
        title: 'Software Engineering and Agile Software Development',
        date: 'May 2026',
        url: 'https://drive.google.com/file/d/1bFfaAu1wp4M_wq4bvfrk_4QAyhX3-V9F/view?usp=drive_link',
      },
    ],
  },
  {
    issuer: 'VTU Honors Program',
    items: [
      {
        title: 'Natural Language Processing (NLP)',
        date: 'Aug 08, 2026',
        url: 'https://drive.google.com/file/d/1rBJGobQq0DuAJZOdPXJM4VgEYsUo1jxQ/view?usp=sharing',
      },
      {
        title: 'Blockchain and its Applications',
        date: 'Aug 08, 2026',
        url: 'https://drive.google.com/file/d/1uphwFSPpbAc0Ar5lyqlaqyLosQP8egLo/view?usp=sharing',
      },
      {
        title: 'Affective Computing',
        date: 'Aug 14, 2026',
        url: 'https://drive.google.com/file/d/1hv0qDhlB2X4ziBAdwYVj1BjDUENUSGMp/view?usp=sharing',
      },
    ],
  },
];

export const CertificatesSection: React.FC = () => {
  return (
    <section id="certificates" className="relative w-full pl-[84px] pr-4 py-28 md:pl-[120px] md:pr-8 lg:px-8 text-white z-10">
      <div className="max-w-[720px] xl:max-w-[800px] 2xl:max-w-[880px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/65 block mb-2">
              Credentials
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight text-white">
              Certificates
            </h2>
          </div>

          <a
            href="https://drive.google.com/drive/folders/1wwhFrEVSH8mRZf-IUB981AXmC_W_IQ3l?usp=drive_link"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 md:mt-0 px-4 py-2 rounded-full velvet-card text-xs font-mono text-white/90 flex items-center space-x-2 transition-all hover:text-white"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Google Drive Folder</span>
            <ExternalLink className="w-3 h-3 text-white/65" />
          </a>
        </div>

        {/* Grouped Certificates List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CERTIFICATE_GROUPS.map((group) => (
            <div
              key={group.issuer}
              className="velvet-card p-6 flex flex-col justify-between space-y-4"
            >
              <div>
                <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-white/80 pb-3 border-b border-white/10 mb-4">
                  {group.issuer}
                </h3>

                <ul className="space-y-4">
                  {group.items.map((item) => (
                    <li
                      key={item.title}
                      className="flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-sans font-medium text-white/90 block leading-snug">
                          {item.title}
                        </span>
                        <span className="font-mono text-[10px] text-white/65 block">
                          {item.date}
                        </span>
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[11px] text-white/70 hover:text-white inline-flex items-center space-x-1 shrink-0 pt-0.5 transition-colors"
                      >
                        <span>View</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
