import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, Injector, NgModule} from '@angular/core';
import {CaAppRoutingModule} from './ca-app-routing.module';
import {CaAppComponent} from './ca-app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CaCoreModule} from './ca-core/ca-core.module';
import {CaLoginModule} from './ca-login/ca-login.module';
import {CaMainModule} from './ca-main/ca-main.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {environment} from '../environments/ca-environment';
import {CookieService} from 'ngx-cookie-service';
import {ServiceWorkerModule} from '@angular/service-worker';
import {
  FlApiModule,
  FlAuthModule,
  FlDialogModule,
  FlHttpInterceptorService,
  FlIconModule,
  FlPortalActionsModule,
  FlPortalModule,
  FlServiceWorkerService,
  flSetRootInjector,
  FlSnackBarModule,
  FlTextEditorImageService,
  FlThemeService,
  FlTranslateModule
} from '@monorepo/front-core-lib';
import {caSvgIcons} from './ca-core/model/config/ca-svg-icon-config';
import {CaApiServiceConfig} from './ca-core/model/config/ca-api-module.config';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {CaAuthenticationService} from './ca-login/service/ca-authentication.service';
import {CaUserAccountsService} from './ca-core/service-api/ca-user-accounts.service';
import {CaApiErrorService} from './ca-core/service/ca-api-error.service';
import {CaReportService} from './ca-core/service-api/ca-report.service';


function loadThemeOnInit(themeService: FlThemeService): () => void {
  return (): void => themeService.init();
}


function checkSWWebsiteVersion(swService: FlServiceWorkerService): () => void {
  return (): void => swService.checkForNewVersion();
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
      iconFolder: 'assets/mat-icons/',
      iconsToRegister: caSvgIcons
    }),
    FlDialogModule.forRoot(),
    FlSnackBarModule.forRoot(),
    FlPortalModule.forRoot(),
    FlAuthModule.forRoot(CaAuthenticationService, CaUserAccountsService),
    FlPortalActionsModule.forRoot(),

    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FlHttpInterceptorService,
      multi: true
    },
    {provide: APP_INITIALIZER, useFactory: loadThemeOnInit, deps: [FlThemeService], multi: true},
    {provide: APP_INITIALIZER, useFactory: checkSWWebsiteVersion, deps: [FlServiceWorkerService], multi: true},
    {provide: FlTextEditorImageService, useExisting: CaReportService},
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
