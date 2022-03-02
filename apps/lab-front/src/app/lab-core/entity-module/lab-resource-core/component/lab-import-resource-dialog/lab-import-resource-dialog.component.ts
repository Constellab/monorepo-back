import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
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
import {FlFormHelper, FlOverlayRef, FlSnackBarService} from '@monorepo/front-core-lib';
import {LabRouterService} from '../../../../service/lab-router.service';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';
import {Validators} from '@angular/forms';
import {LabResourceImporterType} from '../../../../model/entities/resource/lab-resource.dto';
import {LabTypingName} from '../../../../model/entities/lab-typing-name.class';

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

  groupImporters: LabResourceImporterType[];

  formGp: FormGroup<LabImportResourceDialogForm>;
  configData: LabConfigData;

  getIsLoading: boolean = false;
  callIsLoading: boolean = false;

  resourceNoImportable: boolean = false;

  resourceHumanName: string;

  private viewComponentRef: ComponentRef<LabConfigureSpecsFormComponent>;

  private detailOverlayRef: FlOverlayRef;

  constructor(@Inject(MAT_DIALOG_DATA) private input: LabImportResourceDialogInput,
              private dialogRef: MatDialogRef<LabImportResourceDialogComponent>,
              private resourceService: LabResourceService,
              private routerService: LabRouterService,
              private snackBarService: FlSnackBarService,
              private cdr: ChangeDetectorRef) {
    this.resourceHumanName = input.resourceHumanName;
  }

  ngOnInit(): void {
    this.getIsLoading = true;
    this.resourceService.getImporters(this.input.resourceTypingName).subscribe(
      groupImporters => this.getImportersSuccess(groupImporters),
      () => this.getImportersError()
    );

    // on dialog close, close the overlay ref
    this.dialogRef.beforeClosed().subscribe(() => this.detailOverlayRef?.dispose());
  }

  private getImportersSuccess(groupImporters: LabResourceImporterType[]): void {
    this.groupImporters = groupImporters;
    this.getIsLoading = false;

    let defaultValue: LabProcessType = null;

    if (this.input.resourceTypingName === LabTypingName.resource.tableFile) {
      // find the importer of TableFile
      const tablesImporters = groupImporters.find(group => group.resource.typingName == LabTypingName.resource.tableFile);
      defaultValue = tablesImporters?.importers.find(importer => importer.typingName === LabTypingName.task.tableImporter) ?? null;
    }

    this.formGp = new FormBuilder().group({
      importer: [defaultValue, Validators.required],
      config: [null]
    });

    // let time to refresh the view to be able to access html container
    setTimeout(() => {
      if (defaultValue) {
        this.selectImporter(defaultValue);
      }
      this.cdr.markForCheck();
    }, 0);

    this.cdr.markForCheck();
  }

  private getImportersError(): void {
    this.resourceNoImportable = true;
    this.getIsLoading = false;
  }

  selectImporter(importer: LabProcessType): void {
    this.configData = LabConfigData.fromSpecs(importer.getConfigSpecs());
    this.formGp.setControl('config', LabConfigureSpecsFormComponent.buildFormGroup(this.configData));
    this.formGp.updateValueAndValidity();

    // build the component manually for force it to reload
    this.viewComponentRef?.destroy();
    this.viewComponentRef = this.viewContainer.createComponent(LabConfigureSpecsFormComponent);
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
    this.snackBarService.openSuccessMessage({text: 'biox.resource_imported', translateText: true});
    this.routerService.navigateToResourceDetail(resource.id);
    this.dialogRef.close();
  }
}
