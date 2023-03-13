import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {FlBreadcrumbComponent} from './component/fl-breadcrumb/fl-breadcrumb.component';
import {RouterModule} from '@angular/router';
import {FlLimitHeightComponent} from './component/fl-limit-height/fl-limit-height.component';
import {FlNewWebsiteVersionComponent} from './component/fl-new-website-version/fl-new-website-version.component';
import {FlChipComponent} from './component/fl-chip/fl-chip.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {FlCoreDirectiveModule} from '../fl-core-directive/fl-core-directive.module';
import {FlCorePipeModule} from '../fl-core-pipe/fl-core-pipe.module';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {
  FlSelectLanguageOptionsComponent
} from './component/fl-select-language-options/fl-select-language-options.component';
import {MatLegacyOptionModule as MatOptionModule} from '@angular/material/legacy-core';
import {FlExternalLinkComponent} from './component/fl-external-link/fl-external-link.component';
import {
  FlSelectUserCategoryOptionComponent
} from './component/fl-select-user-category-option/fl-select-user-category-option.component';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flCoreComponentI18n} from './i18n/fl-core-component.i18n';
import {FlErrorTextComponent} from './component/fl-error-text/fl-error-text.component';
import {FlPinUnpinButtonComponent} from './component/fl-pin-unpin-button/fl-pin-unpin-button.component';

/**
 * Core modules containing components
 */
@NgModule({
  declarations: [
    FlBreadcrumbComponent,
    FlLimitHeightComponent,
    FlNewWebsiteVersionComponent,
    FlChipComponent,
    FlSelectLanguageOptionsComponent,
    FlExternalLinkComponent,
    FlSelectUserCategoryOptionComponent,
    FlErrorTextComponent,
    FlPinUnpinButtonComponent,
  ],
  exports: [
    FlBreadcrumbComponent,
    FlLimitHeightComponent,
    FlChipComponent,
    FlSelectLanguageOptionsComponent,
    FlExternalLinkComponent,
    FlSelectUserCategoryOptionComponent,
    FlErrorTextComponent,
    FlPinUnpinButtonComponent,
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

  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlCoreComponentModule', flCoreComponentI18n);
  }
}
