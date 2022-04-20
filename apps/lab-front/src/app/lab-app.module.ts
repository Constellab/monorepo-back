import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, Injector, NgModule} from '@angular/core';

import {LabAppComponent} from './lab-app.component';
import {LabMainModule} from './lab-main/lab-main.module';
import {LabCoreModule} from './lab-core/lab-core.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {
  FlApiModule,
  FlAuthModule,
  FlDialogModule,
  FlHttpInterceptorService,
  FlIconModule,
  FlPortalActionsModule,
  FlPortalModule,
  flSetRootInjector,
  FlSnackBarModule,
  FlTagModule,
  FlTextEditorFigureBlot,
  FlTextEditorFigureComponent,
  FlTextEditorModule,
  FlThemeService,
  FlTranslateModule
} from '@monorepo/front-core-lib';
import {labSvgIcons} from './lab-core/utils/lab-svg-icon-config';
import {ClSupportedLanguage} from '@monorepo/core-lib';
import {LabLoginModule} from './lab-login/lab-login.module';
import {LabAuthenticationService} from './lab-core/service/lab-authentication.service';
import {LabApiErrorService} from './lab-core/service/lab-api-error.service';
import {LabApiServiceConfig} from './lab-core/service/lab-api-module.config';
import {LabAppRoutingModule} from './lab-app-routing.module';
import {LabTagService} from './lab-core/entity-service/lab-tag.service';
import {LabReportContentViewBlot} from './lab-report/module/lab-report-detail-page/lab-report-content-view.class';
import {
  LabReportContentViewComponent
} from './lab-report/module/lab-report-detail-page/component/lab-report-content-view/lab-report-content-view.component';


function loadThemeOnInit(themeService: FlThemeService): () => void {
  return (): void => themeService.init();
}

@NgModule({
  declarations: [LabAppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,

    // other app modules
    LabMainModule,
    LabLoginModule,

    // Core module
    LabCoreModule,

    FlApiModule.forRoot(LabApiServiceConfig, LabApiErrorService),

    // Fl setup modules
    // Setup translate module
    FlTranslateModule.forRoot({
      defaultLang: ClSupportedLanguage.en,
      availableLang: [ClSupportedLanguage.en],
      filenames: ['lab-global-', 'lab-biox-', 'lab-biota-', 'lab-databox-', 'lab-monitoring-']
    }),
    FlTranslateModule.forRoot2(),

    // configuration of Front library
    FlIconModule.forRoot({
      iconFolder: 'assets/mat-icons/',
      iconsToRegister: labSvgIcons
    }),

    FlDialogModule.forRoot(),
    FlSnackBarModule.forRoot(),
    FlPortalModule.forRoot(),
    FlPortalActionsModule.forRoot(),
    FlAuthModule.forRoot(LabAuthenticationService),
    FlTagModule.forRoot(LabTagService),
    FlTextEditorModule.forRoot({
      blots: [{blot: FlTextEditorFigureBlot, componentType: FlTextEditorFigureComponent},
        {blot: LabReportContentViewBlot, componentType: LabReportContentViewComponent}]
    }),

    LabAppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FlHttpInterceptorService,
      multi: true
    },
    {provide: APP_INITIALIZER, useFactory: loadThemeOnInit, deps: [FlThemeService], multi: true},
  ],
  bootstrap: [LabAppComponent],
})
export class LabAppModule {
  constructor(injector: Injector) {
    // set the root injector in a variable
    flSetRootInjector(injector);
  }
}
