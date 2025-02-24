import * as Avatar from '@radix-ui/react-avatar';
import useCurrentUser from '@/hooks/useCurrentUser';
import useUser from '@/hooks/useUser';
import { CloudinaryImage } from '@/components/shared/cloudinary-image';
import { CircleFrame } from '@/components/core/profile-frames/frame-templates/circle-frame';
import { PolaroidClassicFrame } from '@/components/core/profile-frames/frame-templates/polaroid-classic-frame';
import { PolaroidPatternFrame } from '@/components/core/profile-frames/frame-templates/polaroid-pattern-frame';
import { getFrameAnimationProps } from '@/components/core/profile-frames/frame-animations';

const renderFrame = (template, props) => {
  switch (template) {
    case 'circle':
      return <CircleFrame {...props} />;
    case 'polaroid-classic':
      return <PolaroidClassicFrame {...props} />;
    case 'polaroid-pattern':
      return <PolaroidPatternFrame {...props} />;
    default:
      return null;
  }
};

const getFrameSpecificStyles = (template, thickness, pictureRotation) => {
  const baseStyles = {
    transform: pictureRotation ? `rotate(${pictureRotation}deg)` : undefined,
    transition: 'transform 0.3s ease',
  };

  switch (template) {
    case 'circle':
      return {
        ...baseStyles,
        borderRadius: '50%',
        overflow: 'hidden',
      };
    case 'polaroid-classic':
      return {
        ...baseStyles,
        borderRadius: '20px',
        overflow: 'hidden',
        // Adjust container to account for frame thickness
        transform:
          `${baseStyles.transform || ''} scale(${(100 - thickness) / 100})`.trim(),
      };
    case 'polaroid-pattern':
      return {
        ...baseStyles,
        borderRadius: '1px',
        overflow: 'hidden',
        transform:
          `${baseStyles.transform || ''} scale(${(100 - thickness) / 100})`.trim(),
      };
    default:
      return baseStyles;
  }
};

/**
 * HeaderAvatar component specifically for the navigation header
 * Uses fixed sizing and maintains existing styling
 */
export const HeaderAvatar = ({ onClick }) => {
  const { data: currentUser } = useCurrentUser();
  const { data: fetchedUser } = useUser(currentUser?.handle);
  const size = 45;

  // For no frame, just show the raw image
  if (!fetchedUser?.frameTemplate || fetchedUser.frameTemplate === 'none') {
    return (
      <div onClick={onClick} className="transition-transform hover:scale-110">
        <CloudinaryImage
          src={fetchedUser?.image}
          alt="avatar"
          width={size}
          height={size}
          className="object-cover"
          priority={true}
        />
      </div>
    );
  }

  // Calculate image size based on frame type and thickness
  const thickness = fetchedUser.frameThickness || 2;
  const imageScale = 1; // Fill entire container
  const imageSize = size;
  const frameRotation = fetchedUser.frameRotation || 0;
  const pictureRotation = fetchedUser.syncRotation
    ? frameRotation
    : fetchedUser.pictureRotation || 0;
  const frameStyles = getFrameSpecificStyles(
    fetchedUser.frameTemplate,
    thickness,
    pictureRotation
  );

  // Show framed image for other frame types
  return (
    <div
      onClick={onClick}
      className="frame-container relative transition-transform hover:scale-110"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transform: `rotate(${frameRotation}deg)`,
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Frame layer */}
      <div className="absolute inset-0 z-10">
        {renderFrame(fetchedUser.frameTemplate, {
          size,
          color: fetchedUser.frameColor || '#000000',
          thickness,
          rotation: 0, // Remove rotation from frame since container handles it
          name: fetchedUser.name || '',
          animation: fetchedUser.frameAnimation || {
            type: null,
            enabled: false,
            config: {},
          },
        })}
      </div>

      {/* Image layer */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          className="image-container relative"
          style={{
            width: `${imageSize}px`,
            height: `${imageSize}px`,
            ...frameStyles,
          }}
        >
          <CloudinaryImage
            src={fetchedUser?.image}
            alt="avatar"
            width={imageSize}
            height={imageSize}
            className="h-full w-full object-cover"
            priority={true}
          />
        </div>
      </div>
    </div>
  );
};
