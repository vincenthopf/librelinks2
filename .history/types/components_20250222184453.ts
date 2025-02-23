import { FrameType } from '@/utils/frame-helpers';

export interface ProfileFrameSelectorProps {
  defaultType?: FrameType;
  onTypeChange?: (type: FrameType) => void;
}

export interface ProfileFrameColorPickerProps {
  defaultColor?: string;
  onColorChange?: (color: string) => void;
}

export interface UserAvatarProps {
  size?: number;
  frameType?: FrameType;
  frameColor?: string;
  image?: string;
}

export interface CustomizationError {
  code: string;
  message: string;
  field?: string;
}

export interface CustomizationResponse {
  success: boolean;
  data?: {
    profileFrameType?: FrameType;
    profileFrameColor?: string;
  };
  error?: CustomizationError;
} 