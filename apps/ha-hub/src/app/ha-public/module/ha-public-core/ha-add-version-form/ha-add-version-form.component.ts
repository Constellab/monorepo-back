import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {HaNewVersionDTO} from '../../../../ha-core/ha-model/ha-entities/ha-version.class';
import {Validators} from '@angular/forms';
import {FlGlobalValidators} from '@monorepo/front-core-lib';
import {HaBrickDTO, HaCreateBrickDTO} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';

@Component({
  selector: 'ha-add-version-form',
  templateUrl: './ha-add-version-form.component.html',
  styleUrls: ['./ha-add-version-form.component.scss']
})
export class HaAddVersionFormComponent implements OnInit {

  @Input()
  formGp: FormGroup<Partial<HaNewVersionDTO | HaCreateBrickDTO>>

  public static buildForm(): FormGroup<Partial<HaNewVersionDTO | HaCreateBrickDTO>>{
    return new FormBuilder().group({
      version: [null, [Validators.required, Validators.pattern( new RegExp('^(\\d+\\.)(\\d+\\.)(\\*|\\d+)$'))]],
      repoType: [null, Validators.required],
      isBeta: [false, Validators.required],
      subPatch: [null, [Validators.min(0), FlGlobalValidators.isInteger]]
    });
  }

  constructor() { }

  ngOnInit(): void {
  }

  radioToggle(isBeta: boolean): void{
    if(isBeta){
      this.formGp.controls.subPatch.addValidators(Validators.required);
    } else {
      this.formGp.controls.subPatch.removeValidators(Validators.required)
    }
  }

}
