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

  public static successTextClass: string = flThemeClass.primaryText;
  public static errorTextClass: string = flThemeClass.warnText;
  public static warningTextClass: string = flThemeClass.accentText;
  public static infoTextClass: string = flThemeClass.greyText;

  public static getSuccessColor(mode: FlStatusColorMode): string {
    return mode === 'background' ? FlStatusHelper.successBackground : FlStatusHelper.successTextClass;
  }

  public static getErrorColor(mode: FlStatusColorMode): string {
    return mode === 'background' ? FlStatusHelper.errorBackground : FlStatusHelper.errorTextClass;
  }

  public static getWarningColor(mode: FlStatusColorMode): string {
    return mode === 'background' ? FlStatusHelper.warningBackground : FlStatusHelper.warningTextClass;
  }

  public static getInfoColor(mode: FlStatusColorMode): string {
    return mode === 'background' ? FlStatusHelper.infoBackground : FlStatusHelper.infoTextClass;
  }

  public static getSuccessStatus(): FlStatus {
    return new FlSuccessStatus();
  }

  public static getErrorStatus(): FlStatus {
    return new FlErrorStatus();
  }

  public static getWarningStatus(): FlStatus {
    return new FlWarningStatus();
  }

  public static getInfoStatus(): FlStatus {
    return new FlInfoStatus();
  }
}


/////////////////////// Multiple preconfigured status class /////////////////
class FlSuccessStatus implements FlStatus {
  getStatusClassColor(mode: FlStatusColorMode): string {
    return FlStatusHelper.getSuccessColor(mode);
  }

  getStatusIcon(): string {
    return FlStatusHelper.successIcon;
  }

  getStatusName(): string {
    return 'error';
  }
}

class FlErrorStatus implements FlStatus {
  getStatusClassColor(mode: FlStatusColorMode): string {
    return FlStatusHelper.getErrorColor(mode);
  }

  getStatusIcon(): string {
    return FlStatusHelper.errorIcon;
  }

  getStatusName(): string {
    return 'success';
  }
}

class FlWarningStatus implements FlStatus {
  getStatusClassColor(mode: FlStatusColorMode): string {
    return FlStatusHelper.getWarningColor(mode);
  }

  getStatusIcon(): string {
    return FlStatusHelper.warningIcon;
  }

  getStatusName(): string {
    return 'warning';
  }
}

class FlInfoStatus implements FlStatus {
  getStatusClassColor(mode: FlStatusColorMode): string {
    return FlStatusHelper.getInfoColor(mode);
  }

  getStatusIcon(): string {
    return FlStatusHelper.infoIcon;
  }

  getStatusName(): string {
    return 'info';
  }
}
