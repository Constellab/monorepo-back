import { NgModule } from "@angular/core";
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FlLuxonDateAdapter, flLuxonDateFormat, flMatFormFieldConfig } from '@monorepo/front-core-lib';

@NgModule({
    exports: [MatFormFieldModule, MatInputModule],
    providers: [
    // form field default config
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: flMatFormFieldConfig},

    // configure the date picker to work with luxon
    {provide: DateAdapter, useExisting: FlLuxonDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: flLuxonDateFormat},
    ]
})
export class DaCustomMaterialModule{}