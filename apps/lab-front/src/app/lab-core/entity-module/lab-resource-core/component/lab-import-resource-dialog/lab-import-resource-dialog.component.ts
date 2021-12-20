import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  Inject,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {
  LabConfigureSpecsForm,
  LabConfigureSpecsFormComponent
} from '../../../lab-config-core/component/lab-configure-specs-form/lab-configure-specs-form.component';
import {LabConfigData, LabConfigValues} from '../../../../model/entities/lab-config.entity';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {FlFormHelper, FlSnackBarService} from '@monorepo/front-core-lib';
import {LabRouterService} from '../../../../service/lab-router.service';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';
import {Validators} from '@angular/forms';
import {MatSelectChange} from '@angular/material/select';

export interface LabImportResourceDialogInput {
  resourceId: string;
  resourceHumanName: string;
  resourceTypingName: string;
}

interface LabImportResourceDialogForm {
  importer: LabProcessType;
  config: LabConfigureSpecsForm;
}

/**
 * Dialog to config a resource import and call import
 */
@Component({
  selector: 'lab-import-resource-dialog',
  templateUrl: './lab-import-resource-dialog.component.html',
  styleUrls: ['./lab-import-resource-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LabImportResourceDialogComponent implements OnInit {

  @ViewChild('viewContainer', {static: false, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  importers: LabProcessType[];

  formGp: FormGroup<LabImportResourceDialogForm>;
  configData: LabConfigData;

  getIsLoading: boolean = false;
  callIsLoading: boolean = false;

  resourceNoImportable: boolean = false;

  resourceHumanName: string;

  private viewComponentRef: ComponentRef<LabConfigureSpecsFormComponent>;

  constructor(@Inject(MAT_DIALOG_DATA) private input: LabImportResourceDialogInput,
              private dialogRef: MatDialogRef<LabImportResourceDialogComponent>,
              private resourceService: LabResourceService,
              private routerService: LabRouterService,
              private snackBarService: FlSnackBarService,
              private cdr: ChangeDetectorRef,
              private componentFactoryResolver: ComponentFactoryResolver) {
    this.resourceHumanName = input.resourceHumanName;
  }

  ngOnInit(): void {
    this.getIsLoading = true;
    this.resourceService.getImporters(this.input.resourceTypingName).subscribe(
      importers => this.getImportersSuccess(importers),
      () => this.getImportersError()
    );
  }

  private getImportersSuccess(importers: LabProcessType[]): void {
    this.importers = importers;
    this.getIsLoading = false;

    this.formGp = new FormBuilder().group({
      importer: [null, Validators.required],
      config: [null]
    });
    this.cdr.markForCheck();
  }

  private getImportersError(): void {
    this.resourceNoImportable = true;
    this.getIsLoading = false;
  }

  selectImporter(selection: MatSelectChange): void {
    const importer: LabProcessType = selection.value;
    this.configData = LabConfigData.fromSpecs(importer.getConfigSpecs(), importer.getConfigSpecs().getDefaultConfig());
    this.formGp.setControl('config', LabConfigureSpecsFormComponent.buildFormGroup(this.configData));
    this.formGp.updateValueAndValidity();

    // build the component manually for force it to reload
    this.viewComponentRef?.destroy();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(LabConfigureSpecsFormComponent);
    this.viewComponentRef = this.viewContainer.createComponent(componentFactory);
    this.viewComponentRef.instance.configData = this.configData;
  }

  get showNoConfigMessage(): boolean {
    return this.formGp.value.importer && !this.formGp.value.importer?.hasConfigSpecs();
  }

  submit(): void {
    if (this.callIsLoading) return;
    if (this.formGp.valid) {
      const value: LabConfigValues = {...this.formGp.value.config.public, ...this.formGp.value.config.protected};
      this.callImport(this.formGp.value.importer, value);
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

  private callImport(importer: LabProcessType, configValue: LabConfigValues): void {
    this.callIsLoading = true;
    this.resourceService.callImporter(this.input.resourceId, importer.typingName, configValue).subscribe(
      resource => this.callImportSuccess(resource),
      () => {
        this.callIsLoading = false;
        this.cdr.markForCheck();
      }
    );
  }

  private callImportSuccess(resource: LabResource): void {
    this.snackBarService.openSuccessMessage('biox.resource_imported', true);
    this.routerService.navigateToResourceDetail(resource.id);
    this.dialogRef.close();
  }

}
