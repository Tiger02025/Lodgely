export const colors = {
  // Primary — #134E4A
  primary: '#134E4A',
  primaryDark: '#0F3D3A',
  primaryDarker: '#0B2C2A',
  primaryMid: '#2E7A74',
  primarySoft: '#5B9A95',
  primaryTint: '#DCEceb',

  // Secondary — #4ADE80
  secondary: '#4ADE80',
  secondaryDark: '#16A34A',
  secondaryDarker: '#15803D',
  secondaryTint: '#DCFCE7',

  // Accent — #A3E635
  accent: '#A3E635',
  accentDark: '#65A30D',
  accentDarker: '#4D7C0F',
  accentTint: '#ECFCCB',

  // Tertiary — White and Black
  white: '#FFFFFF',
  black: '#000000',

  // Surfaces
  background: '#F0F7F6',
  surface: '#FFFFFF',
  surfaceAlt: '#DCECEB',
  border: '#BBDAD7',
  divider: '#DCEceb',

  // Text
  text: '#0B2C2A',
  textMuted: '#2E7A74',
  textSubtle: '#5B9A95',
  textInverse: '#FFFFFF',

  // Status
  success: '#4ADE80',
  warning: '#A3E635',
  error: '#EF4444',
  info: '#2E7A74',
} as const;

export const fonts = {
  // Brand name
  brand: 'Nunito_800ExtraBold',
  brandBold: 'Nunito_700Bold',
  // Headings, subheadings and body
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
} as const;

export const brand = {
  name: 'Lodgely',
  colors,
  fonts,
} as const;

export default brand;
