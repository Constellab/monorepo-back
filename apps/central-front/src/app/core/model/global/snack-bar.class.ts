
/**
 * Input for the snack bar info
 */
export interface SnackBarInfoInput {
  /**
   * The mode of the snack bar
   */
  mode: SnackBarMode;

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
export type SnackBarMode = 'success' | 'error';
