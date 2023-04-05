import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatOptionModule} from '@angular/material/core';
import {FlInfiniteScrollModule} from '../fl-inifite-scroll/fl-infinite-scroll.module';
import {FlInputSearchComponent} from './component/fl-input-search/fl-input-search.component';
import {FlInputSearchOptionDirective} from './directive/fl-input-search-option.directive';
import {ReactiveFormsModule} from '@angular/forms';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlInputSearchPrefixDirective} from './directive/fl-input-search-prefix.directive';

@NgModule({
  declarations: [
    FlInputSearchComponent,
    FlInputSearchOptionDirective,
    FlInputSearchPrefixDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatInputModule,
    MatAutocompleteModule,
    MatOptionModule,

    FlInfiniteScrollModule,
    FlLoaderModule,
  ],
  exports: [
    FlInputSearchComponent,
    FlInputSearchOptionDirective,
    FlInputSearchPrefixDirective
  ]
})
export class FlInputSearchModule { }
