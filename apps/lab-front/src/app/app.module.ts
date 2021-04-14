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
  FlDialogModule,
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
import {AuthenticatedUserService} from './core/service/authenticated-user.service';
import {ClSupportedLanguage} from '@monorepo/core-lib';

function loadTokenFromLocalStorage(authenticationService: AuthenticatedUserService): () => void {
  return (): void => authenticationService.loadTokenFromLocalStorage();
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

    // Core module
    CoreModule,

    FlApiModule.forRoot(apiModuleConfig),

    // Fl setup modules
    // Setup translate module
    FlTranslateModule.forRoot({
      defaultLang: ClSupportedLanguage.en,
      availableLang: [ClSupportedLanguage.en],
      filenames: ['global-', 'biox-', 'biota-']
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
      deps: [AuthenticatedUserService, AuthenticationInterceptor],
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
