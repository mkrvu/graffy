interface GraffLogoProps {
  className?: string
}

export function GraffLogo({ className }: GraffLogoProps) {
  return (
    <svg className={className} viewBox="0 0 213 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#graff-clip)">
        <path d="M46.2513 13.1006C44.4105 -0.520433 13.1645 -3.70643 4.46267 26.6679C-4.18258 56.8445 24.703 67.4907 38.9155 44.9392C53.128 22.3876 30.333 18.8812 24.2502 30.592" stroke="#9957FF" strokeWidth="6.74005" />
        <circle cx="20.8911" cy="36.9229" r="3.32634" fill="#CCABFF" />
        <path d="M52.9666 59.7636C52.2088 35.8563 60.8561 21.7326 71.0811 22.2475C83.8623 22.8911 75.4614 40.3286 64.519 34.8574C67.4921 41.9377 75.079 54.2412 82.9501 57.4779" stroke="#CCABFF" strokeWidth="5" strokeLinejoin="round" />
        <path d="M110.828 59.4962C112.185 45.78 113.392 18.9619 107.374 21.4185C103.277 23.0905 98.2025 34.1162 94.429 43.8762C91.2719 52.0417 89.0258 59.3213 89.0258 59.4962M94.429 43.8762C95.1425 43.782 111.442 41.353 119.503 40.1502" stroke="#CCABFF" strokeWidth="5" />
        <path d="M156.694 20.8347C130.998 22.3523 127.582 28.7887 125.233 39.7213C123.216 49.1134 123.842 59.0502 123.915 59.9223M125.233 39.7213C126.343 38.9019 137.08 34.2112 144.064 34.7324" stroke="#CCABFF" strokeWidth="5" />
        <path d="M184.554 20.8347C158.857 22.3523 155.441 28.7887 153.093 39.7213C151.075 49.1134 151.702 59.0502 151.774 59.9223M153.093 39.7213C154.203 38.9019 164.939 34.2112 171.923 34.7324" stroke="#CCABFF" strokeWidth="5" />
        <path d="M190.735 17.4507C181.105 36.9621 184.534 62.0317 209.267 20.4503L191.888 60.2362" stroke="#CCABFF" strokeWidth="5" />
      </g>
      <defs>
        <clipPath id="graff-clip">
          <rect width="213" height="62" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}
