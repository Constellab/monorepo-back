import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlInfiniteScrollComponent} from './component/fl-infinite-scroll/fl-infinite-scroll.component';
import {FlInfiniteScrollDirective} from './directive/fl-infinite-scroll/fl-infinite-scroll.directive';
import {
  FlInfiniteLoadMoreResultComponent
} from './component/fl-infinite-load-more-result/fl-infinite-load-more-result.component';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {
  FlInfiniteTableContainerComponent
} from './component/fl-infinite-table-container/fl-infinite-table-container.component';


@NgModule({
  declarations: [
    FlInfiniteScrollDirective,
    FlInfiniteScrollComponent,
    FlInfiniteLoadMoreResultComponent,
    FlInfiniteTableContainerComponent,
  ],
  exports: [
    FlInfiniteScrollDirective,
    FlInfiniteScrollComponent,
    FlInfiniteLoadMoreResultComponent,
    FlInfiniteTableContainerComponent,
  ],
  imports: [
    CommonModule,

    FlTranslateModule,
    FlLoaderModule,

    MatButtonModule,
    FlexLayoutModule,
    MatIconModule,
  ],
})
export class FlInfiniteScrollModule {
}
