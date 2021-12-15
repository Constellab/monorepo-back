import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {BioxResourceImportConfig} from '../../../../model/entities/resource/biox-resource-converter.class';
import {
  BioxConfigureSpecsForm,
  BioxConfigureSpecsFormComponent
} from '../../../biox-config-core/component/biox-configure-specs-form/biox-configure-specs-form.component';
import {BioxConfigData, BioxConfigValues} from '../../../../model/entities/biox-config.entity';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlFormHelper, FlSnackBarService} from '@monorepo/front-core-lib';
import {RouterService} from '../../../../service/router.service';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';

export interface BioxImportResourceDialogInput {
  resourceId: string;
  resourceHumanName: string;
  resourceTypingName: string;
}

/**
 * Dialog to config a resource import and call import
 */
@Component({
  selector: 'gen-biox-import-resource-dialog',
  templateUrl: './biox-import-resource-dialog.component.html',
  styleUrls: ['./biox-import-resource-dialog.component.scss']
})
export class BioxImportResourceDialogComponent implements OnInit {

  importConfig: BioxResourceImportConfig;

  formGp: FormGroup<BioxConfigureSpecsForm>;
  configData: BioxConfigData;

  getIsLoading: boolean = false;
  callIsLoading: boolean = false;

  resourceNoImportable: boolean = false;

  resourceHumanName: string;

  constructor(@Inject(MAT_DIALOG_DATA) private input: BioxImportResourceDialogInput,
              private dialogRef: MatDialogRef<BioxImportResourceDialogComponent>,
              private resourceService: BioxResourceService,
              private routerService: RouterService,
              private snackBarService: FlSnackBarService) {
    this.resourceHumanName = input.resourceHumanName;
  }

  ngOnInit(): void {
    this.getIsLoading = true;
    this.resourceService.getImportSpecs(this.input.resourceTypingName).subscribe(
      importSpecs => this.getImportConfigSuccess(importSpecs),
      () => this.getImportConfigError()
    );
  }

  private getImportConfigSuccess(importConfig: BioxResourceImportConfig): void {
    this.importConfig = importConfig;
    this.getIsLoading = false;

    this.configData = BioxConfigData.fromSpecs(importConfig.specs);
    this.formGp = BioxConfigureSpecsFormComponent.buildFormGroup(this.configData);
  }

  private getImportConfigError(): void {
    this.resourceNoImportable = true;
    this.getIsLoading = false;
  }

  submit(): void {
    if (this.callIsLoading) return;
    if (this.formGp.valid) {
      const value: BioxConfigValues = {...this.formGp.value.public, ...this.formGp.value.protected};
      this.callImport(value);
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

  private callImport(configValue: BioxConfigValues): void {
    this.callIsLoading = true;
    this.resourceService.callImporter(this.input.resourceId, configValue).subscribe(
      resource => this.callImportSuccess(resource),
      () => this.callIsLoading = false
    );
  }

  private callImportSuccess(resource: BioxResource): void {
    this.snackBarService.openSuccessMessage('biox.resource_imported', true);
    this.routerService.navigateToBioxResourceDetail(resource.id);
    this.dialogRef.close();
  }

}
