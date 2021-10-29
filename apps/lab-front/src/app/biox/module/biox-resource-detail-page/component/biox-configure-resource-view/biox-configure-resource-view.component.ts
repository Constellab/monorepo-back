import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {
  BioxResourceViewConfig,
  BioxResourceViewDisplayMode,
  BioxResourceViewSpecWithConfig,
  BioxResourceViewTypeInfo
} from '../../../../../core/model/entities/resource/biox-resource-view.entity';
import {Validators} from '@angular/forms';
import {BioxConfigData} from '../../../../../core/model/entities/biox-config.entity';

export interface BioxConfigureResourceViewInput {
  title: string;
  viewSpecConfig: BioxResourceViewSpecWithConfig;
  viewTypeInfo: BioxResourceViewTypeInfo;
}

export interface BioxConfigureResourceViewResult {
  viewConfig: BioxResourceViewConfig;
  displayMode: BioxResourceViewDisplayMode;
}

/**
 * Dialog to configure resource view spec
 */
@Component({
  selector: 'gen-biox-configure-resource-view',
  templateUrl: './biox-configure-resource-view.component.html',
  styleUrls: ['./biox-configure-resource-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxConfigureResourceViewComponent implements OnInit {

  formGp: FormGroup = new FormGroup({});

  configs: BioxConfigData;

  title: string;

  showDisplayModeControl: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) private input: BioxConfigureResourceViewInput,
              private dialogRef: MatDialogRef<BioxConfigureResourceViewComponent>) {
    this.title = input.title;
  }

  ngOnInit(): void {
    this.initFormGroup();
    this.initFormFieldConfig();
  }

  private initFormGroup(): void {
    this.formGp = new FormBuilder().group({
      displayMode: [this.input.viewSpecConfig.displayMode, Validators.required]
    });
    // don't show the button mode if the view type support only one mode
    this.showDisplayModeControl = !this.input.viewTypeInfo.forceDefaultDisplayMode;
  }

  private initFormFieldConfig(): void {
    const viewSpecConfig = this.input.viewSpecConfig;
    this.configs = BioxConfigData.fromSpecs(viewSpecConfig.viewSpec.specs, viewSpecConfig.viewConfig.configValues);
  }

  submit(): void {
    if (this.formGp.valid) {
      const viewConfig = this.convertFormValueToResult(this.formGp.getRawValue());
      this.dialogRef.close(viewConfig);
    }
  }

  private convertFormValueToResult(formValue: any): BioxConfigureResourceViewResult {
    return {
      viewConfig: new BioxResourceViewConfig({...formValue.public, ...formValue.protected}),
      displayMode: formValue.displayMode
    };
  }

}
