import {ErrorHandler, ModuleWithProviders, NgModule, Provider, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FL_API_MODULE_CONFIG, FlApiErrorService, FlApiModuleConfig} from './model/fl-api-module.config.class';
import {FlApiService} from './service/fl-api.service';
import {FlApiWithCacheService} from './service/fl-api-with-cache.service';
import {FlErrorHandlerApiService} from './service/fl-error-handler-api.service';

/**
 * Module to configure and get the Api Service
 */
@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ]
})
export class FlApiModule {

  /**
   *
   * @param configFactory function to retrieve the config, using a factory
   * allow to load environment before settings the config
   * @param errorApiService Class for the error service
   */
  public static forRoot(configFactory: () => FlApiModuleConfig,
                        errorApiService: Type<FlApiErrorService>): ModuleWithProviders<FlApiModule> {

    const providers: Provider[] = [
      FlApiService,
      FlApiWithCacheService,

      // provide the config
      {provide: FL_API_MODULE_CONFIG, useFactory: configFactory},
      {provide: FlApiErrorService, useClass: errorApiService}
    ];

    if (configFactory().logErrorApiRoute != null) {
      providers.push(FlErrorHandlerApiService);
      providers.push({provide: ErrorHandler, useClass: FlErrorHandlerApiService});
    }

    return {
      ngModule: FlApiModule,
      providers: providers
    };
  }
}
