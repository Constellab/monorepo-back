import {Component, Input, OnInit} from '@angular/core';
import {HaBrickCreationDTO, HaBrickDTO} from '../../../../ha-core/ha-model/ha-entities/ha-brick.class';
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
  errorInput: Record<string, boolean> = {};

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
      repoType: [HaRepoType.PIP, Validators.required],
      isBeta: [false, Validators.required],
      subPatch: [null, [Validators.min(0), FlGlobalValidators.isInteger]],
      repoGit: [null],
      repoPip: [null],
      technicalInfo: [null],
      references: [null]
    });
  }

  submit(): void {

    const formValue: Partial<HaBrickDTO> = this.formGp.value;
    if (this.formGp.valid && !this.isLoading) {
      this.isLoading = true;
      this.brickService.create(formValue).subscribe(
        {
          next: (brick) => {
            this.isLoading = false;
            this.router.navigateByUrl('/bricks/' + brick.name);
          },
          error: () => {
            this.isLoading = false;
          }
        }
      )
    }
  }

  onFileSelected($event: any): void {
    this.errorFile = false;
    this.errorInput = {}
    this.inputFile = null;
    this.formGp.reset();
    if (!$event.target.files[0].name.endsWith('.json')) {
      this.errorFile = true;
      this.errorFileText = 'file_wrong_type';
    }
    if (typeof (FileReader) !== 'undefined' && !this.errorFile) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const srcResult = JSON.parse(e.target.result);
        this.brickService.getByName(srcResult.name).subscribe(res => {
          if(res == null){
            this.inputFile =
              new HaAddVersionInput(true, srcResult.name, srcResult.version, srcResult.environment, srcResult.technical_info);
            this.formGp.controls.name.setValue(this.inputFile.name);
            const version: string[] = this.inputFile.version.split('-');
            this.formGp.controls.version.setValue(version[0]);
            this.formGp.controls.references.setValue(this.inputFile.brickVersionReferences);
            this.formGp.controls.technicalInfo.setValue(this.inputFile.technicalInfo);
            this.formGp.controls.isBeta.setValue(this.inputFile.isBeta);
            this.formGp.controls.repoType.setValue(HaRepoType.PIP);
            if(this.inputFile.isBeta){
              this.formGp.controls.subPatch.setValue(this.inputFile.subPatch);
            }

            if(!this.formGp.controls.name.valid){
              this.errorInput['name'] = true;
            }
            if(!this.formGp.controls.version.valid){
              this.errorInput['version'] = true;
            }
          } else {
            this.errorFile = true;
            this.errorFileText = 'brick_already_exists'
          }
        })

      };

      reader.readAsText($event.target.files[0]);
    }
  }
}
