import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CoreModule} from './core/core.module';
import {LoginModule} from './login/login.module';
import {MainModule} from './main/main.module';
import {CoreTranslateModule} from './core/module/translate/core-translate.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {APP_CONFIG, AppConfig} from './core/model/config/app-config';
import {environment} from '../environments/environment';
import {CookieService} from 'ngx-cookie-service';
import {HttpInterceptorService} from './core/service/http-interceptor.service';
import {ThemeService} from './core/service/theme.service';
import {QuillConfig} from './core/model/config/quill-config';
import {QuillModule} from 'ngx-quill';
import {ServiceWorkerModule} from '@angular/service-worker';
import {IconRegistryService} from './core/service/icon-registry.service';
import {ServiceWorkerService} from './core/service/service-worker.service';

const appConfig: AppConfig = {
  apiUrl: environment.apiUrl,
  loginRoute: '/login',
  defaultApiErrorDuration: 3000
};

function loadThemeOnInit(themeService: ThemeService): () => void {
  return () => themeService.init();
}

function registerCustomIcon(iconRegistryService: IconRegistryService): () => void {
  return () => iconRegistryService.registerCustomIcons();
}

function checkSWWebsiteVersion(swService: ServiceWorkerService): () => void {
  return () => swService.checkForNewVersion();
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
    CoreTranslateModule.forRoot({
      defaultLang: 'en',
      availableLang: ['en'],
      filenames: ['global-', 'dashboard-', 'settings-', 'server-info-', 'lab-']
    }),
    CoreTranslateModule.forRoot2(),

    QuillModule.forRoot({
      modules: {
        toolbar: QuillConfig.defaultToolbarConfig,
      },
    }),

    ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production}),
  ],
  providers: [
    {provide: APP_CONFIG, useValue: appConfig},
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true
    },
    {provide: APP_INITIALIZER, useFactory: loadThemeOnInit, deps: [ThemeService], multi: true},
    {provide: APP_INITIALIZER, useFactory: registerCustomIcon, deps: [IconRegistryService], multi: true},
    {provide: APP_INITIALIZER, useFactory: checkSWWebsiteVersion, deps: [ServiceWorkerService], multi: true},
    CookieService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
