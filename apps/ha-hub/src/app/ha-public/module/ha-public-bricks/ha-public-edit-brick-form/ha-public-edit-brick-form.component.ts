import {Component, Input, OnInit} from '@angular/core';
import {HaBrick, HaBrickDTO} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {Router} from '@angular/router';
import {FlGlobalValidators} from '@monorepo/front-core-lib';

@Component({
  selector: 'ha-public-edit-brick-form',
  templateUrl: './ha-public-edit-brick-form.component.html',
  styleUrls: ['./ha-public-edit-brick-form.component.scss']
})
export class HaPublicEditBrickFormComponent implements OnInit {

  @Input()
  brick: HaBrick;

  formGp: FormGroup;

  isLoading: boolean;

  constructor(
    private brickService: HaBrickService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.buildForm();
  }

  buildForm(): void {

    this.formGp = new FormBuilder().group({
      id: [null],
      name: [null, Validators.required],
      description: [null, Validators.required],
      version: [null, [Validators.required, Validators.pattern(new RegExp('^(\\d+\\.)(\\d+\\.)(\\*|\\d+)$'))]],
      repoType: [null, Validators.required],
      isBeta: [false, Validators.required],
      subPatch: [null, [Validators.min(0), FlGlobalValidators.isInteger]],
      repoGit: [null],
      repoPip: [null]
    });
  }

  submit(): void {

    const formValue: Partial<HaBrickDTO> = this.formGp.value;
    if (this.formGp.valid && !this.isLoading) {
      this.isLoading = true;
    }
    if (formValue.id) {
      //update
    } else {
      this.brickService.create(formValue).subscribe((brick) => {
        this.isLoading = false;
        this.router.navigateByUrl('/bricks/' + brick.name);
      });
    }
  }
}
