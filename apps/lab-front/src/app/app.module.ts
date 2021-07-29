import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, Injector, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {MainModule} from './main/main.module';
import {CoreModule} from './core/core.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {
  FlApiModule,
  FlAuthModule,
  FlDialogModule,
  FlPortalActionsModule,
  FlPortalModule,
  FlQuillConfig,
  flSetRootInjector,
  FlSnackBarModule,
  FlSvgIconModule,
  FlThemeService,
  FlTranslateModule
} from '@monorepo/front-core-lib';
import {svgIcons} from './core/utils/svg-icon-config';
import {apiModuleConfig} from './core/utils/api-module.config';
import {QuillModule} from 'ngx-quill';
import {AuthenticationInterceptor} from './core/service/authentication.interceptor';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {LoginModule} from './login/login.module';
import {AuthenticationService} from './core/service/authentication.service';
import {ApiErrorService} from './core/service/api-error.service';
import {JwtManagerService} from './core/service/jwt-manager.service';


function loadTokenFromLocalStorage(jwtManager: JwtManagerService): () => void {
  return (): void => jwtManager.loadTokenFromLocalStorage();
}


function loadThemeOnInit(themeService: FlThemeService): () => void {
  return (): void => themeService.init();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot([], {initialNavigation: 'enabled'}),
    BrowserAnimationsModule,
    HttpClientModule,

    // other app modules
    MainModule,
    LoginModule,

    // Core module
    CoreModule,

    FlApiModule.forRoot(apiModuleConfig, ApiErrorService),

    // Fl setup modules
    // Setup translate module
    FlTranslateModule.forRoot({
      defaultLang: ClSupportedLanguage.en,
      availableLang: [ClSupportedLanguage.en],
      filenames: ['global-', 'biox-', 'biota-', 'file-explorer-']
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
    FlPortalActionsModule.forRoot(),
    FlAuthModule.forRoot(AuthenticationService),

    QuillModule.forRoot({
      modules: {
        toolbar: FlQuillConfig.defaultToolbarConfig,
      },
    }),
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useExisting: AuthenticationInterceptor, multi: true},
    {
      provide: APP_INITIALIZER, useFactory: loadTokenFromLocalStorage,
      deps: [JwtManagerService, AuthenticationInterceptor],
      multi: true
    },
    {provide: APP_INITIALIZER, useFactory: loadThemeOnInit, deps: [FlThemeService], multi: true},
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(injector: Injector) {
    // set the root injector in a variable
    flSetRootInjector(injector);
  }
}
