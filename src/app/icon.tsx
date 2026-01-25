import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background rounded square */}
          <rect width="48" height="48" rx="12" fill="#E07A5F" />

          {/* Top left bubble */}
          <path
            d="M12 14C12 12.8954 12.8954 12 14 12H22C23.1046 12 24 12.8954 24 14V20C24 21.1046 23.1046 22 22 22H16L14 24V22H14C12.8954 22 12 21.1046 12 20V14Z"
            fill="white"
            fillOpacity="0.9"
          />

          {/* Top right bubble */}
          <path
            d="M26 10C26 8.89543 26.8954 8 28 8H36C37.1046 8 38 8.89543 38 10V16C38 17.1046 37.1046 18 36 18H30L28 20V18H28C26.8954 18 26 17.1046 26 16V10Z"
            fill="white"
            fillOpacity="0.75"
          />

          {/* Bottom center bubble */}
          <path
            d="M16 28C16 26.8954 16.8954 26 18 26H32C33.1046 26 34 26.8954 34 28V36C34 37.1046 33.1046 38 32 38H22L20 40V38H18C16.8954 38 16 37.1046 16 36V28Z"
            fill="white"
            fillOpacity="0.9"
          />

          {/* Connection lines */}
          <path
            d="M22 22L24 26"
            stroke="white"
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M30 18L28 26"
            stroke="white"
            strokeOpacity="0.6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
