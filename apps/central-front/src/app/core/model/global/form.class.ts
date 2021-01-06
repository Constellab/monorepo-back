/**
 * Mode for form components
 */
export type FormMode = 'create' | 'update';

/**
 * Describe the input of a form dialog that support
 * create and update mode
 */
export interface FormDialogInput<T = any> {
  mode: FormMode;
  object?: T; // object to init the form in the mode is 'create'
}
