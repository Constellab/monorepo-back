import {ModuleWithProviders, NgModule, Provider, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlUserProfilePictureComponent} from './component/fl-user-profile-picture/fl-user-profile-picture.component';
import {FlUserConfig} from './service/fl-user-config.config';
import {FlUserInlineComponent} from './component/fl-user-inline/fl-user-inline.component';
import {FlUserWithDateComponent} from './component/fl-user-with-date/fl-user-with-date.component';
import {
  FlUserMouseHoverPortalDirective
} from './directive/fl-user-mouse-hover-portal/fl-user-mouse-hover-portal.directive';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FlUserInfoPortalComponent} from './component/fl-user-info-portal/fl-user-info-portal.component';
import {FlTextIconModule} from '../fl-text-icon/fl-text-icon.module';
import {MatIconModule} from '@angular/material/icon';
import {RouterModule} from '@angular/router';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {FlDateModule} from '../fl-date/fl-date.module';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flUserI18n} from './fl-user.i18n';


@NgModule({
  declarations: [
    FlUserProfilePictureComponent,
    FlUserInlineComponent,
    FlUserWithDateComponent,
    FlUserMouseHoverPortalDirective,
    FlUserInfoPortalComponent
  ],
  exports: [
    FlUserProfilePictureComponent,
    FlUserInlineComponent,
    FlUserWithDateComponent,
    FlUserMouseHoverPortalDirective,
    FlUserInfoPortalComponent
  ],
  imports: [
    CommonModule,
    RouterModule,

    MatIconModule,
    MatButtonModule,
    FlexLayoutModule,

    FlTextIconModule,
    FlTranslateModule,
    FlDateModule,
  ]
})
export class FlUserModule {

  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlUserModule', flUserI18n);
  }

  public static forRoot(apiServiceConfig: Type<FlUserConfig>): ModuleWithProviders<FlUserModule> {

    const providers: Provider[] = [
      {provide: FlUserConfig, useClass: apiServiceConfig}
    ];

    return {
      ngModule: FlUserModule,
      providers: providers
    };
  }
}
