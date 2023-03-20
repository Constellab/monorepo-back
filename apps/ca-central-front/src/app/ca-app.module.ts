import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, Injector, NgModule} from '@angular/core';
import {CaAppRoutingModule} from './ca-app-routing.module';
import {CaAppComponent} from './ca-app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CaCoreModule} from './ca-core/ca-core.module';
import {CaLoginModule} from './ca-login/ca-login.module';
import {CaMainModule} from './ca-main/ca-main.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';
import {
  FlApiModule,
  FlAuthModule,
  FlBioNetworkModule,
  FlDialogModule,
  FlHttpInterceptorService,
  FlIconModule,
  FlPortalActionsModule,
  FlPortalModule,
  flSetRootInjector,
  FlSnackBarModule,
  FlTextEditorModule,
  FlThemeService,
  FlTranslateModule,
  FlUserModule
} from '@monorepo/front-core-lib';
import {caSvgIcons} from './ca-core/model/config/ca-svg-icon-config';
import {CaApiServiceConfig} from './ca-core/model/config/ca-api-module.config';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {CaAuthService} from './ca-login/service/ca-auth.service';
import {CaUserAccountsService} from './ca-core/service-api/ca-user-accounts.service';
import {CaApiErrorService} from './ca-core/service/ca-api-error.service';
import {rvDefaultViewTypeInfos, RvResourceViewModule} from '@monorepo/resource-view';
import {CaReportContentViewBlot} from './ca-project/module/ca-report-core/model/ca-report-content-view.class';
import {
  CaReportContentViewComponent
} from './ca-project/module/ca-report-core/component/ca-report-content-view/ca-report-content-view.component';
import {TdTechnicalDocModule} from '@monorepo/technical-doc';
import {CaTdServiceConfig} from './ca-core/model/config/ca-td-service.config';
import {PrProtocolModule} from '@monorepo/protocol';
import {CaUserConfig} from './ca-core/model/config/ca-user-config.service';
import {CaSpaceInterceptor} from './ca-core/interceptor/ca-space-interceptor.service';

function loadThemeOnInit(themeService: FlThemeService): () => void {
  return (): void => themeService.init();
}

@NgModule({
  declarations: [
    CaAppComponent
  ],
  imports: [
    BrowserModule,
    CaAppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // Other modules
    CaLoginModule,
    CaMainModule,

    // Core Modules
    CaCoreModule,

    PrProtocolModule.forRoot(),

    FlApiModule.forRoot(CaApiServiceConfig, CaApiErrorService, 'front-errors'),

    // Setup translate module
    FlTranslateModule.forRoot({
      defaultLang: ClSupportedLanguage.en,
      availableLang: [ClSupportedLanguage.en, ClSupportedLanguage.fr],
      filenames: ['ca-global-', 'ca-dashboard-', 'ca-settings-', 'ca-server-info-', 'ca-lab-', 'ca-smart-db-']
    }),
    FlTranslateModule.forRoot2(),

    // configuration of Front library
    FlIconModule.forRoot({
      iconFolder: 'assets/fl-mat-icons/',
      iconsToRegister: caSvgIcons
    }),
    FlDialogModule.forRoot(),
    FlSnackBarModule.forRoot(),
    FlPortalModule.forRoot(),
    FlAuthModule.forRoot(CaAuthService, CaUserAccountsService),
    FlPortalActionsModule.forRoot(),
    FlTextEditorModule.forRoot({
      blots: [
        {blot: CaReportContentViewBlot, componentType: CaReportContentViewComponent}
      ]
    }),

    FlUserModule.forRoot(CaUserConfig),

    RvResourceViewModule.forRoot({availableViews: rvDefaultViewTypeInfos}),
    FlBioNetworkModule.forRoot(),

    TdTechnicalDocModule.forRoot(CaTdServiceConfig),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FlHttpInterceptorService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CaSpaceInterceptor,
      multi: true
    },
    {provide: APP_INITIALIZER, useFactory: loadThemeOnInit, deps: [FlThemeService], multi: true},
    CookieService,
  ],
  bootstrap: [CaAppComponent]
})
export class CaAppModule {
  constructor(injector: Injector) {
    // set the root injector in a variable
    flSetRootInjector(injector);
  }
}
