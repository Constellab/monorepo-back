import { NgModule } from "@angular/core";
import {MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule} from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import {MatButtonModule} from '@angular/material/button';
import {RouterModule} from '@angular/router';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import { MatSidenavModule } from "@angular/material/sidenav";
import {MatTreeModule} from '@angular/material/tree';
import {MatSelectModule} from '@angular/material/select';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatMenuModule} from '@angular/material/menu';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {FlLuxonDateAdapter, flLuxonDateFormat, flMatFormFieldConfig} from '@monorepo/front-core-lib';
import {DateAdapter, MAT_DATE_FORMATS} from '@angular/material/core';
import {MatTableModule} from '@angular/material/table';
import {MatRadioModule} from '@angular/material/radio';

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
    MatAutocompleteModule,
    MatTableModule,
    MatRadioModule,
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
