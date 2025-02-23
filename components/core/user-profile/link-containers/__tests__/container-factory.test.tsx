import React from 'react';
import { render, screen } from '@testing-library/react';
import ContainerFactory from '../container-factory';

describe('ContainerFactory', () => {
  const commonProps = {
    type: 'link',
    url: '',
    title: 'Test Link',
    maxWidth: 'auto',
    className: 'test-class'
  };

  it('renders Twitter container for Twitter URLs', () => {
    const props = {
      ...commonProps,
      url: 'https://twitter.com/user/status/123456789'
    };
    render(<ContainerFactory {...props} />);
    expect(screen.getByText('Loading Twitter content...')).toBeInTheDocument();
  });

  it('renders YouTube container for YouTube URLs', () => {
    const props = {
      ...commonProps,
      url: 'https://www.youtube.com/watch?v=abc123'
    };
    render(<ContainerFactory {...props} />);
    expect(screen.getByText('Loading YouTube video...')).toBeInTheDocument();
  });

  it('renders TikTok container for TikTok URLs', () => {
    const props = {
      ...commonProps,
      url: 'https://www.tiktok.com/@user/video/123456789'
    };
    render(<ContainerFactory {...props} />);
    expect(screen.getByText('Loading TikTok content...')).toBeInTheDocument();
  });

  it('renders Spotify container for Spotify URLs', () => {
    const props = {
      ...commonProps,
      url: 'https://open.spotify.com/track/123456789'
    };
    render(<ContainerFactory {...props} />);
    expect(screen.getByText('Loading Spotify content...')).toBeInTheDocument();
  });

  it('renders standard link container for unknown URLs', () => {
    const props = {
      ...commonProps,
      url: 'https://example.com'
    };
    render(<ContainerFactory {...props} />);
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('handles empty embedHtml gracefully', () => {
    const props = {
      ...commonProps,
      url: 'https://twitter.com/user/status/123456789',
      embedHtml: ''
    };
    render(<ContainerFactory {...props} />);
    expect(screen.getByText('Loading Twitter content...')).toBeInTheDocument();
  });

  it('handles missing maxWidth prop', () => {
    const props = {
      type: 'link',
      url: 'https://example.com',
      title: 'Test Link',
      className: 'test-class'
    };
    render(<ContainerFactory {...props} />);
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });

  it('handles missing className prop', () => {
    const props = {
      type: 'link',
      url: 'https://example.com',
      title: 'Test Link',
      maxWidth: '500px'
    };
    render(<ContainerFactory {...props} />);
    expect(screen.getByText('Test Link')).toBeInTheDocument();
  });
}); 