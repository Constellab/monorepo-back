import {Component, Input, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {CaLabInstanceService} from '../../../ca-core/service-api/ca-lab-instance.service';
import {FlSnackBarService} from '@monorepo/front-core-lib';
import {CaLabInstanceConfig, CaLabManagerBrickVersionDTO} from '../../../ca-core/model/entities/ca-lab-manager.class';

/**
 * Form to update the lab instance config
 */
@Component({
  selector: 'ca-lab-instance-config-form',
  templateUrl: './ca-lab-instance-config-form.component.html',
  styleUrls: ['./ca-lab-instance-config-form.component.scss']
})
export class CaLabInstanceConfigFormComponent implements OnInit {
  @Input() labInstanceId: string;

  @Input() labConfig: CaLabInstanceConfig;

  formGp: FormGroup<CaLabInstanceConfig>;
  formArray: FormArray<CaLabManagerBrickVersionDTO>;

  isLoading: boolean = false;

  constructor(private labInstanceService: CaLabInstanceService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const formArray: FormArray<CaLabManagerBrickVersionDTO> = new FormArray([]);
    for (const brick of this.labConfig.bricks) {
      const formGp: FormGroup<CaLabManagerBrickVersionDTO> = new FormBuilder().group({
        name: [{value: brick.name, disabled: true}, [Validators.required]],
        repo: [{value: brick.repo, disabled: true}, [Validators.required]],
        repoType: [brick.repoType, [Validators.required]],
        version: [brick.version, [Validators.required]],
        commit: [brick.commit, [Validators.required]],
        branch: [brick.branch, [Validators.required]],
        isHidden: [brick.isHidden, [Validators.required]],
      });
      formArray.push(formGp);
    }

    this.formArray = formArray;
    this.formGp = new FormBuilder().group({
      bricks: this.formArray
    });
  }

  submit(): void {
    if (!this.isLoading && this.formGp.valid) {
      this.updateConfig(this.formGp.getRawValue());
    }
  }

  private updateConfig(config: CaLabInstanceConfig): void {
    this.isLoading = true;
    this.labInstanceService.updateConfig(this.labInstanceId, config).subscribe(
      () => this.updateConfigSuccess(),
      () => this.isLoading = false
    );
  }

  private updateConfigSuccess(): void {
    this.isLoading = false;
    this.snackBarService.openSuccessMessage('lab_instance_config_updated', true);
  }
}
