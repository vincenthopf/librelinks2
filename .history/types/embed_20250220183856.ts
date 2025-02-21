export type EmbedType = 'video' | 'photo' | 'rich' | 'link';
export type ProviderName = 'Instagram' | 'YouTube' | 'Twitter' | 'TikTok' | 'Spotify' | 'Generic';

export interface ScriptConfig {
  main: string;
  fallback?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export interface AspectRatioConfig {
  default: string;
  mobile?: string;
  tablet?: string;
  desktop?: string;
}

export interface ContainerConfig {
  className: string;
  style?: Record<string, string>;
}

export interface EmbedConfig {
  aspectRatio: AspectRatioConfig;
  container: ContainerConfig;
  script?: ScriptConfig;
  processHtml?: (html: string) => string;
  validateContent?: (content: any) => boolean;
}

export interface EmbedProviderConfig {
  [key in ProviderName]?: EmbedConfig;
}

export interface RichMediaContent {
  type: EmbedType;
  provider: ProviderName;
  html?: string;
  url?: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  author?: string;
  metadata?: Record<string, any>;
}

export interface RichMediaPreviewProps {
  content: RichMediaContent;
  appearance?: 'minimal' | 'full';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  style?: React.CSSProperties;
} 