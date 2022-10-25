import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {FlSignUpUser} from '../../model/fl-sign-up-user.class';
import {Validators} from '@angular/forms';
import {FlGlobalValidators} from '../../../../utils/fl-global.validators';

/**
 * Component that contains the form to create a new user
 */
@Component({
  selector: 'fl-signup-form',
  templateUrl: './fl-signup-form.component.html',
  styleUrls: ['./fl-signup-form.component.scss']
})
export class FlSignupFormComponent implements OnInit {

  @Input() formGp: FormGroup<FlSignUpUser>;


  constructor() { }

  public static buildFormGroup(): FormGroup<FlSignUpUser>{
    return new FormBuilder().group({
      firstname: [null, Validators.required],
      lastname: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, FlGlobalValidators.passwordValidator()]],
      repeatPassword: [null, [Validators.required,
        FlGlobalValidators.repeatPasswordValidator('password')]],
      category: [null, Validators.required],
      validateCGU: [false, FlGlobalValidators.isValue(true)]
    });
  }

  ngOnInit(): void {
  }

  // update the repeat password validity on password change
  updateRepeatPasswordValidity(): void {
    this.formGp.get('repeatPassword').updateValueAndValidity();
  }
}
