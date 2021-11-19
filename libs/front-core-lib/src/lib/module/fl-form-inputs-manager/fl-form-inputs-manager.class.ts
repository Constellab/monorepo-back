import {AbstractControl} from '@angular/forms';

/**
 * Type use in chips inside  {@link FlFormInputsManagerComponent}
 */
export interface FlFormFilledInput {
  /**
   * key for the form input
   */
  key: string;

  /**
   * Displayed name for the form input
   */
  name: string;

  /**
   * Form control
   */
  control: AbstractControl;
}

/**
 * Simple interface to override the name of the chip when a form input is filled
 */
export interface FlFormInputName {
  /**
   * Name to display
   */
  name: string;
  /**
   * If provided, it override the translateByDefault input of {@link FlFormInputsManagerComponent}
   */
  translate?: boolean;
}

/**
 * Config object for the {@link FlFormInputsManagerComponent}
 *
 * This config is used to display the name of the input (that has been filled) in the chip
 *
 * If no value if provided for a key: the key is used as the name
 * If a string is provided it is used as the name (it doesn't go deeper event if it is a FormGroup)
 * If a {@link FlFormInputName} is provided the name under it is used
 * (it doesn't go deeper event if it is a FormGroup)
 * If it is a nested object (form nested form), the operation is done with the nested values
 *
 * Note that if no translate boolean is provided under LibFormFilledInputName, it uses the default
 * translate boolean input translateByDefault of {@link FlFormInputsManagerComponent}
 */
export type FlFormInputsManagerConfig<T = any> = {
  [P in keyof T]?: string | FlFormInputName | FlFormInputsManagerConfig;
};
