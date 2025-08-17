const Checkin: React.FC<React.SVGProps<SVGSVGElement> & { rotation?: number; background?: string; foreground?: string }> = ({ rotation = 0, background = '#fff', foreground = 'currentColor', style, ...props }) => {
  const mergedStyle = { transform: `rotate(${rotation}deg)`, transformOrigin: 'center', ...(style as any) }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" style={mergedStyle} {...props}>
      <rect y="0" width="256" height="256" rx="40" ry="40" fill={foreground} />
      <path d="M177,132.22h59v87h-39c-11.04,0-20-8.96-20-20v-67h0Z" fill={background} />
      <path d="M220.11,121h15.89v11.22h-15.89c2.91-.23,5.19-2.69,5.19-5.61s-2.27-5.38-5.19-5.61Z" fill={background} />
      <path d="M145.67,134.33c-7.98-.24-13.78,11.33-17.67,13s-6.79,2.28-10,2.39v23.97c11.67-.52,14.9-2.41,20-6.08s19.86-20.61,20-24.94-1.22-8-12.33-8.33Z" fill={background} />
      <polygon points="195 137 118 137 146 105 223 105 195 137" fill={foreground} />
      <polygon points="195 137 118 137 146 105 223 105 195 137" stroke={foreground} strokeWidth={12} fill="none" strokeMiterlimit={10} />
      <polygon points="195 137 118 137 146 105 223 105 195 137" stroke={background} strokeWidth={6} fill="none" strokeMiterlimit={10} />
      <path d="M118,149.72s-3.19,0-4.17-.11c-6.92-.77-8.78-4.06-11.5-6.22s-6.26-8.59-5.04-12.87,4.29-6.52,8.78-6.78c7.48-.43,16.74-.14,25.44,2,13.93,3.43,27.32.93,28.04-5.96s-7.96-8.81-12.78-9.81-28.74-5.78-38.15-9.7-19.63-12.59-30.59-18.81c-10.96-6.22-19.81-4.89-31.81-12-12-7.11-17.67-15.85-17.67-15.85v63.96s31,25.44,42.11,37.44,24.11,18.69,47.33,18.69v-23.97Z" fill={background} />
      <path d="M197,34h39v87h-59V54c0-11.04,8.96-20,20-20Z" fill={background} />
    </svg>
  )
}

export default Checkin
