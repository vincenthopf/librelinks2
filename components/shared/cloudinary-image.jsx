import { CldImage } from 'next-cloudinary';
import { useState, useEffect } from 'react';
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
  preserveAspectRatio = false,
}) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(!priority);
  const [naturalAspectRatio, setNaturalAspectRatio] = useState(null);
  const [imgDimensions, setImgDimensions] = useState({ width, height });

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(!priority);
    setError(false);
  }, [src, priority]);

  if (!src) {
    return (
      <div
        className={cn('bg-gray-200 flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">@</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn('bg-gray-200 flex items-center justify-center', className)}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  // Extract public ID from Cloudinary URL or use as is
  let publicId = src;
  if (src && src.includes('cloudinary.com')) {
    try {
      // More robust parsing of Cloudinary URLs
      const url = new URL(src);
      const pathSegments = url.pathname.split('/');

      // Look for upload in the path
      const uploadIndex = pathSegments.findIndex(segment => segment === 'upload');

      if (uploadIndex !== -1 && uploadIndex < pathSegments.length - 1) {
        // Everything after /upload/ except the first segment (which is usually v1)
        // and ignoring any transformation segments
        let startIndex = uploadIndex + 1;

        // Skip version segment if present (v1, v2, etc.)
        if (pathSegments[startIndex].match(/^v\d+$/)) {
          startIndex++;
        }

        // Join the remaining segments to form the public ID
        publicId = pathSegments.slice(startIndex).join('/');

        // Remove file extension if present
        publicId = publicId.replace(/\.(jpg|jpeg|png|gif|webp)$/, '');
      }
    } catch (error) {
      console.error('Error parsing Cloudinary URL:', error, src);
      // Fall back to the original URL if parsing fails
    }
  }

  console.log('Original src:', src);
  console.log('Extracted publicId:', publicId);

  // Calculate container dimensions based on natural aspect ratio if available
  const containerStyle =
    preserveAspectRatio && naturalAspectRatio
      ? {
          paddingTop: `${(1 / naturalAspectRatio) * 100}%`,
          width: '100%',
          height: 0,
          position: 'relative',
        }
      : { width: imgDimensions.width, height: imgDimensions.height };

  const imageStyle =
    preserveAspectRatio && naturalAspectRatio
      ? {
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }
      : {};

  return (
    <div className={cn('relative', preserveAspectRatio ? 'w-full' : '')}>
      {isLoading && (
        <div
          className={cn('bg-gray-200 animate-pulse', preserveAspectRatio ? 'w-full' : '')}
          style={
            preserveAspectRatio && naturalAspectRatio
              ? containerStyle
              : { width, height, minHeight: '100px' }
          }
        />
      )}

      <div style={preserveAspectRatio ? containerStyle : {}}>
        <CldImage
          src={publicId}
          alt={alt}
          width={width}
          height={height}
          className={cn(
            isLoading ? 'opacity-0' : 'opacity-100',
            'transition-opacity duration-200',
            className,
            preserveAspectRatio ? 'w-full h-auto' : ''
          )}
          style={imageStyle}
          sizes={sizes}
          priority={priority}
          onError={e => {
            console.error('CldImage error:', e);
            setError(true);
            onError?.();
          }}
          onLoad={e => {
            setIsLoading(false);
            // If we care about preserving aspect ratio, capture the natural dimensions
            if (preserveAspectRatio && e.target) {
              const { naturalWidth, naturalHeight } = e.target;
              if (naturalWidth && naturalHeight) {
                setNaturalAspectRatio(naturalWidth / naturalHeight);
                setImgDimensions({
                  width: naturalWidth,
                  height: naturalHeight,
                });
              }
            }
          }}
          loading={priority ? 'eager' : 'lazy'}
          quality="auto"
          format="auto"
          // Only apply crop="fill" when not preserving aspect ratio
          {...(!preserveAspectRatio && { crop: 'fill' })}
        />
      </div>
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
  preserveAspectRatio: PropTypes.bool,
};

export default CloudinaryImage;
