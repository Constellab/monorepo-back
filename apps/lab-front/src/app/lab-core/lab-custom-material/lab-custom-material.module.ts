import {NgModule} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {MatLegacyDialogModule as MatDialogModule} from '@angular/material/legacy-dialog';
import {MatIconModule} from '@angular/material/icon';
import {
  MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS as MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatLegacyTooltipModule as MatTooltipModule
} from '@angular/material/legacy-tooltip';
import {DateAdapter, MAT_DATE_FORMATS, MatRippleModule} from '@angular/material/core';
import {FlLuxonDateAdapter, flLuxonDateFormat, flMatFormFieldConfig, flTooltipConfig} from '@monorepo/front-core-lib';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatLegacyTableModule as MatTableModule} from '@angular/material/legacy-table';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {
  MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS as MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatLegacyFormFieldModule as MatFormFieldModule
} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatDividerModule} from '@angular/material/divider';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {MatTreeModule} from '@angular/material/tree';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatLegacySlideToggleModule as MatSlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatLegacyRadioModule as MatRadioModule} from '@angular/material/legacy-radio';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';

/**
 * Regrouped all the needed import for this app from material
 *
 * All the module should be in export
 */
@NgModule({
  exports: [
    MatButtonModule,
    MatSnackBarModule,
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    MatToolbarModule,
    MatTableModule,
    MatTabsModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatSidenavModule,
    MatExpansionModule,
    MatDividerModule,
    MatListModule,
    MatTreeModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatRadioModule,
    MatGridListModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatRippleModule,

    DragDropModule,

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
export class LabCustomMaterialModule {
}
