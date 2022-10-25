import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {CmCredentials} from '@monorepo/common-model';
import {Validators} from '@angular/forms';

/**
 * Form for the login component
 */
@Component({
  selector: 'fl-login-form',
  templateUrl: './fl-login-form.component.html',
  styleUrls: ['./fl-login-form.component.scss']
})
export class FlLoginFormComponent implements OnInit {

  @Input() formGp: FormGroup<CmCredentials>;


  constructor() {
  }

  public static buildFormGroup(): FormGroup<CmCredentials> {
    return new FormBuilder().group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
  }

  ngOnInit(): void {
  }


}
