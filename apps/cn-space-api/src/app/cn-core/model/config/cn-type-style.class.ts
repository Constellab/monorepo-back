export interface CnTypeStyle {
  icon_technical_name: string;
  icon_type: 'MATERIAL_ICON' | 'COMMUNITY_ICON' | 'COMMUNITY_IMAGE';
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  background_color?: string | 'primary' | 'accent' | 'warn';
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  icon_color?: string | 'primaryContrast' | 'accentContrast' | 'warnContrast';
}
