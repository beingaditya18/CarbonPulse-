import React from 'react';

/**
 * Accessible wrapper for Recharts visualizations.
 * Provides screen reader summary and keyboard context.
 */
interface AccessibleChartProps {
  title: string;
  summary: string;
  children: React.ReactNode;
}

export function AccessibleChart({
  title,
  summary,
  children
}: AccessibleChartProps) {
  const chartId = `chart-desc-${title.replace(/\s+/g, '-').toLowerCase()}`;
  return (
    <figure
      role="img"
      aria-label={title}
      aria-describedby={chartId}
    >
      <figcaption
        id={chartId}
        className="sr-only"
      >
        {summary}
      </figcaption>
      {children}
    </figure>
  );
}
