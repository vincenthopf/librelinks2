import { EmbedProviderConfig } from '@/types/embed';

export const EMBED_CONFIGS: EmbedProviderConfig = {
  Instagram: {
    aspectRatio: {
      mobile: 'aspect-[4/5]',
      tablet: 'aspect-square',
      desktop: 'aspect-square'
    },
    containerClass: 'instagram-embed-container w-full max-w-[540px] mx-auto overflow-hidden rounded-lg',
    script: {
      main: 'https://www.instagram.com/embed.js',
      fallback: 'https://cdn.iframe.ly/files/instagram_embed.js',
      global: 'instgrm'
    },
    processHtml: (html: string) => {
      // Process Instagram embed HTML to be more responsive
      return html.replace(/width="(\d+)"/, 'width="100%"')
                .replace(/height="(\d+)"/, 'height="100%"');
    }
  },
  YouTube: {
    aspectRatio: {
      mobile: 'aspect-video',
      tablet: 'aspect-video',
      desktop: 'aspect-video'
    },
    containerClass: 'youtube-embed-container w-full overflow-hidden rounded-lg',
    processHtml: (html: string) => {
      // Make YouTube embeds responsive
      return html.replace(/width="(\d+)"/, 'width="100%"')
                .replace(/height="(\d+)"/, 'height="100%"');
    }
  },
  Twitter: {
    aspectRatio: {
      mobile: 'aspect-auto',
      tablet: 'aspect-[1.91/1]',
      desktop: 'aspect-[1.91/1]'
    },
    containerClass: 'twitter-embed-container w-full max-w-[550px] mx-auto overflow-hidden rounded-lg',
    script: {
      main: 'https://platform.twitter.com/widgets.js',
      global: 'twttr'
    }
  },
  TikTok: {
    aspectRatio: {
      mobile: 'aspect-[9/16]',
      tablet: 'aspect-[9/16]',
      desktop: 'aspect-[9/16]'
    },
    containerClass: 'tiktok-embed-container w-full max-w-[325px] mx-auto overflow-hidden rounded-lg',
    script: {
      main: 'https://www.tiktok.com/embed.js'
    }
  },
  Spotify: {
    aspectRatio: {
      mobile: 'aspect-[3/1]',
      tablet: 'aspect-[1.91/1]',
      desktop: 'aspect-[1.91/1]'
    },
    containerClass: 'spotify-embed-container w-full overflow-hidden rounded-lg',
    processHtml: (html: string) => {
      // Make Spotify embeds responsive
      return html.replace(/width="(\d+)"/, 'width="100%"')
                .replace(/height="(\d+)"/, 'height="400px"');
    }
  },
  Generic: {
    aspectRatio: {
      mobile: 'aspect-[4/3]',
      tablet: 'aspect-[4/3]',
      desktop: 'aspect-[16/9]'
    },
    containerClass: 'generic-embed-container w-full overflow-hidden rounded-lg',
    processHtml: (html: string) => {
      // Make generic embeds responsive
      return html.replace(/width="(\d+)"/, 'width="100%"')
                .replace(/height="(\d+)"/, 'height="100%"');
    }
  }
}; 