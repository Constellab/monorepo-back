import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CoreModule} from './core/core.module';
import {LoginModule} from './login/login.module';
import {MainModule} from './main/main.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {APP_CONFIG, AppConfig} from './core/model/config/app-config';
import {environment} from '../environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {QuillModule} from 'ngx-quill';
import {ServiceWorkerModule} from '@angular/service-worker';
import {
  FlSnackBarModule,
  FlHttpInterceptorService,
  FlQuillConfig,
  FlServiceWorkerService,
  FlSvgIconModule,
  FlThemeService,
  FlTranslateModule, FlDialogModule
} from '@monorepo/front-core-lib';
import {svgIcons} from './core/model/config/svg-icon-config';

const appConfig: AppConfig = {
  apiUrl: environment.apiUrl,
  loginRoute: '/login',
  defaultApiErrorDuration: 3000
};

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

    // Setup translate module
    FlTranslateModule.forRoot({
      defaultLang: 'en',
      availableLang: ['en'],
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

    QuillModule.forRoot({
      modules: {
        toolbar: FlQuillConfig.defaultToolbarConfig,
      },
    }),

    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
  ],
  providers: [
    {provide: APP_CONFIG, useValue: appConfig},
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
}
