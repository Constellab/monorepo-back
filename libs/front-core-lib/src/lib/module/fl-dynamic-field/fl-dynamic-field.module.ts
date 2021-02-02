import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlDynamicFieldComponent } from './fl-dynamic-field/fl-dynamic-field.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import { FlDynamicFormComponent } from './fl-dynamic-form/fl-dynamic-form.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';


/**
 * Module for the {@link FlDynamicFieldComponent} to create dynamic form field input
 * based on a config
 */
@NgModule({
  declarations: [FlDynamicFieldComponent, FlDynamicFormComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FlexLayoutModule,

    FlTranslateModule,
    FlCorePipeModule,
  ],
  exports: [FlDynamicFieldComponent, FlDynamicFormComponent]
})
export class FlDynamicFieldModule { }
