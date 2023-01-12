import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlPortalActionsComponent} from './component/fl-portal-actions/fl-portal-actions.component';
import {FlPortalActionLineComponent} from './component/fl-portal-action-line/fl-portal-action-line.component';
import {FlPortalModule} from '../fl-portal/fl-portal.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MatIconModule} from '@angular/material/icon';
import {FlLoaderModule} from '../fl-loader/fl-loader.module';
import {FlPortalActionsService} from './service/fl-portal-actions.service';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {FlPortalActionsState} from './service/fl-portal-actions.state';
import {MatDividerModule} from '@angular/material/divider';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flPortalActionI18n} from './i18n/fl-portal-action.i18n';
import {RouterModule} from '@angular/router';


@NgModule({
  declarations: [
    FlPortalActionsComponent,
    FlPortalActionLineComponent,
  ],
  exports: [
    FlPortalActionsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,

    FlexLayoutModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatTooltipModule,

    FlPortalModule,
    FlLoaderModule,
    FlTranslateModule,
  ]
})
export class FlPortalActionsModule {
  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlPortalActionsModule', flPortalActionI18n);
  }

  public static forRoot(): ModuleWithProviders<FlPortalActionsModule> {
    return {
      ngModule: FlPortalActionsModule,
      providers: [FlPortalActionsService, FlPortalActionsState]
    };
  }
}
