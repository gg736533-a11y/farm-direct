import React from 'react';

export default function SectionHeader({
  tag,
  title,
  subtitle,
  align = 'center',
  className = '',
  titleClassName = '',
}) {
  const alignment = align === 'left' ? 'text-left items-start' : 'text-center items-center';

  return (
    <div className={`flex flex-col ${alignment} max-w-3xl mx-auto mb-10 md:mb-14 ${className}`}>
      {tag && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-forest-100/70 text-forest-800 border border-forest-200/50 mb-3.5">
          {tag}
        </div>
      )}
      {title && (
        <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-charcoal-900 leading-tight ${titleClassName}`}>
          {title}
        </h2>
      )}
      {subtitle && (
        <p className="mt-3.5 text-base sm:text-lg text-charcoal-700 leading-relaxed max-w-2xl font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
