'use client';

export const SVGFilters = () => {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} aria-hidden="true">
      <defs>
        {/* Bitmap Filter with Pixelation */}
        <filter id="bitmap" x="-10%" y="-10%" width="120%" height="120%">
          {/* Create blocky pixels */}
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
          
          {/* Reduce colors */}
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues="0 .25 .5 .75 1"/>
            <feFuncG type="discrete" tableValues="0 .25 .5 .75 1"/>
            <feFuncB type="discrete" tableValues="0 .25 .5 .75 1"/>
          </feComponentTransfer>
        </filter>

        {/* Game Boy Filter - Clean monochrome with subtle dithering */}
        <filter id="gameboy" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* Store the alpha channel */}
          <feColorMatrix type="matrix" values="0 0 0 0 0
                                                0 0 0 0 0
                                                0 0 0 0 0
                                                0 0 0 1 0" result="alpha"/>
          
          {/* Convert to grayscale */}
          <feColorMatrix in="SourceGraphic" type="saturate" values="0" result="gray"/>
          
          {/* Add subtle texture for dithering - only on the image */}
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise"/>
          <feComposite in="noise" in2="alpha" operator="in" result="maskedNoise"/>
          <feBlend in="gray" in2="maskedNoise" mode="multiply" result="textured"/>
          
          {/* Posterize to 4 shades (classic Game Boy look) */}
          <feComponentTransfer in="textured">
            <feFuncR type="discrete" tableValues="0.06 0.4 0.75 0.95"/>
            <feFuncG type="discrete" tableValues="0.22 0.55 0.85 0.98"/>
            <feFuncB type="discrete" tableValues="0.06 0.3 0.55 0.8"/>
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
};

