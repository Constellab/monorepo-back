import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, Injector, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CoreModule} from './core/core.module';
import {LoginModule} from './login/login.module';
import {MainModule} from './main/main.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {environment} from '../environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {ServiceWorkerModule} from '@angular/service-worker';
import {
  FlApiModule,
  FlAuthModule,
  FlDialogModule,
  FlHttpInterceptorService,
  FlPortalModule,
  FlServiceWorkerService,
  flSetRootInjector,
  FlSnackBarModule,
  FlSvgIconModule,
  FlThemeService,
  FlTranslateModule
} from '@monorepo/front-core-lib';
import {svgIcons} from './core/model/config/svg-icon-config';
import {ApiServiceConfig} from './core/model/config/api-module.config';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {AuthenticationService} from './login/service/authentication.service';
import {UserAccountsService} from './core/service-api/user-accounts.service';
import {ApiErrorService} from './core/service/api-error.service';


function loadThemeOnInit(themeService: FlThemeService): () => void {
  return (): void => themeService.init();
}


function checkSWWebsiteVersion(swService: FlServiceWorkerService): () => void {
  return (): void => swService.checkForNewVersion();
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // Other modules
    LoginModule,
    MainModule,

    // Core Modules
    CoreModule,

    FlApiModule.forRoot(ApiServiceConfig, ApiErrorService, 'front-errors'),

    // Setup translate module
    FlTranslateModule.forRoot({
      defaultLang: ClSupportedLanguage.en,
      availableLang: [ClSupportedLanguage.en],
      filenames: ['global-', 'dashboard-', 'settings-', 'server-info-', 'lab-']
    }),
    FlTranslateModule.forRoot2(),

    // configuration of Front library
    FlSvgIconModule.forRoot({
      iconFolder: 'assets/mat-icons/',
      iconsToRegister: svgIcons
    }),
    FlDialogModule.forRoot(),
    FlSnackBarModule.forRoot(),
    FlPortalModule.forRoot(),
    FlAuthModule.forRoot(AuthenticationService, UserAccountsService),

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
    CookieService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(injector: Injector) {
    // set the root injector in a variable
    flSetRootInjector(injector);
  }
}
