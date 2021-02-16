import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlDateRangeComponent} from './component/fl-date-range/fl-date-range.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlBreadcrumbComponent} from './component/fl-breadcrumb/fl-breadcrumb.component';
import {RouterModule} from '@angular/router';
import {FlLimitHeightComponent} from './component/fl-limit-height/fl-limit-height.component';
import {FlNewWebsiteVersionComponent} from './component/fl-new-website-version/fl-new-website-version.component';
import {FlChipComponent} from './component/fl-chip/fl-chip.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import { FlSelectLanguageOptionsComponent } from './component/fl-select-language-options/fl-select-language-options.component';
import {MatOptionModule} from '@angular/material/core';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    FlDateRangeComponent,
    FlBreadcrumbComponent,
    FlLimitHeightComponent,
    FlNewWebsiteVersionComponent,
    FlChipComponent,
    FlSelectLanguageOptionsComponent,
  ],
  exports: [
    FlDateRangeComponent,
    FlBreadcrumbComponent,
    FlLimitHeightComponent,
    FlChipComponent,
    FlSelectLanguageOptionsComponent,
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
    MatOptionModule,
  ]
})
export class FlCoreComponentModule {
}
