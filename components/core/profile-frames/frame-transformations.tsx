import React from 'react';

export interface FrameTransformations {
  rotation: number;
  scale?: number;
  translateX?: number;
  translateY?: number;
}

interface TransformControlsProps {
  transformations: FrameTransformations;
  onChange: (transformations: FrameTransformations) => void;
  className?: string;
}

export const TransformControls: React.FC<TransformControlsProps> = ({
  transformations,
  onChange,
  className,
}) => {
  const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...transformations,
      rotation: parseInt(e.target.value, 10),
    });
  };

  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...transformations,
      scale: parseFloat(e.target.value),
    });
  };

  return (
    <div className={`flex flex-col gap-4 ${className || ''}`}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Rotation</label>
        <input
          type="range"
          min="0"
          max="360"
          value={transformations.rotation}
          onChange={handleRotationChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          title="Rotation angle"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>0°</span>
          <span>{transformations.rotation}°</span>
          <span>360°</span>
        </div>
      </div>

      {transformations.scale !== undefined && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Scale</label>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={transformations.scale}
            onChange={handleScaleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            title="Scale factor"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0.5x</span>
            <span>{transformations.scale}x</span>
            <span>1.5x</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const getTransformStyle = (
  transformations: FrameTransformations
): React.CSSProperties => {
  const {
    rotation,
    scale = 1,
    translateX = 0,
    translateY = 0,
  } = transformations;

  return {
    transform: [
      `rotate(${rotation}deg)`,
      `scale(${scale})`,
      `translate(${translateX}px, ${translateY}px)`,
    ].join(' '),
    transformOrigin: 'center',
    transition: 'transform 0.1s ease',
  };
};
