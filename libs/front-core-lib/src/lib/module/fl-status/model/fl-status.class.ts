import {flThemeClass} from '../../../service/model/fl-theme-detail.class';

export type FlStatusColorMode = 'background' | 'text'

export interface FlStatus {

  /**
   * Get the status name
   */
  getStatusName(): string;

  getStatusClassColor(mode: FlStatusColorMode): string;

  getStatusIcon(): string;
}

/**
 * Method to get a status color based on the status
 */
export type FlGetStatusClassColorFunction = (status: any,
                                             mode: FlStatusColorMode) => string;

/**
 * Method to get a status icon based on the status
 */
export type FlGetStatusIconFunction = (status: any) => string;

/**
 * Class that contains generic icon, background class and text class for status
 */
export class FlStatusHelper {

  public static successIcon: string = 'check';
  public static errorIcon: string = 'error';
  public static warningIcon: string = 'warnings';
  public static infoIcon: string = 'info';

  public static successBackground: string = flThemeClass.primaryBackground;
  public static errorBackground: string = flThemeClass.warnBackground;
  public static warningBackground: string = flThemeClass.accentBackground;
  public static infoBackground: string = flThemeClass.greyBackground;

  public static successText: string = flThemeClass.primaryText;
  public static errorText: string = flThemeClass.warnText;
  public static warningText: string = flThemeClass.accentText;
  public static infoText: string = flThemeClass.greyText;

  public static getSuccessColor(mode: FlStatusColorMode): string {
    return mode === 'background' ? FlStatusHelper.successBackground : FlStatusHelper.successText;
  }

  public static getErrorColor(mode: FlStatusColorMode): string {
    return mode === 'background' ? FlStatusHelper.errorBackground : FlStatusHelper.errorText;
  }

  public static getWarningColor(mode: FlStatusColorMode): string {
    return mode === 'background' ? FlStatusHelper.warningBackground : FlStatusHelper.warningText;
  }

  public static getInfoColor(mode: FlStatusColorMode): string {
    return mode === 'background' ? FlStatusHelper.infoBackground : FlStatusHelper.infoText;
  }
}
