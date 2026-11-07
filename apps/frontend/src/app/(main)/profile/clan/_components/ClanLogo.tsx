import { type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const SOFT = { mixBlendMode: "soft-light" } as CSSProperties
const PLUS = { mixBlendMode: "plus-lighter" } as CSSProperties

interface ClanLogoProps {
  className?: string
  color?: string
  logoSrc?: string
  size?: string
  glow?: boolean
}

export function ClanLogo({
  className,
  color = "#9957FF",
  logoSrc = "/clan-logo.svg",
  size,
  glow = true,
}: ClanLogoProps) {
  // Палитра кристалла: одна «ручка» --clan, остальные оттенки считаются от неё.
  // Чтобы перекрасить клан — достаточно передать другой `color`.
  const palette = {
    "--clan": color,
    "--clan-l1": `color-mix(in srgb, ${color}, #fff 10%)`,
    "--clan-l2": `color-mix(in srgb, ${color}, #fff 22%)`,
    "--clan-l3": `color-mix(in srgb, ${color}, #fff 34%)`,
    "--clan-d1": `color-mix(in srgb, ${color}, #000 12%)`,
    "--clan-d2": `color-mix(in srgb, ${color}, #000 22%)`,
    // Цвет ореола-свечения вокруг камня (полупрозрачный базовый цвет).
    "--clan-glow": `color-mix(in srgb, ${color}, transparent 45%)`,
  } as CSSProperties

  return (
    <div className={cn("relative w-full max-w-[222.555px] aspect-[222.555/240.447]", className)} style={palette}>
      {/* Ореол-свечение по форме кристалла: ближний + дальний рассеянный слой (filter ниже). */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 223 241"
        fill="none"
        style={{
          filter: glow ? "drop-shadow(0 0 8px var(--clan-glow)) drop-shadow(0 4px 10px var(--clan-glow))" : undefined,
        }}
      >
        {/* Кристалл и блики — в ОДНОЙ маск-группе. Иначе блики (plus-lighter/soft-light)
            смешиваются с прозрачностью и выходят чисто-белыми вместо розоватого оттенка. */}
        <g mask="url(#clan_shine_mask)">
          <path
            d="M188.588 209.932C169.121 217.504 139.404 229.067 122.699 235.593C114.686 238.724 105.75 238.75 97.7304 235.637L31.8355 210.06C20.0045 205.468 11.8566 194.536 10.8724 181.883L1.00982 55.094C0.359591 46.7349 2.91034 38.4791 8.1519 31.9352L23.7852 12.4175C30.0498 4.59622 39.4936 0.0449219 49.5145 0.0449219H171.226C180.841 0.0449219 189.966 4.23135 196.237 11.5204L213.41 31.4819C219.255 38.2759 222.086 47.1391 221.253 56.0625L209.473 182.261C208.312 194.708 200.239 205.401 188.588 209.932Z"
            fill="var(--clan)"
          />
          <path
            d="M40.268 1.31448C33.7932 3.18366 28.0569 7.01391 23.849 12.2779L7.38497 32.874C2.63986 38.81 0.327907 46.3274 0.917266 53.904L82.3852 73.5085L40.268 1.31448Z"
            fill="var(--clan-l1)"
          />
          <path
            d="M181.803 1.7666L184.364 2.85241C189.113 4.86583 193.324 7.96407 196.659 11.8987L214.646 33.1176C219.545 38.8972 221.964 46.3775 221.376 53.9313L215.847 55.2618L139.908 73.5358L179.03 6.51629L181.803 1.7666Z"
            fill="var(--clan-l2)"
          />
          <path
            d="M214.646 33.1176L196.659 11.8987C193.324 7.96407 189.113 4.86583 184.364 2.85241L181.803 1.7666L179.03 6.51629L180.398 7.16017C184.684 9.1783 188.485 12.0953 191.544 15.7131L208.873 36.2108C213.376 41.5373 215.847 48.2868 215.847 55.2618L221.376 53.9313C221.964 46.3775 219.545 38.8972 214.646 33.1176Z"
            fill="var(--clan-l1)"
          />
          <path
            d="M40.2627 1.27348L44.1887 8.00194L82.3854 73.4638L110.267 80.1734L139.646 73.8419L178.217 8.00194L181.858 1.78746L180.029 1.26597C177.085 0.426076 174.038 0 170.975 0H49.6129C47.2002 0 44.7947 0.264522 42.4397 0.788824L40.2627 1.27348Z"
            fill="var(--clan)"
          />
          <path
            d="M40.2627 1.27348L42.4397 0.788825C44.7947 0.264522 47.2002 0 49.6129 0H170.975C174.038 0 177.085 0.426076 180.029 1.26597L181.858 1.78746L179.051 6.51883H43.3L40.2627 1.27348Z"
            fill="var(--clan-d2)"
          />
          <path
            d="M214.965 123.417L221.406 53.9248L110.237 80.5295L126.16 124.066L205.355 195.596L206.687 192.669C208.214 189.313 209.169 185.724 209.51 182.053L214.965 123.417Z"
            fill="url(#clan_g0)"
          />
          <path
            d="M221.406 53.9258L214.965 123.418L209.51 182.054C209.169 185.725 208.214 189.314 206.687 192.67L205.355 195.597L201.66 191.768L215.848 55.2578L221.406 53.9258Z"
            fill="url(#clan_g1)"
          />
          <path
            d="M108.152 123.888C100.2 123.946 92.5358 126.873 86.5694 132.131L14.8375 195.342L17.3115 198.755C21.039 203.898 26.1711 207.856 32.0921 210.154L97.7289 235.636C105.749 238.75 114.697 238.723 122.713 235.6C140.285 228.755 171.908 216.491 188.399 210.098C195.307 207.42 201.109 202.5 204.88 196.123L205.387 195.266L135.717 132.358C129.589 126.825 121.61 123.789 113.354 123.85L108.152 123.888Z"
            fill="url(#clan_g2)"
          />
          <path
            d="M0.917351 53.9023L110.267 80.2164L95.8217 123.976L14.8854 195.388L12.9023 190.322C11.7122 187.282 10.9797 184.082 10.7288 180.827L3.88885 92.1029L0.917351 53.9023Z"
            fill="url(#clan_g3)"
          />
          <path
            d="M30.8051 58.8937C30.457 54.7879 31.4629 50.6811 33.6691 47.2009L43.4531 31.767C45.5279 28.4941 49.1335 26.5107 53.0087 26.5107L183.725 177.088C183.566 180.001 181.638 182.52 178.868 183.435L115.914 204.224C111.937 205.538 107.635 205.49 103.688 204.089L52.693 185.985C45.7164 183.509 40.8336 177.18 40.2082 169.803L30.8051 58.8937Z"
            fill="url(#clan_g4)"
          />
          <path
            d="M183.724 177.088L53.0082 26.5107H163.055C169.362 26.5107 175.251 29.6627 178.75 34.9102L187.038 47.3421C189.298 50.7327 190.4 54.7642 190.178 58.8331L183.724 177.088Z"
            fill="var(--clan-l1)"
          />

          {/* ── Блики (поверх кристалла, белые, blend-mode) ── */}
          <g filter="url(#clan_f0)" style={SOFT}>
            <rect
              x="77.1552"
              y="53.2119"
              width="71.9468"
              height="111.931"
              transform="rotate(0.513385 77.1552 53.2119)"
              fill="white"
            />
          </g>
          <g filter="url(#clan_f1)" style={PLUS}>
            <rect
              x="98.1871"
              y="53.4004"
              width="29.88"
              height="111.931"
              transform="rotate(0.513385 98.1871 53.4004)"
              fill="white"
            />
          </g>
          <g filter="url(#clan_f2)" style={SOFT}>
            <rect
              x="-2.55888"
              y="167.981"
              width="55.222"
              height="67.925"
              transform="rotate(-38.9426 -2.55888 167.981)"
              fill="white"
            />
          </g>
          <g filter="url(#clan_f3)" style={PLUS}>
            <rect
              x="9.9969"
              y="157.835"
              width="22.9341"
              height="67.925"
              transform="rotate(-38.9426 9.9969 157.835)"
              fill="white"
            />
          </g>
          <g filter="url(#clan_f4)" style={SOFT}>
            <path
              d="M183.552 -3.48305L185.674 40.0517L225.309 58.1871L181.774 60.3099L163.639 99.9444L161.516 56.4096L121.881 38.2743L165.416 36.1514L183.552 -3.48305Z"
              fill="white"
            />
          </g>
          <g filter="url(#clan_f5)" style={PLUS}>
            <path
              d="M183.552 -3.48305L181.096 43.152L225.309 58.1871L178.674 55.7311L163.639 99.9444L166.095 53.3093L121.881 38.2743L168.517 40.7302L183.552 -3.48305Z"
              fill="white"
            />
          </g>
          <g opacity="0.34">
            <g filter="url(#clan_f6)" style={SOFT}>
              <path
                d="M183.552 -3.48305L185.674 40.0517L225.309 58.1871L181.774 60.3099L163.639 99.9444L161.516 56.4096L121.881 38.2743L165.416 36.1514L183.552 -3.48305Z"
                fill="white"
              />
            </g>
            <g filter="url(#clan_f7)" style={PLUS}>
              <path
                d="M183.552 -3.48305L181.096 43.152L225.309 58.1871L178.674 55.7311L163.639 99.9444L166.095 53.3093L121.881 38.2743L168.517 40.7302L183.552 -3.48305Z"
                fill="white"
              />
            </g>
          </g>
          <g filter="url(#clan_f8)" style={SOFT}>
            <rect
              x="185.401"
              y="60.9111"
              width="8.92449"
              height="112.149"
              transform="rotate(4.90378 185.401 60.9111)"
              fill="white"
            />
          </g>
          <g filter="url(#clan_f9)" style={PLUS}>
            <rect
              x="188"
              y="61.1328"
              width="3.7064"
              height="112.149"
              transform="rotate(4.90378 188 61.1328)"
              fill="white"
            />
          </g>
          <g filter="url(#clan_f10)" style={SOFT}>
            <rect
              x="181.1"
              y="176.59"
              width="8.92449"
              height="74.4578"
              transform="rotate(67.7024 181.1 176.59)"
              fill="url(#clan_shine_g0)"
            />
          </g>
          <g filter="url(#clan_f11)" style={PLUS}>
            <rect
              x="182.09"
              y="179.004"
              width="3.7064"
              height="74.4578"
              transform="rotate(67.7024 182.09 179.004)"
              fill="url(#clan_shine_g1)"
            />
          </g>
        </g>

        <defs>
          {/* Градиенты кристалла */}
          <linearGradient
            id="clan_g0"
            x1="165.861"
            y1="53.9033"
            x2="165.861"
            y2="197.781"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--clan-d1)" />
            <stop offset="1" stopColor="var(--clan)" />
          </linearGradient>
          <linearGradient
            id="clan_g1"
            x1="211.533"
            y1="53.9258"
            x2="211.533"
            y2="195.597"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--clan-d2)" />
            <stop offset="1" stopColor="var(--clan-d1)" />
          </linearGradient>
          <linearGradient
            id="clan_g2"
            x1="12.1085"
            y1="197.307"
            x2="208.024"
            y2="197.307"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--clan-l3)" />
            <stop offset="1" stopColor="var(--clan-l1)" />
          </linearGradient>
          <linearGradient
            id="clan_g3"
            x1="55.5923"
            y1="53.9023"
            x2="55.5923"
            y2="197.78"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--clan)" />
            <stop offset="1" stopColor="var(--clan-l3)" />
          </linearGradient>
          <linearGradient
            id="clan_g4"
            x1="106.997"
            y1="26.5107"
            x2="106.997"
            y2="206.25"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--clan-d1)" />
            <stop offset="1" stopColor="var(--clan-l2)" />
          </linearGradient>

          {/* Маска бликов (силуэт кристалла) */}
          <mask
            id="clan_shine_mask"
            style={{ maskType: "alpha" }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="222"
            height="238"
          >
            <path
              d="M188.588 209.888C169.121 217.459 139.404 229.022 122.699 235.549C114.686 238.679 105.75 238.705 97.7304 235.592L31.8355 210.015C20.0045 205.423 11.8566 194.491 10.8723 181.839L1.00979 55.0491C0.35956 46.69 2.91031 38.4342 8.15187 31.8902L23.7851 12.3725C30.0498 4.5513 39.4936 0 49.5145 0H171.226C180.841 0 189.966 4.18643 196.237 11.4755L213.41 31.437C219.255 38.231 222.086 47.0941 221.253 56.0176L209.473 182.217C208.311 194.664 200.239 205.356 188.588 209.888Z"
              fill="#fff"
            />
          </mask>

          {/* Блюр-фильтры бликов */}
          <filter
            id="clan_f0"
            x="14.8158"
            y="-8.12465"
            width="195.62"
            height="235.244"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="30.6683" />
          </filter>
          <filter
            id="clan_f1"
            x="35.8476"
            y="-7.93617"
            width="153.555"
            height="234.867"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="30.6683" />
          </filter>
          <filter
            id="clan_f2"
            x="-63.8954"
            y="71.9359"
            width="208.317"
            height="210.212"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="30.6683" />
          </filter>
          <filter
            id="clan_f3"
            x="-51.3397"
            y="82.0834"
            width="183.204"
            height="189.918"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="30.6683" />
          </filter>
          <filter
            id="clan_f4"
            x="76.134"
            y="-49.2309"
            width="194.922"
            height="194.923"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="22.8737" />
          </filter>
          <filter
            id="clan_f5"
            x="76.134"
            y="-49.2309"
            width="194.922"
            height="194.923"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="22.8737" />
          </filter>
          <filter
            id="clan_f6"
            x="110.517"
            y="-14.8474"
            width="126.155"
            height="126.156"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="5.68201" />
          </filter>
          <filter
            id="clan_f7"
            x="53.9888"
            y="-71.3761"
            width="239.213"
            height="239.213"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="33.9464" />
          </filter>
          <filter
            id="clan_f8"
            x="164.45"
            y="49.5471"
            width="41.2066"
            height="135.229"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="5.68201" />
          </filter>
          <filter
            id="clan_f9"
            x="110.521"
            y="-6.75991"
            width="149.065"
            height="247.84"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="33.9464" />
          </filter>
          <filter
            id="clan_f10"
            x="100.846"
            y="165.226"
            width="95.0044"
            height="59.2359"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="5.68201" />
          </filter>
          <filter
            id="clan_f11"
            x="45.3072"
            y="111.111"
            width="206.082"
            height="167.465"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="33.9464" />
          </filter>

          {/* Градиенты бликов */}
          <linearGradient
            id="clan_shine_g0"
            x1="184.335"
            y1="182.588"
            x2="184.547"
            y2="255.779"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id="clan_shine_g1"
            x1="183.434"
            y1="185.002"
            x2="183.944"
            y2="258.19"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <Image
        src={logoSrc}
        alt="clan"
        width={124}
        height={129}
        className={cn("absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55.6%] h-auto", size)}
      />
    </div>
  )
}
