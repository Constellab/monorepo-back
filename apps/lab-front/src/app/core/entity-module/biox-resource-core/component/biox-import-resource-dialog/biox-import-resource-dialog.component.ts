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
import {BioxResourceService} from '../../../../entity-service/biox-resource.service';
import {
  BioxConfigureSpecsForm,
  BioxConfigureSpecsFormComponent
} from '../../../biox-config-core/component/biox-configure-specs-form/biox-configure-specs-form.component';
import {BioxConfigData, BioxConfigValues} from '../../../../model/entities/biox-config.entity';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {FlFormHelper, FlSnackBarService} from '@monorepo/front-core-lib';
import {RouterService} from '../../../../service/router.service';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {BioxProcessType} from '../../../../model/entities/lab-type/biox-process-type.entity';
import {Validators} from '@angular/forms';
import {MatSelectChange} from '@angular/material/select';

export interface BioxImportResourceDialogInput {
  resourceId: string;
  resourceHumanName: string;
  resourceTypingName: string;
}

interface BioxImportResourceDialogForm {
  importer: BioxProcessType;
  config: BioxConfigureSpecsForm;
}

/**
 * Dialog to config a resource import and call import
 */
@Component({
  selector: 'gen-biox-import-resource-dialog',
  templateUrl: './biox-import-resource-dialog.component.html',
  styleUrls: ['./biox-import-resource-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxImportResourceDialogComponent implements OnInit {

  @ViewChild('viewContainer', {static: false, read: ViewContainerRef}) viewContainer: ViewContainerRef;

  importers: BioxProcessType[];

  formGp: FormGroup<BioxImportResourceDialogForm>;
  configData: BioxConfigData;

  getIsLoading: boolean = false;
  callIsLoading: boolean = false;

  resourceNoImportable: boolean = false;

  resourceHumanName: string;

  private viewComponentRef: ComponentRef<BioxConfigureSpecsFormComponent>;

  constructor(@Inject(MAT_DIALOG_DATA) private input: BioxImportResourceDialogInput,
              private dialogRef: MatDialogRef<BioxImportResourceDialogComponent>,
              private resourceService: BioxResourceService,
              private routerService: RouterService,
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

  private getImportersSuccess(importers: BioxProcessType[]): void {
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
    const importer: BioxProcessType = selection.value;
    this.configData = BioxConfigData.fromSpecs(importer.getConfigSpecs(), importer.getConfigSpecs().getDefaultConfig());
    this.formGp.setControl('config', BioxConfigureSpecsFormComponent.buildFormGroup(this.configData));
    this.formGp.updateValueAndValidity();

    // build the component manually for force it to reload
    this.viewComponentRef?.destroy();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(BioxConfigureSpecsFormComponent);
    this.viewComponentRef = this.viewContainer.createComponent(componentFactory);
    this.viewComponentRef.instance.bioxConfigData = this.configData;
  }

  get showNoConfigMessage(): boolean {
    return this.formGp.value.importer && !this.formGp.value.importer?.hasConfigSpecs();
  }

  submit(): void {
    if (this.callIsLoading) return;
    if (this.formGp.valid) {
      const value: BioxConfigValues = {...this.formGp.value.config.public, ...this.formGp.value.config.protected};
      this.callImport(this.formGp.value.importer, value);
    } else {
      FlFormHelper.markAllAsTouched(this.formGp);
    }
  }

  private callImport(importer: BioxProcessType, configValue: BioxConfigValues): void {
    this.callIsLoading = true;
    this.resourceService.callImporter(this.input.resourceId, importer.typingName, configValue).subscribe(
      resource => this.callImportSuccess(resource),
      () => {
        this.callIsLoading = false;
        this.cdr.markForCheck();
      }
    );
  }

  private callImportSuccess(resource: BioxResource): void {
    this.snackBarService.openSuccessMessage('biox.resource_imported', true);
    this.routerService.navigateToBioxResourceDetail(resource.id);
    this.dialogRef.close();
  }

}
