import {ModuleWithProviders, NgModule, Type} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FL_API_MODULE_CONFIG, FlApiErrorService, FlApiModuleConfig} from './model/fl-api-module.config.class';
import {FlApiService} from './service/fl-api.service';

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

  public static forRoot(config: FlApiModuleConfig,
                        errorApiService: Type<FlApiErrorService>): ModuleWithProviders<FlApiModule> {
    return {
      ngModule: FlApiModule,
      providers: [
        FlApiService,

        // provide the config
        {provide: FL_API_MODULE_CONFIG, useValue: config},
        {provide: FlApiErrorService, useClass: errorApiService}
      ]
    };
  }
}
