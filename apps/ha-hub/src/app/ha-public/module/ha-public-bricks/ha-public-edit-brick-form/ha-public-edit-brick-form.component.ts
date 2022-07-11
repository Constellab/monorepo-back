import {Component, OnInit} from '@angular/core';
import {HaBrickCreationDTO, HaBrickVisibility} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {HaBrickService} from '../../../../ha-core/ha-service/ha-brick.service';
import {Router} from '@angular/router';
import {FlGlobalValidators} from '@monorepo/front-core-lib';
import {HaAddVersionInput, HaRepoType} from '../../../../ha-core/ha-model/ha-entities/ha-version.class';

@Component({
  selector: 'ha-public-edit-brick-form',
  templateUrl: './ha-public-edit-brick-form.component.html',
  styleUrls: ['./ha-public-edit-brick-form.component.scss']
})
export class HaPublicEditBrickFormComponent implements OnInit {

  brick: HaBrickCreationDTO;

  formGp: FormGroup<HaBrickCreationDTO>;

  isLoading: boolean;
  inputFile: HaAddVersionInput;
  errorFile: boolean;
  errorFileText: string;
  repoError: boolean;
  errorInput: Record<string, boolean> = {};
  test: boolean;

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
      name: [null, [Validators.required, Validators.pattern(/^\S*$/)]],
      description: [null, [Validators.required, Validators.maxLength(255)]],
      version: [null, [Validators.required, Validators.pattern(new RegExp('^(\\d+\\.)(\\d+\\.)(\\*|\\d+)$'))]],
      repoType: [HaRepoType.PIP],
      isBeta: [false],
      subPatch: [null, [Validators.min(0), FlGlobalValidators.isInteger]],
      repoGit: [null],
      repoPip: [null],
      technicalInfo: [null],
      references: [null],
      visibility: [HaBrickVisibility.PUBLIC]
    });
    this.test = this.formGp.value.visibility === 'public'
  }

  submit(): void {

    const formValue: Partial<HaBrickCreationDTO> = this.formGp.value;
    if (this.formGp.value.repoPip || this.formGp.value.repoGit) {
      this.repoError = false;
      this.formGp.controls.repoPip.removeValidators(Validators.required);
      this.formGp.controls.repoGit.removeValidators(Validators.required);
      if (this.formGp.valid && !this.isLoading) {
        if (this.formGp.value.repoGit && !this.formGp.value.repoPip) {
          formValue.repoType = HaRepoType.GIT;
        }
        this.isLoading = true;
        this.brickService.create(formValue).subscribe(
          {
            next: (brick) => {
              this.isLoading = false;
              this.router.navigateByUrl('/bricks/' + brick.name).then();
            },
            error: () => {
              this.isLoading = false;
            }
          }
        )
      }
    } else {
      this.repoError = true;
      this.formGp.controls.repoPip.setValidators(Validators.required);
      this.formGp.controls.repoGit.setValidators(Validators.required);
    }
  }

  onFileSelected($event: File): void {
    if ($event == null) {
      return;
    }
    this.errorFile = false;
    this.errorInput = {}
    this.inputFile = null;
    this.formGp.reset();
    if (!$event.name.endsWith('.json')) {
      this.errorFile = true;
      this.errorFileText = 'file_wrong_type';
    }
    if (typeof (FileReader) !== 'undefined' && !this.errorFile) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const srcResult = JSON.parse(e.target.result);
        this.brickService.getByName(srcResult.name).subscribe(res => {
          if (res == null) {
            this.inputFile =
              new HaAddVersionInput(true, srcResult.name, srcResult.version, srcResult.environment, srcResult.technical_info);
            this.formGp.controls.name.setValue(this.inputFile.name);
            const version: string[] = this.inputFile.version.split('-');
            this.formGp.controls.version.setValue(version[0]);
            this.formGp.controls.references.setValue(this.inputFile.brickVersionReferences);
            this.formGp.controls.technicalInfo.setValue(this.inputFile.technicalInfo);
            this.formGp.controls.isBeta.setValue(this.inputFile.isBeta);
            if(this.formGp.controls.visibility.value === HaBrickVisibility.PRIVATE){
              this.formGp.controls.visibility.setValue(HaBrickVisibility.PRIVATE);
            } else {
              this.formGp.controls.visibility.setValue(HaBrickVisibility.PUBLIC);
            }
            this.formGp.controls.repoType.setValue(HaRepoType.PIP);
            if (this.inputFile.isBeta) {
              this.formGp.controls.subPatch.setValue(this.inputFile.subPatch);
            }

            if (!this.formGp.controls.name.valid) {
              this.errorInput['name'] = true;
            }
            if (!this.formGp.controls.version.valid) {
              this.errorInput['version'] = true;
            }
          } else {
            this.errorFile = true;
            this.errorFileText = 'brick_already_exists'
          }
        })

      };

      reader.readAsText($event);
    }
  }
}
