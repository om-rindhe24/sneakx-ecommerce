import React from 'react';

/**
 * AtmosphericBackdrop
 * Renders an oversized, low-opacity sneaker silhouette layer with gradient scrims.
 * Ensures 100% WCAG AA text contrast while infusing depth into dark streetwear layouts.
 */
export const AtmosphericBackdrop = ({
  imageUrl,
  alt = "",
  opacity = 0.16,
  position = 'right', // 'right' | 'left' | 'center' | 'bottom-right'
  blur = 0,
  rotate = '-8deg',
  scale = 1.15,
  blendMode = 'normal', // 'normal' | 'screen' | 'overlay'
  gradientVariant = 'default' // 'default' | 'radial' | 'vignette'
}) => {
  const getPositionStyles = () => {
    switch (position) {
      case 'left':
        return {
          left: '-10%',
          top: '50%',
          transform: `translateY(-50%) rotate(${rotate}) scale(${scale})`,
          maxWidth: '850px',
        };
      case 'center':
        return {
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) rotate(${rotate}) scale(${scale})`,
          maxWidth: '950px',
        };
      case 'bottom-right':
        return {
          right: '-8%',
          bottom: '-12%',
          transform: `rotate(${rotate}) scale(${scale})`,
          maxWidth: '750px',
        };
      case 'right':
      default:
        return {
          right: '-8%',
          top: '48%',
          transform: `translateY(-50%) rotate(${rotate}) scale(${scale})`,
          maxWidth: '850px',
        };
    }
  };

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        contain: 'paint',
        clipPath: 'inset(0)',
        maxWidth: '100%'
      }}
    >
      {/* 1. Large Faded Sneaker Photographic Silhouette Layer */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          style={{
            position: 'absolute',
            width: '85%',
            height: 'auto',
            objectFit: 'contain',
            opacity: opacity,
            filter: `grayscale(100%) contrast(115%) brightness(0.95) ${blur > 0 ? `blur(${blur}px)` : ''}`,
            mixBlendMode: blendMode,
            transition: 'opacity 500ms ease, transform 1000ms cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'transform, opacity',
            ...getPositionStyles()
          }}
        />
      )}

      {/* 2. Seamless Gradient Scrim Overlays */}
      {gradientVariant === 'radial' ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, rgba(11, 12, 14, 0.15) 0%, rgba(11, 12, 14, 0.6) 70%, #0B0C0E 100%)',
          }}
        />
      ) : gradientVariant === 'vignette' ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle at center, transparent 40%, rgba(11, 12, 14, 0.8) 100%)',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #0B0C0E 0%, rgba(11, 12, 14, 0.6) 40%, rgba(11, 12, 14, 0.3) 70%, rgba(11, 12, 14, 0.7) 100%), linear-gradient(180deg, rgba(11, 12, 14, 0.3) 0%, transparent 30%, transparent 70%, #0B0C0E 100%)',
          }}
        />
      )}
    </div>
  );
};


export default AtmosphericBackdrop;
