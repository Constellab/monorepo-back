import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, Injector, NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {MainModule} from './main/main.module';
import {CoreModule} from './core/core.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
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
  FlTagModule,
  FlThemeService,
  FlTranslateModule
} from '@monorepo/front-core-lib';
import {svgIcons} from './core/utils/svg-icon-config';
import {QuillModule} from 'ngx-quill';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {LoginModule} from './login/login.module';
import {AuthenticationService} from './core/service/authentication.service';
import {ApiErrorService} from './core/service/api-error.service';
import {LabEnvStore} from './core/service/lab-env.store';
import {ApiServiceConfig} from './core/service/api-module.config';
import {AppRoutingModule} from './app-routing.module';
import {BioxTagService} from './core/entity-service/biox-tag.service';


function loadTokenFromLocalStorage(jwtManager: LabEnvStore): () => void {
  return (): void => jwtManager.loadTokenFromLocalStorage();
}


function loadThemeOnInit(themeService: FlThemeService): () => void {
  return (): void => themeService.init();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // other app modules
    MainModule,
    LoginModule,

    // Core module
    CoreModule,

    FlApiModule.forRoot(ApiServiceConfig, ApiErrorService),

    // Fl setup modules
    // Setup translate module
    FlTranslateModule.forRoot({
      defaultLang: ClSupportedLanguage.en,
      availableLang: [ClSupportedLanguage.en],
      filenames: ['global-', 'biox-', 'biota-', 'file-explorer-', 'monitoring-']
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
    FlTagModule.forRoot(BioxTagService),

    QuillModule.forRoot({
      modules: {
        toolbar: FlQuillConfig.defaultToolbarConfig,
      },
    }),

    AppRoutingModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER, useFactory: loadTokenFromLocalStorage,
      deps: [LabEnvStore],
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
