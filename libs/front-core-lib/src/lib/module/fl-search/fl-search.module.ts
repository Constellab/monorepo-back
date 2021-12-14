import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlSearchComponent} from './component/fl-search/fl-search.component';
import {FlInfiniteScrollModule} from '../fl-inifite-scroll/fl-infinite-scroll.module';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatSidenavModule} from '@angular/material/sidenav';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlDrawerModule} from '../fl-drawer/fl-drawer.module';
import {FlSearchAdvancedFormComponent} from './component/fl-search-advanced-form/fl-search-advanced-form.component';
import {FlSearchHeaderComponent} from './component/fl-search-header/fl-search-header.component';
import {FlSearchResultComponent} from './component/fl-search-result/fl-search-result.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flSearchI18n} from './i18n/fl-search.i18n';
import {FlFormInputsManagerModule} from '../fl-form-inputs-manager/fl-form-inputs-manager.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlSearchSavedListComponent} from './component/fl-search-saved-list/fl-search-saved-list.component';
import {FlSearchDateIntervalComponent} from './component/fl-search-date-interval/fl-search-date-interval.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatDatepickerModule} from '@angular/material/datepicker';


@NgModule({
  declarations: [
    FlSearchComponent,
    FlSearchAdvancedFormComponent,
    FlSearchHeaderComponent,
    FlSearchResultComponent,
    FlSearchSavedListComponent,
    FlSearchDateIntervalComponent,
  ],
  exports: [
    FlSearchComponent,
    FlSearchAdvancedFormComponent,
    FlSearchHeaderComponent,
    FlSearchResultComponent,
    FlSearchSavedListComponent,
    FlSearchDateIntervalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    FlexLayoutModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,


    FlInfiniteScrollModule,
    FlLoaderModule,
    FlDrawerModule,
    FlTranslateModule,
    FlFormInputsManagerModule,
  ],
})
export class FlSearchModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlSearchModule', flSearchI18n);
  }

}
