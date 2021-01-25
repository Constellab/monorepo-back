import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FL_API_MODULE_CONFIG, FlApiErrorService, FlApiModuleConfig} from './model/fl-api-module.config.class';
import {FlApiService} from './service/fl-api.service';
import {FlApiWithCacheService} from './service/fl-api-with-cache.service';

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

  public static forRoot(config: FlApiModuleConfig): ModuleWithProviders<FlApiModule> {
    return {
      ngModule: FlApiModule,
      providers: [
        FlApiService,
        FlApiWithCacheService,

        // provide the config
        {provide: FL_API_MODULE_CONFIG, useValue: config},
        {provide: FlApiErrorService, useClass: config.errorApiService}
      ]
    };
  }
}
