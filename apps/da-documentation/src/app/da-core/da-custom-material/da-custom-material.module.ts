import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { FlLuxonDateAdapter, flLuxonDateFormat, flMatFormFieldConfig } from '@monorepo/front-core-lib';
import { QuillModule } from 'ngx-quill';

@NgModule({
    exports: [MatFormFieldModule, MatInputModule, MatButtonModule, QuillModule, RouterModule],
    providers: [
    // form field default config
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: flMatFormFieldConfig},

    // configure the date picker to work with luxon
    {provide: DateAdapter, useExisting: FlLuxonDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: flLuxonDateFormat},
    ]
})
export class DaCustomMaterialModule{}