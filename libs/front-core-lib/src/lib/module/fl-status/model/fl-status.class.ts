import {flThemeClass} from '../../fl-theme/model/fl-theme-detail.class';

/**
 * Status interface to describe it with detail
 */
export interface FlStatus<STATUS = string> {
  value: STATUS; // status string
  name: string; // translatable name of the status
  textColorClass: string; // class used to color status text
  backgroundColorClass: string; // class used to color status background
  icon: string; // icon of the status
}

/**
 * Object to list the status with detail
 */
export type FlStatusDict<STATUS extends string = string> = Record<STATUS, FlStatus<STATUS>>;


/**
 * Class that contains generic icon, background class and text class for status
 */
export class FlStatusHelper {

  public static successIcon: string = 'check';
  public static errorIcon: string = 'error';
  public static warningIcon: string = 'warnings';
  public static infoIcon: string = 'info';
  public static runningIcon: string = 'cached';
  public static archivedIcon: string = 'inventory_2';
  public static draftIcon: string = 'hourglass_empty';
  public static stoppedIcon: string = 'stop';

  public static successBackgroundClass: string = flThemeClass.primaryBackground;
  public static errorBackgroundClass: string = flThemeClass.warnBackground;
  public static warningBackgroundClass: string = flThemeClass.accentBackground;
  public static infoBackgroundClass: string = flThemeClass.greyBackground;

  public static successTextClass: string = flThemeClass.primaryText;
  public static errorTextClass: string = flThemeClass.warnText;
  public static warningTextClass: string = flThemeClass.accentText;
  public static infoTextClass: string = flThemeClass.greyText;

  public static getSuccessStatus<STATUS = string>(value: STATUS,
                                                  name: string = 'flStatus.success',
                                                  icon = FlStatusHelper.successIcon): FlStatus<STATUS> {
    return {
      name: name,
      value: value,
      textColorClass: FlStatusHelper.successTextClass,
      backgroundColorClass: FlStatusHelper.successBackgroundClass,
      icon: icon
    };
  }

  public static getErrorStatus<STATUS = string>(value: STATUS,
                                                name: string = 'flStatus.error',
                                                icon = FlStatusHelper.errorIcon): FlStatus<STATUS> {
    return {
      name: name,
      value: value,
      textColorClass: FlStatusHelper.errorTextClass,
      backgroundColorClass: FlStatusHelper.errorBackgroundClass,
      icon: icon
    };
  }



  public static getWarningStatus<STATUS = string>(value: STATUS,
                                                  name: string = 'flStatus.warning',
                                                  icon = FlStatusHelper.warningIcon): FlStatus<STATUS> {
    return {
      name: name,
      value: value,
      textColorClass: FlStatusHelper.warningTextClass,
      backgroundColorClass: FlStatusHelper.warningBackgroundClass,
      icon: icon
    };
  }

  public static getInfoStatus<STATUS = string>(value: STATUS,
                                               name: string = 'flStatus.info',
                                               icon = FlStatusHelper.infoIcon): FlStatus<STATUS> {
    return {
      name: name,
      value: value,
      textColorClass: FlStatusHelper.infoTextClass,
      backgroundColorClass: FlStatusHelper.infoBackgroundClass,
      icon: icon
    };
  }

  //////////////////////// SPECIFIC STATUS //////////////////////

  public static getRunningStatus<STATUS = string>(value: STATUS): FlStatus<STATUS> {
    return FlStatusHelper.getInfoStatus(value, 'flStatus.running', FlStatusHelper.runningIcon);
  }

  public static getArchivedStatus<STATUS = string>(value: STATUS): FlStatus<STATUS> {
    return FlStatusHelper.getInfoStatus(value, 'flStatus.archived', FlStatusHelper.archivedIcon);
  }

  public static getDraftStatus<STATUS = string>(value: STATUS): FlStatus<STATUS> {
    return FlStatusHelper.getInfoStatus(value, 'flStatus.draft', FlStatusHelper.draftIcon);
  }

  public static getStoppedStatus<STATUS = string>(value: STATUS): FlStatus<STATUS> {
    return FlStatusHelper.getInfoStatus(value, 'flStatus.stopped', FlStatusHelper.stoppedIcon);
  }

  public static getCriticalStatus<STATUS = string>(value: STATUS): FlStatus<STATUS> {
    return FlStatusHelper.getErrorStatus(value, 'flStatus.critical', FlStatusHelper.errorIcon);

  }
}


