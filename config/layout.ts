interface SpacingConfig {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

interface GridConfig {
  mobile: {
    columns: number;
    gap: string;
  };
  tablet: {
    columns: number;
    gap: string;
  };
  desktop: {
    columns: number;
    gap: string;
  };
}

interface ContainerConfig {
  maxWidth: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  padding: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export const SPACING: SpacingConfig = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem'
};

export const GRID: GridConfig = {
  mobile: {
    columns: 1,
    gap: SPACING.md
  },
  tablet: {
    columns: 2,
    gap: SPACING.lg
  },
  desktop: {
    columns: 3,
    gap: SPACING.xl
  }
};

export const CONTAINER: ContainerConfig = {
  maxWidth: {
    mobile: '100%',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px'
  },
  padding: {
    mobile: SPACING.sm,
    tablet: SPACING.md,
    desktop: SPACING.lg
  }
};

export const getSpacingClass = (size: keyof SpacingConfig): string => {
  return `p-[${SPACING[size]}]`;
};

export const getGridClass = (breakpoint: keyof GridConfig): string => {
  const config = GRID[breakpoint];
  return `grid grid-cols-${config.columns} gap-[${config.gap}]`;
};

export const getContainerClass = (maxWidth: keyof ContainerConfig['maxWidth']): string => {
  return `max-w-[${CONTAINER.maxWidth[maxWidth]}] mx-auto px-[${CONTAINER.padding.mobile}] md:px-[${CONTAINER.padding.tablet}] lg:px-[${CONTAINER.padding.desktop}]`;
}; 