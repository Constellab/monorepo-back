import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatDialogModule} from '@angular/material/dialog';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatTableModule} from '@angular/material/table';
import {LuxonDateAdapter, luxonDateFormat} from '../model/config/luxon-date-adapter';


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

    MatDialogModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatTooltipModule,

    FlexLayoutModule,
  ],
  providers: [
    {
      // tooltip default config
      provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: {
        showDelay: 0,
        hideDelay: 0,
        touchendHideDelay: 0,
      },
    },

    // configure the date picker to work with luxon
    {provide: DateAdapter, useExisting: LuxonDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: luxonDateFormat},
  ]
})
export class CustomMaterialModule {
}
