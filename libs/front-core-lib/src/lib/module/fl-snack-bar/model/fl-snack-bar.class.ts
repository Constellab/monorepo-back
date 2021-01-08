
/**
 * Input for the snack bar info
 */
export interface FlSnackBarInfoInput {
  /**
   * The mode of the snack bar
   */
  mode: FlSnackBarMode;

  /**
   * The text of the snack bar
   */
  text: string;

  /**
   * If true a close button is shown
   */
  showCloseButton: boolean;

}

/**
 * The mode of the SnackBarInfo
 *
 * If the mode is 'success' the snackbar background is the primary color
 *
 * If the mode is 'error' the snackbar background is the warn color
 */
export type FlSnackBarMode = 'success' | 'error';
