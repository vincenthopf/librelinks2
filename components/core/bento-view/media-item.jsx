'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// MediaItemType is now adapted for our application content types
// It will handle links, texts, photos, and embedded videos
const MediaItem = ({ item, className, onClick }) => {
  const videoRef = useRef(null);
  const [isInView, setIsInView] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  // Determine content type
  const isVideo =
    item.type === 'video' ||
    (item.url &&
      (item.url.endsWith('.mp4') ||
        item.url.endsWith('.webm') ||
        item.url.includes('youtube.com') ||
        item.url.includes('vimeo.com')));

  const isPhoto =
    item.type === 'image' ||
    item.type === 'photo' ||
    (item.url &&
      (item.url.endsWith('.jpg') ||
        item.url.endsWith('.jpeg') ||
        item.url.endsWith('.png') ||
        item.url.endsWith('.webp')));

  // Set up IntersectionObserver for video playback
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        setIsInView(entry.isIntersecting);
      });
    }, options);

    observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, [isVideo]);

  // Handle video playback
  useEffect(() => {
    if (!isVideo) return;

    let mounted = true;

    const handleVideoPlay = async () => {
      if (!videoRef.current || !isInView || !mounted) return;

      try {
        if (videoRef.current.readyState >= 3) {
          setIsBuffering(false);
          await videoRef.current.play();
        } else {
          setIsBuffering(true);
          await new Promise(resolve => {
            if (videoRef.current) {
              videoRef.current.oncanplay = resolve;
            }
          });
          if (mounted) {
            setIsBuffering(false);
            await videoRef.current.play();
          }
        }
      } catch (error) {
        console.warn('Video playback failed:', error);
      }
    };

    if (isInView) {
      handleVideoPlay();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }

    return () => {
      mounted = false;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [isInView, isVideo]);

  // Render content based on type
  if (isVideo) {
    return (
      <div className={`${className} relative overflow-hidden`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          onClick={onClick}
          playsInline
          muted
          loop
          preload="auto"
          style={{
            opacity: isBuffering ? 0.8 : 1,
            transition: 'opacity 0.2s',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        >
          <source src={item.url} type="video/mp4" />
        </video>
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  if (isPhoto) {
    return (
      <img
        src={item.url}
        alt={item.title || 'Image'}
        className={`${className} object-cover cursor-pointer`}
        onClick={onClick}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // For text items or link items without images
  return (
    <div
      className={`${className} flex flex-col justify-center items-center p-4 cursor-pointer`}
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg, ${item.gradient?.[0] || '#4776E6'}, ${item.gradient?.[1] || '#8E54E9'})`,
      }}
    >
      <h3 className="text-white text-lg font-medium line-clamp-2 text-center">{item.title}</h3>
      {item.content && (
        <p className="text-white/80 text-sm mt-2 line-clamp-3 text-center">{item.content}</p>
      )}
    </div>
  );
};

export default MediaItem;
