import { EmbedProviderConfig } from '@/types/embed';

export const EMBED_CONFIGS: EmbedProviderConfig = {
  Instagram: {
    aspectRatio: {
      default: 'aspect-square',
      mobile: 'aspect-[4/5]',
      tablet: 'aspect-square',
      desktop: 'aspect-square'
    },
    container: {
      className: 'instagram-embed-container w-full max-w-[540px] mx-auto overflow-hidden rounded-lg',
      style: {
        minHeight: '400px'
      }
    },
    script: {
      main: 'https://www.instagram.com/embed.js',
      fallback: 'https://cdn.iframe.ly/files/instagram_embed.js'
    },
    processHtml: (html: string) => {
      // Process Instagram embed HTML to be more responsive
      return html.replace(/width="(\d+)"/, 'width="100%"')
                .replace(/height="(\d+)"/, 'height="100%"');
    }
  },
  YouTube: {
    aspectRatio: {
      default: 'aspect-video',
    },
    container: {
      className: 'youtube-embed-container w-full overflow-hidden rounded-lg',
    },
    processHtml: (html: string) => {
      // Make YouTube embeds responsive
      return html.replace(/width="(\d+)"/, 'width="100%"')
                .replace(/height="(\d+)"/, 'height="100%"');
    }
  },
  Twitter: {
    aspectRatio: {
      default: 'aspect-[1.91/1]',
      mobile: 'aspect-auto'
    },
    container: {
      className: 'twitter-embed-container w-full max-w-[550px] mx-auto overflow-hidden rounded-lg',
    },
    script: {
      main: 'https://platform.twitter.com/widgets.js'
    }
  },
  TikTok: {
    aspectRatio: {
      default: 'aspect-[9/16]',
    },
    container: {
      className: 'tiktok-embed-container w-full max-w-[325px] mx-auto overflow-hidden rounded-lg',
    },
    script: {
      main: 'https://www.tiktok.com/embed.js'
    }
  },
  Spotify: {
    aspectRatio: {
      default: 'aspect-[1.91/1]',
    },
    container: {
      className: 'spotify-embed-container w-full overflow-hidden rounded-lg',
      style: {
        maxHeight: '352px'
      }
    }
  },
  Generic: {
    aspectRatio: {
      default: 'aspect-[4/3]',
    },
    container: {
      className: 'generic-embed-container w-full overflow-hidden rounded-lg'
    },
    processHtml: (html: string) => {
      // Make generic embeds responsive
      return html.replace(/width="(\d+)"/, 'width="100%"')
                .replace(/height="(\d+)"/, 'height="100%"');
    }
  }
}; 