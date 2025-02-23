import { CldImage } from 'next-cloudinary';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

export const CloudinaryImage = ({
  src,
  alt,
  width,
  height,
  className,
  sizes = '100vw',
  priority = false,
  onError,
}) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(!priority);

  if (!src) {
    return (
      <div 
        className={cn(
          "bg-gray-200 flex items-center justify-center",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">@</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={cn(
          "bg-gray-200 flex items-center justify-center",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    );
  }

  // Extract public ID from Cloudinary URL or use as is
  let publicId = src;
  if (src.includes('cloudinary.com')) {
    // Find the position after /upload/ and v1/
    const uploadIndex = src.indexOf('/upload/');
    const versionIndex = src.indexOf('/v1/');
    if (uploadIndex !== -1 && versionIndex !== -1) {
      publicId = src.slice(versionIndex + 4); // +4 to skip '/v1/'
    }
  }

  console.log('Original src:', src);
  console.log('Using publicId:', publicId);

  return (
    <div className="relative">
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 bg-gray-200 animate-pulse",
            className
          )}
          style={{ width, height }}
        />
      )}
      <CldImage
        src={publicId}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          isLoading ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-200',
          className
        )}
        sizes={sizes}
        priority={priority}
        onError={(e) => {
          console.error('CldImage error:', e);
          setError(true);
          onError?.();
        }}
        onLoad={() => setIsLoading(false)}
        loading={priority ? 'eager' : 'lazy'}
        crop="fill"
        quality="auto"
        format="auto"
      />
    </div>
  );
};

CloudinaryImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  className: PropTypes.string,
  sizes: PropTypes.string,
  priority: PropTypes.bool,
  onError: PropTypes.func,
};

export default CloudinaryImage; 