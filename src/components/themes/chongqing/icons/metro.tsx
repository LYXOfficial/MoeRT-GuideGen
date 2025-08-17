const Metro: React.FC<React.SVGProps<SVGSVGElement> & { rotation?: number; background?: string; foreground?: string }> = ({ rotation = 0, background = '#fff', foreground = 'currentColor', style, ...props }) => {
  const mergedStyle = { transform: `rotate(${rotation}deg)`, transformOrigin: 'center', ...(style as any) }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" style={mergedStyle} {...props}>
      <rect width="256" height="256" rx="40" ry="40" fill={foreground} />
      <path d="M193.95,34.04c-27.86-16.2-55.76-15.53-65.95-15.54s-38.08-.66-65.95,15.54c-28.95,16.83-39.05,42.34-39.05,42.34v162.5l23-28.75v-126.84c1.97-3.8,8.92-18.5,27.63-29.37,21.59-12.55,43.67-12.66,54.37-12.66s32.79.11,54.37,12.66c18.7,10.87,25.66,25.57,27.63,29.37v126.84l23,28.75V76.37s-10.11-25.51-39.05-42.34Z" fill={background} />
      <polygon points="81 233 112 185 100 177 64 233 81 233" fill={background} />
      <polygon points="175 233 144 185 156 177 192 233 175 233" fill={background} />
      <path d="M177.19,176.22c-2.81,3.05-20.46,21.56-49.19,21.56-28.73,0-46.38-18.51-49.19-21.56v-111.89h98.37v111.89Z" fill={background} />
      <rect x="92.37" y="89" width="71.26" height="36.67" rx="1" ry="1" fill={foreground} />
      <line x1="113" y1="76" x2="143" y2="76" stroke={foreground} strokeWidth={8} strokeLinecap="round" strokeMiterlimit={10} />
      <circle cx="100" cy="165" r="9" fill={foreground} />
      <circle cx="156" cy="165" r="9" fill={foreground} />
    </svg>
  )
}

export default Metro
