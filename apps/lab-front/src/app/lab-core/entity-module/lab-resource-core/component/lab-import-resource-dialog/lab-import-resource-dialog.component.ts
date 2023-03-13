import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog';
import {LabResourceService} from '../../../../entity-service/lab-resource.service';
import {
  LabConfigureSpecsFormComponent
} from '../../../lab-config-core/component/lab-configure-specs-form/lab-configure-specs-form.component';
import {LabConfig, LabConfigureSpecsForm} from '../../../../model/entities/lab-config.entity';
import {FormGroup} from '@ngneat/reactive-forms';
import {FlDialogService, FlFormHelper, FlOverlayRef, FlSnackBarService} from '@monorepo/front-core-lib';
import {LabRouterService} from '../../../../service/lab-router.service';
import {LabResource} from '../../../../model/entities/resource/lab-resource.entity';
import {LabProcessType} from '../../../../model/entities/lab-type/lab-process-type.entity';
import {
  LabSelectTypeDialogComponent,
  LabSelectTypeDialogInput
} from '../../../lab-type-core/component/lab-select-type-dialog/lab-select-type-dialog.component';
import {LabTypeEntity} from '../../../../model/entities/lab-type/lab-type.entity';
import {LabTypeService} from '../../../../entity-service/lab-type.service';
import {TdTypingName} from '@monorepo/technical-doc';
import {PrConfigValues} from '@monorepo/protocol';

export interface LabImportResourceDialogInput {
  resourceId: string;
  resourceHumanName: string;
  resourceTypingName: string;
  nodeExtension: string;
}

/**
 * Dialog to config a resource import and call import
 */
@Component({
  selector: 'lab-import-resource-dialog',
  templateUrl: './lab-import-resource-dialog.component.html',
  styleUrls: ['./lab-import-resource-dialog.component.scss'],
})
export class LabImportResourceDialogComponent implements OnInit, OnDestroy {

  formGp: FormGroup<LabConfigureSpecsForm>;

  selectedImporterType: LabProcessType = null;
  configData: LabConfig;

  processTypeIsLoading: boolean = false;
  callIsLoading: boolean = false;

  private detailOverlayRef: FlOverlayRef;

  constructor(@Inject(MAT_DIALOG_DATA) private input: LabImportResourceDialogInput,
              private dialogService: FlDialogService,
              private dialogRef: MatDialogRef<LabImportResourceDialogComponent>,
              private resourceService: LabResourceService,
              private typingService: LabTypeService,
              private routerService: LabRouterService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    const defaultImporter = this.getDefaultImporterTypingName(this.input.nodeExtension);

    if (defaultImporter) {
      this.loadImporterType(defaultImporter);
    } else {
      this.openImportSelectDialog();
    }
  }

  openImportSelectDialog(): void {
    const input: LabSelectTypeDialogInput = {
      searchConfig: {
        mode: 'importer',
        resourceTypingName: this.input.resourceTypingName,
        extension: this.input.nodeExtension
      },
      title: 'biox.select_importer'
    };

    this.dialogService.openBigDialog(LabSelectTypeDialogComponent, {data: input}).afterClosed().subscribe(
      (importer: LabTypeEntity) => this.loadImporterType(importer?.typingName ?? null)
    );
  }

  private loadImporterType(importerTypingName: string): void {
    if (importerTypingName == null || importerTypingName === this.selectedImporterType?.typingName) return;

    this.formGp = null;
    this.configData = null;
    this.selectedImporterType = null;

    this.processTypeIsLoading = true;

    // timeout is useful to let the page refresh to the is recreated even if
    // the observable finished quickly
    setTimeout(() => this.typingService.getTyping(importerTypingName).subscribe({
      next: importer => this.selectImporter(importer),
      error: () => this.processTypeIsLoading = false
    }), 0);
  }


  selectImporter(importer: LabProcessType): void {
    this.processTypeIsLoading = false;

    this.selectedImporterType = importer;
    this.configData = LabConfig.fromSpecs(importer.configSpecs);
    this.formGp = LabConfigureSpecsFormComponent.buildFormGroup(this.configData);
  }

  get showNoConfigMessage(): boolean {
    return this.selectedImporterType && !this.selectedImporterType.hasConfigSpecs();
  }

  submit(): void {
    if (this.callIsLoading) return;
    if (this.formGp.valid) {
      const value: PrConfigValues = {...this.formGp.value.public, ...this.formGp.value.protected};
      this.callImport(value);
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

  private callImport(configValue: PrConfigValues): void {
    this.callIsLoading = true;
    this.resourceService.callImporter(this.input.resourceId, this.selectedImporterType.typingName, configValue)
      .subscribe({
        next: resource => this.callImportSuccess(resource),
        error: () => this.callIsLoading = false
      });
  }

  private callImportSuccess(resource: LabResource): void {
    this.snackBarService.openSuccessMessage({text: 'biox.resource_imported', translateText: true});
    this.routerService.navigateToResourceDetail(resource.id);
    this.dialogRef.close();
  }


  // get default importer typing name based on file extension
  private getDefaultImporterTypingName(extension: string): string | null {
    if (['csv', 'tsv', 'xls', 'xlsx'].includes(extension)) {
      return TdTypingName.importer.tableImporter;
    } else if (extension === 'json') {
      return TdTypingName.importer.jsonImporter;
    } else if (extension === 'txt') {
      return TdTypingName.importer.textImporter;
    }

    return null;
  }


  ngOnDestroy(): void {
    // on dialog close, close the overlay ref
    this.detailOverlayRef?.dispose();
  }


}
