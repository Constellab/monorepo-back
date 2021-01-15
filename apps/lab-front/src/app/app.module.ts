import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {MainModule} from './main/main.module';
import {CoreModule} from './core/core.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {FlApiModule, FlDialogModule, FlSnackBarModule, FlSvgIconModule, FlTranslateModule} from '@monorepo/front-core-lib';
import {svgIcons} from './core/utils/svg-icon-config';
import {apiModuleConfig} from './core/utils/api-module.config';

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
      defaultLang: 'en',
      availableLang: ['en'],
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
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}
