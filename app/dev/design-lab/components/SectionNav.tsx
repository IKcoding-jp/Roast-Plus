'use client';

import { labSections } from './registry';

interface SectionNavProps {
  activeSection: string;
  onSectionClick: (sectionId: string) => void;
}

export default function SectionNav({ activeSection, onSectionClick }: SectionNavProps) {
  return (
    <nav className="flex flex-col gap-0.5">
      <p className="px-3 py-1 text-xs font-semibold text-ink-muted uppercase tracking-wider mb-1">
        Sections
      </p>
      {labSections.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive
                ? 'bg-spot-subtle text-spot font-semibold'
                : 'text-ink-sub hover:bg-ground hover:text-ink'
            }`}
          >
            {section.title}
          </button>
        );
      })}
    </nav>
  );
}
