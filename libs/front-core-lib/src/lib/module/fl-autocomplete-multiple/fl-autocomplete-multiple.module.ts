import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlAutocompleteMultipleComponent} from './fl-autocomplete-multiple/fl-autocomplete-multiple.component';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';

/**
 * Module for the {@link FlAutocompleteMultipleComponent}. It is an autocomplete that supported multiple selected choices
 */
@NgModule({
  declarations: [
    FlAutocompleteMultipleComponent
  ],
  imports: [
    CommonModule,

    FlCoreDirectiveModule,

    MatChipsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatIconModule,
  ],
  exports: [
    FlAutocompleteMultipleComponent
  ]
})
export class FlAutocompleteMultipleModule {
}
