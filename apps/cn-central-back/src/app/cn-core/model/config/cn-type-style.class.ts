export interface CnTypeStyle {
  icon_technical_name: string;
  icon_type: 'MATERIAL_ICON' | 'COMMUNITY_ICON' | 'COMMUNITY_IMAGE';
  background_color?: string | 'primary' | 'accent' | 'warn';
  icon_color?: string | 'primaryContrast' | 'accentContrast' | 'warnContrast';
}
