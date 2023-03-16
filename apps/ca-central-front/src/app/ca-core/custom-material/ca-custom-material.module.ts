import {NgModule} from '@angular/core';
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from '@angular/material/form-field';
import {MatTreeModule} from '@angular/material/tree';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';
import {DateAdapter, MAT_DATE_FORMATS, MatRippleModule} from '@angular/material/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {FlLuxonDateAdapter, flLuxonDateFormat, flMatFormFieldConfig, flTooltipConfig} from '@monorepo/front-core-lib';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatMenuModule} from '@angular/material/menu';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule} from '@angular/material/tooltip';
import {MatTableModule} from '@angular/material/table';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatRadioModule} from '@angular/material/radio';
import {MatChipsModule} from '@angular/material/chips';
import {MatDialogModule} from '@angular/material/dialog';
import {MatDividerModule} from '@angular/material/divider';
import {FlexLayoutModule} from '@angular/flex-layout';


/**
 * Regrouped all the needed import from material
 *
 * All the module should be in export
 */
@NgModule({
  exports: [
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatTableModule,
    MatMenuModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSlideToggleModule,

    MatDialogModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatTooltipModule,
    MatTreeModule,

    MatRippleModule,
    FlexLayoutModule,
  ],
  providers: [
    // form field default config
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: flMatFormFieldConfig},

    // tooltip default config
    {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: flTooltipConfig},

    // configure the date picker to work with luxon
    {provide: DateAdapter, useExisting: FlLuxonDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: flLuxonDateFormat},
  ]
})
export class CaCustomMaterialModule {
}
