import React from "react";
import { Circle, Path, Svg, SvgProps } from "react-native-svg";

export interface IconProps extends SvgProps {
  size?: number;
  color?: string;
}

export const EyeIcon = ({
  size = 24,
  color = "#8897AE",
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 5C7.5 5 3.73 7.61 2 12c1.73 4.39 5.5 7 10 7s8.27-2.61 10-7c-1.73-4.39-5.5-7-10-7zm0 11.5c-2.48 0-4.5-2.02-4.5-4.5S9.52 7.5 12 7.5s4.5 2.02 4.5 4.5-2.02 4.5-4.5 4.5z"
      fill={color}
    />
    <Path
      d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      fill={color}
    />
  </Svg>
);

export const EyeOffIcon = ({
  size = 24,
  color = "#8897AE",
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Path
      d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
      fill={color}
    />
  </Svg>
);

export const UserIcon = ({
  size = 24,
  color = "#8897AE",
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 28 28" fill="none" {...props}>
    <Path
      d="M3.38943 23.624C4.4652 21.7619 6.01204 20.2158 7.87456 19.1408C9.73707 18.0659 11.8497 17.5 14.0001 17.5C16.1506 17.5 18.2632 18.066 20.1257 19.1409C21.9882 20.2159 23.535 21.7621 24.6107 23.6242"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 17.5C17.866 17.5 21 14.366 21 10.5C21 6.63401 17.866 3.5 14 3.5C10.134 3.5 7 6.63401 7 10.5C7 14.366 10.134 17.5 14 17.5Z"
      stroke={color}
      strokeWidth={2.5}
      strokeMiterlimit={10}
    />
  </Svg>
);

export const CalendarPlaceholderIcon = ({
  size = 33,
  color = "#8897AE",
  ...props
}: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 33 33" fill="none" {...props}>
    <Path
      d="M4.25238 12.9307H28.7603"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22.6078 18.3008H22.6206"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.5063 18.3008H16.5191"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.3921 18.3008H10.4048"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22.6078 23.6445H22.6206"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16.5063 23.6445H16.5191"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.3921 23.6445H10.4048"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22.0601 2.75V7.27482"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.9526 2.75V7.27482"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.3276 4.92188H10.6851C6.64713 4.92188 4.125 7.17128 4.125 11.306V23.7493C4.125 27.9491 6.64713 30.2505 10.6851 30.2505H22.3149C26.3656 30.2505 28.875 27.9881 28.875 23.8533V11.306C28.8877 7.17128 26.3783 4.92188 22.3276 4.92188Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

