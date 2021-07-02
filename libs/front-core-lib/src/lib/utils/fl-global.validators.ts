import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export class FlGlobalValidators {

  /**
   * Validator that check if the form value is different from a value (using ===)
   * @param compareValue value to compare with form value
   * @return Error {sameValue: true} if the value is same as the one in params
   */
  public static differentValue(compareValue: any): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value: any = control.value;
      if (value == null || value.length === 0) {
        return null;  // don't validate empty values to allow optional controls
      }

      if (value !== compareValue) {
        return null;
      } else {
        return {sameValue: true};
      }
    };
  }

  /**
   * Verify that the input as at least 8 characters, 1 letter and 1 number
   * return error incorrectPasswordFormat if not
   */
  public static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.value) {
        return null;
      }

      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;


      if (!passwordRegex.test(control.value)) {
        return {incorrectPasswordFormat: true};
      } else {
        return null;
      }
    };
  }

  /**
   * Verify that the repeat password is the same as the password
   * @param passwordFormField name of the password control to compare values
   * return error incorrectRepeatPassword
   */
  public static repeatPasswordValidator(passwordFormField: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.parent || !control.value) {
        return null;
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (control.parent.controls[passwordFormField].value !== control.value) {
        return {incorrectRepeatPassword: true};
      }
      return null;
    };
  }

  /**
   * Verify that the value matches the regex
   * @param regex regex used to check
   * return error invalidFormat
   */
  public static regexValidator(regex: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!control.parent || !control.value) {
        return null;
      }

      if (!regex.test(control.value)) {
        return {invalidFormat: true};
      }
      return null;
    };
  }

  /**
   * Verify that the value is a integer
   * return error notInteger
   */
  public static isInteger(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const value = control.value;
      if (value !== 0 && !value) {
        return null;
      }

      if (!Number.isInteger(value)) {
        return {notInteger: true};
      }
      return null;
    };
  }


}
