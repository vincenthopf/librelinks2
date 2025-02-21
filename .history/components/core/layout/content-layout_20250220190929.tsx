import React from 'react';
import { CONTAINER, GRID, SPACING, getContainerClass, getGridClass } from '@/config/layout';

interface ContentLayoutProps {
  children: React.ReactNode;
  maxWidth?: keyof typeof CONTAINER.maxWidth;
  grid?: boolean;
  spacing?: keyof typeof SPACING;
  className?: string;
}

const ContentLayout: React.FC<ContentLayoutProps> = ({
  children,
  maxWidth = 'desktop',
  grid = false,
  spacing = 'md',
  className = ''
}) => {
  // Build container classes
  const containerClasses = getContainerClass(maxWidth);
  const spacingClass = `p-[${SPACING[spacing]}]`;
  
  // Build grid classes if needed
  const gridClasses = grid ? `
    ${getGridClass('mobile')}
    md:${getGridClass('tablet')}
    lg:${getGridClass('desktop')}
  ` : '';

  return (
    <div className={`
      content-layout
      ${containerClasses}
      ${spacingClass}
      ${gridClasses}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default ContentLayout;

// Export a grid container component for convenience
export const GridContainer: React.FC<Omit<ContentLayoutProps, 'grid'>> = (props) => (
  <ContentLayout {...props} grid={true} />
); 