import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {TranslationLoader} from './translation-loader';
import {MissingTranslationHandler, TranslateLoader, TranslateModule, TranslatePipe} from '@ngx-translate/core';
import {MissingTranslationLogService} from './service/missing-translation-log.service';
import {CoreTranslateService} from './service/core-translate.service';
import {CORE_TRANSLATE_MODULE_CONFIG, TranslateModuleConfig} from './model/translate-module-config';
import {CookieService} from 'ngx-cookie-service';

// AoT requires an exported function for factories
// load the translations
export function TranslationLoaderFactory(http: HttpClient, config: TranslateModuleConfig): TranslationLoader {
  return new TranslationLoader(http, config.filenames, config.filePrefix, config.fileSuffix);
}

// init the translation
export function initTranslateService(service: CoreTranslateService): () => void {
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
    TranslateModule,
  ]
})
export class CoreTranslateModule {

  /**
   * Call this method only once on the AppModule
   *
   * Both forRoot method
   * For root method to export TranslateModule
   */
  public static forRoot(config: TranslateModuleConfig): ModuleWithProviders<CoreTranslateModule> {
    return {
      ngModule: CoreTranslateModule,
      providers: [
        CookieService,
        {provide: CORE_TRANSLATE_MODULE_CONFIG, useValue: config},
        CoreTranslateService,
        MissingTranslationLogService,
        // Init the translate service
        {
          provide: APP_INITIALIZER, useFactory: initTranslateService,
          deps: [CoreTranslateService], multi: true,
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
  public static forRoot2(): ModuleWithProviders<CoreTranslateModule> {
    return TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: TranslationLoaderFactory,
        deps: [HttpClient, CORE_TRANSLATE_MODULE_CONFIG]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useExisting: MissingTranslationLogService
      },
    });
  }
}
