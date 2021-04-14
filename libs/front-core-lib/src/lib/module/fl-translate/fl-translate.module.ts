import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {FlTranslationLoader} from './fl-translation-loader';
import {MissingTranslationHandler, TranslateLoader, TranslateModule, TranslatePipe} from '@ngx-translate/core';
import {FlMissingTranslationLogService} from './service/fl-missing-translation-log.service';
import {FlTranslateService} from './service/fl-translate.service';
import {FL_TRANSLATE_MODULE_CONFIG, FlTranslateModuleConfig} from './model/fl-translate-module-config';
import {CookieService} from 'ngx-cookie-service';

// AoT requires an exported function for factories
// load the translations
export function TranslationLoaderFactory(http: HttpClient, config: FlTranslateModuleConfig): FlTranslationLoader {
  return new FlTranslationLoader(http, config.filenames, config.filePrefix, config.fileSuffix);
}

// init the translation
export function initTranslateService(service: FlTranslateService): () => void {
  // use a local variable otherwise the ng package build failed
  // noinspection UnnecessaryLocalVariableJS
  const func = (): void => service.init();
  return func;
}


@NgModule({
  declarations: [],
  exports: [
    TranslatePipe,
  ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
  ]
})
export class FlTranslateModule {

  /**
   * Call this method only once on the AppModule
   *
   * Both forRoot method
   * For root method to export TranslateModule
   */
  public static forRoot(config: FlTranslateModuleConfig): ModuleWithProviders<FlTranslateModule> {
    return {
      ngModule: FlTranslateModule,
      providers: [
        CookieService,
        {provide: FL_TRANSLATE_MODULE_CONFIG, useValue: config},
        FlTranslateService,
        FlMissingTranslationLogService,
        // Init the translate service
        {
          provide: APP_INITIALIZER, useFactory: initTranslateService,
          deps: [FlTranslateService], multi: true,
        },
      ]
    };
  }

  /**
   * Call this method only once on the AppModule
   *
   * Both forRoot method
   * For root method to export TranslateModule
   */
  public static forRoot2(): ModuleWithProviders<FlTranslateModule> {
    return TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslationLoaderFactory,
        deps: [HttpClient, FL_TRANSLATE_MODULE_CONFIG]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: FlMissingTranslationLogService
      },
      // useful, this init translation even if translate object is not null
      extend: true
    });
  }
}
