import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlDynamicFieldComponent} from './component/fl-dynamic-field/fl-dynamic-field.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlDynamicFormGroupComponent} from './component/fl-dynamic-form-group/fl-dynamic-form-group.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flDynamicFieldI18n} from './i18n/fl-dynamic-field.i18n';
import {FlMultiInputsComponent} from './component/fl-multi-inputs/fl-multi-inputs.component';
import {FlFormModule} from '../fl-form/fl-form.module';
import {FlDynamicFormArrayComponent} from './component/fl-dynamic-form-array/fl-dynamic-form-array.component';
import {FlDynamicAbstractFormComponent} from './component/fl-dynamic-abstract-form/fl-dynamic-abstract-form.component';
import {FlSectionModule} from '../fl-section/fl-section.module';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {FlDynamicFieldInputComponent} from './component/fl-dynamic-field-input/fl-dynamic-field-input.component';
import {FlDynamicFieldSelectComponent} from './component/fl-dynamic-field-select/fl-dynamic-field-select.component';
import {FlDynamicFieldBooleanComponent} from './component/fl-dynamic-field-boolean/fl-dynamic-field-boolean.component';
import {FlDynamicFieldListComponent} from './component/fl-dynamic-field-list/fl-dynamic-field-list.component';
import {
  FlDynamicFieldTextareaComponent
} from './component/fl-dynamic-field-textarea/fl-dynamic-field-textarea.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';


/**
 * Module for the {@link FlDynamicFieldComponent} to create dynamic form field input
 * based on a config
 */
@NgModule({
  declarations: [
    FlDynamicFieldComponent,
    FlDynamicFormGroupComponent,
    FlMultiInputsComponent,
    FlDynamicFormArrayComponent,
    FlDynamicAbstractFormComponent,
    FlDynamicFieldInputComponent,
    FlDynamicFieldSelectComponent,
    FlDynamicFieldBooleanComponent,
    FlDynamicFieldListComponent,
    FlDynamicFieldTextareaComponent,
  ],
  exports: [
    FlDynamicFieldComponent,
    FlDynamicFormGroupComponent,
    FlMultiInputsComponent,
    FlDynamicFormArrayComponent,
    FlDynamicAbstractFormComponent,
    FlDynamicFieldTextareaComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule,

    FlTranslateModule,
    FlCorePipeModule,
    FlFormModule,
    FlSectionModule,
  ],
})
export class FlDynamicFieldModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlDynamicFieldModule', flDynamicFieldI18n);
  }
}
