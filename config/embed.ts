import { EmbedProviderConfig } from '@/types/embed';

export const EMBED_CONFIGS: EmbedProviderConfig = {
  Instagram: {
    aspectRatio: {
      mobile: 'aspect-auto',
      tablet: 'aspect-auto',
      desktop: 'aspect-auto'
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
      tablet: 'aspect-auto',
      desktop: 'aspect-auto'
    },
    containerClass: 'twitter-embed-container w-full max-w-[550px] mx-auto overflow-hidden rounded-lg',
    script: {
      main: 'https://platform.twitter.com/widgets.js',
      global: 'twttr'
    }
  },
  TikTok: {
    aspectRatio: {
      mobile: 'aspect-auto',
      tablet: 'aspect-auto',
      desktop: 'aspect-auto'
    },
    
    script: {
      main: 'https://www.tiktok.com/embed.js'
    }
  },
  Spotify: {
    aspectRatio: {
      mobile: 'aspect-auto',
      tablet: 'aspect-auto',
      desktop: 'aspect-auto'
    },
    containerClass: 'spotify-embed-container relative w-full h-[352px]', // Set fixed height
    processHtml: (html: string) => {
      // Transform the embed HTML to match Iframely's structure
      return `<div style="left: 0; width: 100%; height: 352px; position: relative;">
        <iframe 
          src="${html.match(/src="([^"]+)"/)?.[1] || ''}"
          style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;"
          allowfullscreen 
          allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture;"
        ></iframe>
      </div>`;
    }
  },
  Generic: {
    aspectRatio: {
      mobile: 'aspect-auto',
      tablet: 'aspect-auto',
      desktop: 'aspect-auto'
    },
    containerClass: 'generic-embed-container w-full overflow-hidden rounded-lg',
    processHtml: (html: string) => {
      // Make generic embeds responsive
      return html.replace(/width="(\d+)"/, 'width="10%"')
                .replace(/height="(\d+)"/, 'height="100%"');
    }
  }
}; 