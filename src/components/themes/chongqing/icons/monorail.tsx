const MonoRail: React.FC<React.SVGProps<SVGSVGElement> & { rotation?: number; background?: string; foreground?: string }> = ({ rotation = 0, background = '#fff', foreground = 'currentColor', style, ...props }) => {
  const mergedStyle = { transform: `rotate(${rotation}deg)`, transformOrigin: 'center', ...(style as any) }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" style={mergedStyle} {...props}>
      <rect y="0" width="256" height="256" rx="40" ry="40" fill={foreground} />
      <path d="M196.46,137.5l-.45-95.81c0-.36-.19-.68-.5-.86-10.55-6.06-29.84-17.6-67.51-17.6s-56.96,11.54-67.51,17.6c-.31.18-.49.5-.5.86l-.45,95.81s-.55,20,5.71,36.22c5.74,14.87,15.05,26.28,16.65,28.81.19.29.51.47.86.47h90.46c.35,0,.68-.17.86-.47,1.6-2.53,10.91-13.94,16.65-28.81,6.26-16.22,5.71-36.22,5.71-36.22Z" fill={background} />
      <rect x="73" y="51" width="110" height="48" rx="1" ry="1" fill={foreground} />
      <rect x="73" y="119" width="32" height="8" rx=".5" ry=".5" fill={foreground} />
      <rect x="151" y="119" width="32" height="8" rx=".5" ry=".5" fill={foreground} />
      <rect x="109" y="175" width="38" height="62" fill={background} stroke={foreground} strokeWidth={6} />
    </svg>
  )
}

export default MonoRail
