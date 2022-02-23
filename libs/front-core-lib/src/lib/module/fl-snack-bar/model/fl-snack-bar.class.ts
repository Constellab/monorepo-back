/**
 * Input for the snack bar info
 */
import {FlTranslatableText} from '../../fl-translate/model/fl-translate-param';

export interface FlSnackBarInfoInput {
  /**
   * The mode of the snack bar
   */
  mode: FlSnackBarMode;

  /**
   * The text of the snack bar
   */
  text: FlTranslatableText;

  /**
   * additional config
   */
  additionalConfig: FlSnackBarAdditionalConfig;
}

/**
 * The mode of the SnackBarInfo
 *
 * If the mode is 'success' the snackbar background is the primary color
 *
 * If the mode is 'error' the snackbar background is the warn color
 */
export type FlSnackBarMode = 'success' | 'error';

export interface FlSnackBarAdditionalConfig {
  /**
   * if true a close button is shown in the snackbar
   * default to true
   */
  showCloseButton?: boolean;

  /**
   * if provided, a detail button is displayed and this method is trigger on click
   * The snack bar is closed on click
   */
  detailButton?: (event: MouseEvent) => void;
}

export const flSnackBarAdditionalConfigDefault: FlSnackBarAdditionalConfig = {
  showCloseButton: true
};
