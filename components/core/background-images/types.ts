export interface BackgroundImage {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface BackgroundImageGridProps {
  backgroundImages: BackgroundImage[];
  selectedImage: string | null;
  isUpdating: boolean;
  onImageSelect: (imageUrl: string) => Promise<void>;
  onRemoveBackground: () => Promise<void>;
}

export interface LoadingStateProps {
  message: string;
}

export interface ErrorBoundaryProps {
  fallbackTitle?: string;
  fallbackMessage?: string;
  showError?: boolean;
  children: React.ReactNode;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Validation functions
export const isValidImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isValidBackgroundImage = (
  image: unknown
): image is BackgroundImage => {
  if (!image || typeof image !== 'object') return false;

  const img = image as Partial<BackgroundImage>;

  return (
    typeof img.id === 'string' &&
    typeof img.name === 'string' &&
    typeof img.imageUrl === 'string' &&
    isValidImageUrl(img.imageUrl) &&
    typeof img.isPublic === 'boolean' &&
    typeof img.userId === 'string' &&
    typeof img.createdAt === 'string' &&
    typeof img.updatedAt === 'string' &&
    (img.description === undefined || typeof img.description === 'string')
  );
};
