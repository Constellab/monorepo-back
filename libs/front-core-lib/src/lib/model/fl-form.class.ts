/**
 * Mode for form components
 */
export type FlFormMode = 'create' | 'update';

/**
 * Describe the input of a form dialog that support
 * create and update mode
 */
export interface FlFormDialogInput<T = any> {
  mode: FlFormMode;
  object?: T; // object to init the form in the mode is 'create'
}
