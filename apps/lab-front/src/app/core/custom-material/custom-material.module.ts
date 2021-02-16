import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipModule} from '@angular/material/tooltip';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {FlLuxonDateAdapter, flLuxonDateFormat} from '@monorepo/front-core-lib';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatMenuModule} from '@angular/material/menu';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

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
    {provide: DateAdapter, useExisting: FlLuxonDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: flLuxonDateFormat},
  ]
})
export class CustomMaterialModule {
}
