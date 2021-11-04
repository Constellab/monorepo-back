import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlTagInputComponent} from './component/fl-tag-input/fl-tag-input.component';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';


@NgModule({
  declarations: [
    FlTagInputComponent
  ],
  exports: [
    FlTagInputComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
  ],
})
export class FlTagModule {
}
