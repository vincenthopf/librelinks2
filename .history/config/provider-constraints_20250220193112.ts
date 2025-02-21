import { ProviderName } from '@/types/embed';

interface AspectRatio {
  mobile: string;
  tablet?: string;
  desktop?: string;
}

interface ProviderConstraints {
  maxWidth: {
    mobile: string;
    tablet?: string;
    desktop?: string;
  };
  maxHeight?: {
    mobile: string;
    tablet?: string;
    desktop?: string;
  };
  aspectRatio?: AspectRatio;
  minHeight?: string;
  padding?: {
    mobile: string;
    tablet?: string;
    desktop?: string;
  };
}

export const PROVIDER_CONSTRAINTS: Record<ProviderName, ProviderConstraints> = {
  Spotify: {
    maxWidth: {
      mobile: '100%',
      tablet: '450px',
      desktop: '450px'
    },
    maxHeight: {
      mobile: '152px',
      tablet: '152px',
      desktop: '152px'
    },
    padding: {
      mobile: '0.5rem',
      tablet: '0.75rem',
      desktop: '1rem'
    }
  },
  YouTube: {
    maxWidth: {
      mobile: '60%',
      tablet: '560px',
      desktop: '560px'
    },
    aspectRatio: {
      mobile: '16/9',
      tablet: '16/9',
      desktop: '16/9'
    },
    padding: {
      mobile: '0',
      tablet: '0',
      desktop: '0'
    }
  },
  Instagram: {
    maxWidth: {
      mobile: '290px',
      tablet: '300px',
      desktop: '30px'
    },
    maxHeight: {
      mobile: '10%',
      tablet: '10%',
      desktop: '10%'
    },
    aspectRatio: {
      mobile: '1/2',
      tablet: '1/2',
      desktop: '1/2'
    },
    padding: {
      mobile: '0',
      tablet: '0',
      desktop: '0'
    }
  },
  Twitter: {
    maxWidth: {
      mobile: '100%',
      tablet: '550px',
      desktop: '550px'
    },
    aspectRatio: {
      mobile: 'auto',
      tablet: '1.91/1',
      desktop: '1.91/1'
    },
    minHeight: '250px',
    padding: {
      mobile: '1rem',
      tablet: '1rem',
      desktop: '1rem'
    }
  },
  TikTok: {
    maxWidth: {
      mobile: '100%',
      tablet: '325px',
      desktop: '325px'
    },
    aspectRatio: {
      mobile: '9/16',
      tablet: '9/16',
      desktop: '9/16'
    },
    minHeight: '500px',
    padding: {
      mobile: '0',
      tablet: '0',
      desktop: '0'
    }
  },
  Generic: {
    maxWidth: {
      mobile: '50%',
      tablet: '300px',
      desktop: '300px'
    },
    aspectRatio: {
      mobile: '4/3',
      tablet: '9/9',
      desktop: '9/9'
    },
    padding: {
      mobile: '1rem',
      tablet: '1.5rem',
      desktop: '2rem'
    }
  }
}; 