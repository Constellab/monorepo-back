import {NgModule} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatLegacyProgressSpinnerModule as MatProgressSpinnerModule} from '@angular/material/legacy-progress-spinner';
import {
  MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS as MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatLegacyFormFieldModule as MatFormFieldModule
} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {
  MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS as MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatLegacyTooltipModule as MatTooltipModule
} from '@angular/material/legacy-tooltip';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_FORMATS, MatRippleModule} from '@angular/material/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {FlLuxonDateAdapter, flLuxonDateFormat, flMatFormFieldConfig, flTooltipConfig} from '@monorepo/front-core-lib';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {MatTreeModule} from '@angular/material/tree';
import {MatLegacySlideToggleModule as MatSlideToggleModule} from '@angular/material/legacy-slide-toggle';


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
