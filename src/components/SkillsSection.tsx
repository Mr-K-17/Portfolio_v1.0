import React from 'react';

export const SkillsSection: React.FC = () => {
  const technicalSkills = [
    {
      category: 'Frontend',
      items: ['HTML5', 'CSS3'],
    },
    {
      category: 'Backend',
      items: ['Java', 'Spring Boot'],
    },
    {
      category: 'Database',
      items: ['MySQL', 'MongoDB'],
    },
    {
      category: 'Languages',
      items: ['Java', 'C', 'SQL'],
    },
    {
      category: 'Tools',
      items: [
        'VS Code',
        'NetBeans',
        'Arduino IDE',
        'Cursor',
        'IntelliJ IDEA',
        'Git',
        'GitHub',
        'GitLab',
        'Docker',
      ],
    },
  ];

  const softSkills = [
    'Teamwork and collaboration',
    'Critical thinking and Problem-solving',
    'Adaptability',
    'Time management',
    'Communication and Active listening',
  ];

  return (
    <section id="skills" className="relative w-full pl-[84px] pr-4 py-28 md:pl-[120px] md:pr-8 lg:px-8 text-white z-10">
      <div className="max-w-[720px] xl:max-w-[800px] 2xl:max-w-[880px] mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end pb-6 border-b border-white/10">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/65 block mb-2">
              Capabilities
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl font-bold tracking-tight text-white">
              Skills
            </h2>
          </div>
        </div>

        {/* Technical Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicalSkills.map((group) => (
            <div
              key={group.category}
              className={`velvet-card p-6 space-y-4 ${
                group.category === 'Tools' ? 'md:col-span-2 lg:col-span-2' : ''
              }`}
            >
              <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-white/80 pb-2 border-b border-white/10">
                {group.category}
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-mono text-white/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Soft Skills in One Plain Line */}
        <div className="velvet-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="font-sans font-bold text-xs uppercase tracking-wider text-white/80 sm:whitespace-nowrap">
            Soft Skills
          </span>
          <p className="text-xs md:text-sm font-sans text-white/70 leading-relaxed">
            {softSkills.join(' • ')}
          </p>
        </div>
      </div>
    </section>
  );
};
