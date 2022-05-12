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
  LabConfigureSpecsFormComponent
} from '../../../lab-config-core/component/lab-configure-specs-form/lab-configure-specs-form.component';
import {LabConfigData, LabConfigureSpecsForm, LabConfigValues} from '../../../../model/entities/lab-config.entity';
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
  nodeExtension: string;
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
    this.resourceService.getImporters(this.input.resourceTypingName, this.input.nodeExtension).subscribe({
      next: groupImporters => this.getImportersSuccess(groupImporters),
      error: () => this.getImportersError()
    });

    // on dialog close, close the overlay ref
    this.dialogRef.beforeClosed().subscribe(() => this.detailOverlayRef?.dispose());
  }

  private getImportersSuccess(groupImporters: LabResourceImporterType[]): void {
    this.groupImporters = groupImporters;
    this.getIsLoading = false;

    const defaultValue: LabProcessType = this.getDefaultImporter(this.input.nodeExtension, groupImporters);

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
    this.configData = LabConfigData.fromSpecs(importer.configSpecs);
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


  // get default importer based on file extension
  private getDefaultImporter(extension: string, groupImporters: LabResourceImporterType[]): LabProcessType | null {
    // // if there is only one importer, select it
    if (groupImporters.length === 1 && groupImporters[0].importers.length === 1) {
      return groupImporters[0].importers[0];
    }
    if (['csv', 'tsv', 'xls', 'xlsx'].includes(extension)) {
      return this.findImporter(LabTypingName.importer.tableImporter, groupImporters);
    } else if (extension === 'json') {
      return this.findImporter(LabTypingName.importer.jsonImporter, groupImporters);
    } else if (extension === 'txt') {
      return this.findImporter(LabTypingName.importer.textImporter, groupImporters);
    }

    return null;
  }

  private findImporter(importerTypingName: string, groupImporters: LabResourceImporterType[]): LabProcessType | null {
    for (const group of groupImporters) {
      const importer = group.importers.find(importer => importer.typingName === importerTypingName);
      if (importer) return importer;
    }
    return null;
  }
}
