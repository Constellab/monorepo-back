import {NgModule} from '@angular/core';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {
  MAT_LEGACY_FORM_FIELD_DEFAULT_OPTIONS as MAT_FORM_FIELD_DEFAULT_OPTIONS,
  MatLegacyFormFieldModule as MatFormFieldModule
} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule as MatInputModule} from '@angular/material/legacy-input';
import {MatLegacyListModule as MatListModule} from '@angular/material/legacy-list';
import {RouterModule} from '@angular/router';
import {FlLuxonDateAdapter, flLuxonDateFormat, flMatFormFieldConfig} from '@monorepo/front-core-lib';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatTreeModule} from '@angular/material/tree';
import {MatLegacySelectModule as MatSelectModule} from '@angular/material/legacy-select';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatLegacyTabsModule as MatTabsModule} from '@angular/material/legacy-tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatLegacyMenuModule as MatMenuModule} from '@angular/material/legacy-menu';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatLegacyChipsModule as MatChipsModule} from '@angular/material/legacy-chips';
import {MatLegacyAutocompleteModule as MatAutocompleteModule} from '@angular/material/legacy-autocomplete';

@NgModule({
  exports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatSidenavModule,
    MatTreeModule,
    MatSelectModule,
    FlexLayoutModule,
    MatGridListModule,
    MatTabsModule,
    MatToolbarModule,
    MatMenuModule,
    DragDropModule,
    ScrollingModule,
    MatChipsModule,
    MatAutocompleteModule
  ],

  providers: [
    // form field default config
    {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: flMatFormFieldConfig},

    // configure the date picker to work with luxon
    {provide: DateAdapter, useExisting: FlLuxonDateAdapter},
    {provide: MAT_DATE_FORMATS, useValue: flLuxonDateFormat},
  ]
})
export class HaCustomMaterialModule {
}
