import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlSnackBarInfoComponent} from './component/fl-snack-bar-info/fl-snack-bar-info.component';
import {FlPortalArrowComponent} from './component/fl-portal-arrow/fl-portal-arrow.component';
import {FlTooltipComponent} from './component/fl-tooltip/fl-tooltip.component';
import {FlDateRangeComponent} from './component/fl-date-range/fl-date-range.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlBreadcrumbComponent} from './component/fl-breadcrumb/fl-breadcrumb.component';
import {RouterModule} from '@angular/router';
import {FlLimitHeightComponent} from './component/fl-limit-height/fl-limit-height.component';
import {FlNewWebsiteVersionComponent} from './component/fl-new-website-version/fl-new-website-version.component';
import {FlChipComponent} from './component/fl-chip/fl-chip.component';
import {FlPaginationLoadMoreResultComponent} from './component/fl-pagination-load-more-result/fl-pagination-load-more-result.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    FlSnackBarInfoComponent,
    FlPortalArrowComponent,
    FlTooltipComponent,
    FlDateRangeComponent,
    FlBreadcrumbComponent,
    FlLimitHeightComponent,
    FlNewWebsiteVersionComponent,
    FlChipComponent,
    FlPaginationLoadMoreResultComponent,
  ],
  exports: [
    FlDateRangeComponent,
    FlBreadcrumbComponent,
    FlLimitHeightComponent,
    FlChipComponent,
    FlPaginationLoadMoreResultComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    FlLoaderModule,
    FlTranslateModule,
    FlCorePipeModule,
    FlCoreDirectiveModule,

    // Material
    FlexLayoutModule,
    MatTooltipModule,
    MatIconModule,
    MatButtonModule,
  ]
})
export class FlCoreComponentModule {
}
