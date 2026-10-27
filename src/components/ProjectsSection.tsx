import React from 'react';
import { Github, ExternalLink } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
}

const PROJECTS: Project[] = [
  {
    id: '01',
    title: 'Line Follower Obstacle Avoiding Robot',
    description:
      'Developed an Arduino-based autonomous robot in C/C++ with line-following and obstacle-avoidance using IR and ultrasonic sensors, servo motor, and L298 motor driver.',
    tags: ['Arduino C/C++', 'Sensors', 'Arduino UNO', 'L298 Driver', 'Ultrasonic Sonar'],
  },
  {
    id: '02',
    title: 'Stock Management System',
    description:
      'Built a stock management system for inventory tracking, order and supplier management, and reporting to support efficient stock control.',
    tags: ['PHP', 'HTML', 'CSS', 'JavaScript', 'MySQL'],
  },
  {
    id: '03',
    title: 'AI Search Bot',
    description:
      'Built an intelligent bot that provides all information related to text queries in a search box, using Google Gemini 2.5 Flash.',
    tags: ['Python', 'Gemini 2.5 Flash', 'API Integration'],
    githubUrl: 'https://github.com/Mr-K-17/AI-search-bot.git',
  },
  {
    id: '04',
    title: 'LawPoint',
    description:
      'Designed an AI-based lawyer–client matching platform to improve access to legal services through intelligent recommendations, real-time chat interfaces, and community feeds.',
    tags: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Socket.io', 'Gemini 2.5 Flash'],
    githubUrl: 'https://github.com/Mr-K-17/LawPoint.git',
  },
  {
    id: '05',
    title: 'Habit Tracker (Coding activities)',
    description:
      'Built a Java Swing desktop application with JDBC to track daily habits and automatically log VS Code coding time, storing progress in MySQL.',
    tags: ['Java', 'Collections', 'Swing', 'JDBC', 'MySQL'],
    githubUrl: 'https://github.com/Mr-K-17/CodeHabitTracker.git',
  },
];

export const ProjectsSection: React.FC = () => {
  return (
    <section id="work" className="relative w-full pl-[84px] pr-4 py-28 md:pl-[120px] md:pr-8 lg:px-8 text-white z-10">
      <div className="max-w-[720px] xl:max-w-[800px] 2xl:max-w-[880px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/65 block mb-2">
              Featured Work
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight text-white">
              Work
            </h2>
          </div>
          <a
            href="https://github.com/Mr-K-17"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 md:mt-0 px-4 py-2 rounded-full velvet-card text-xs font-mono text-white/90 flex items-center space-x-2 transition-all hover:text-white"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub (@Mr-K-17)</span>
            <ExternalLink className="w-3 h-3 text-white/65" />
          </a>
        </div>

        {/* Projects Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="velvet-card p-6 md:p-7 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-[10px] font-mono text-white/65 uppercase tracking-widest">
                    Project #{project.id}
                  </span>
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/60 hover:text-white transition-colors"
                      title="GitHub Repository"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <h3 className="font-sans text-xl font-bold tracking-tight text-white">
                  {project.title}
                </h3>

                <p className="text-xs md:text-sm text-white/75 font-sans leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Bottom Tags and GitHub Link */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-mono text-white/80 hover:text-white transition-colors"
                  >
                    <span>Code</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
