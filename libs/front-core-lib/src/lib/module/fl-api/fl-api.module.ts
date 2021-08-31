import {ErrorHandler, ModuleWithProviders, NgModule, Provider, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlApiService} from './service/fl-api.service';
import {FlApiWithCacheService} from './service/fl-api-with-cache.service';
import {FL_ERROR_HANDLER_API, FlErrorHandlerApiService} from './service/fl-error-handler-api.service';
import {FlApiServiceConfig} from './service/fl-api-service.config';
import {FlApiErrorService} from './service/fl-api-error.service';
import {FlTranslateService} from '../fl-translate/service/fl-translate.service';
import {flApiI18n} from './i18n/fl-api.i18n';
import {FlTranslateModule} from '../fl-translate/fl-translate.module';

/**
 * Module to configure and get the Api Service
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule,

    FlTranslateModule,
  ]
})
export class FlApiModule {

  /**
   *
   * allow to load environment before settings the config
   * @param apiServiceConfig
   * @param errorApiService Class for the error service
   * @param logErrorApiRoute If this string is provided, the FlErrorHandlerApiService is activated and registered as a
   * ErrorHandler. TS errors will be catch by this class, logged to the console and send to the API in POST request
   */
  public static forRoot(apiServiceConfig: Type<FlApiServiceConfig>,
                        errorApiService: Type<FlApiErrorService>,
                        logErrorApiRoute?: string ): ModuleWithProviders<FlApiModule> {

    const providers: Provider[] = [
      FlApiService,
      FlApiWithCacheService,

      // provide the config
      {provide: FlApiServiceConfig, useClass: apiServiceConfig},
      {provide: FlApiErrorService, useClass: errorApiService}
    ];

    if (logErrorApiRoute != null) {
      // provide the config for the FlErrorHandlerApiService
      providers.push({provide: FL_ERROR_HANDLER_API, useValue: logErrorApiRoute});
      providers.push({provide: ErrorHandler, useClass: FlErrorHandlerApiService});
    }

    return {
      ngModule: FlApiModule,
      providers: providers
    };
  }

  constructor(translateService: FlTranslateService) {
    translateService.addModuleTranslation('FlApiModule', flApiI18n);
  }
}
