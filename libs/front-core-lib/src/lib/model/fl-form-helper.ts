import {AbstractControl, FormArray, FormControl, FormGroup} from '@angular/forms';
import {ClHelpService} from '@monorepo/core-lib';

/**
 * Class with static method to simplify form management
 */
export class FlFormHelper {

  /**
   * return true if the control is empty
   * If the control is a FormGroup or an FormArray it check each field deeply
   * @param control control to check
   */
  public static isControlEmpty(control: AbstractControl): boolean {
    if (control == null) {
      return false;
    }

    if (control instanceof FormControl) {
      return ClHelpService.isNullOrEmpty(control.value);
    } else if (control instanceof FormArray || control instanceof FormGroup) {
      for (const key of Object.keys(control.controls)) {
        if (!FlFormHelper.isControlEmpty(control.get(key))) {
          return false;
        }
      }

      return true;
    }

    return false;
  }

  /**
   * Mark the control and children as touched and force updating validity
   * @param control
   */
  public static markAllAsTouched(control: AbstractControl): void {
    if (control == null) {
      return;
    }

    control.markAsTouched();
    // update validity with onlySelf because parent were already updated
    control.updateValueAndValidity({onlySelf: true});
    if (control instanceof FormArray || control instanceof FormGroup) {
      for (const key of Object.keys(control.controls)) {
        FlFormHelper.markAllAsTouched(control.get(key));
      }
    }
  }
}
