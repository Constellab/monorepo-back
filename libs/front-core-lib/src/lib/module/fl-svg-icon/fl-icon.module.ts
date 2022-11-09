import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlIconDirective} from './fl-icon/fl-icon.directive';
import {FlIconRegistryService} from './fl-icon-registry.service';
import {FL_ICON_MODULE, FlIconConfig} from './fl-icon-config.class';

function initIcons(iconRegistryService: FlIconRegistryService): () => void {
  return (): void => iconRegistryService.initIcons();
}

/**
 * Module to handle svg icon
 */
@NgModule({
  declarations: [
    FlIconDirective
  ],
  exports: [
    FlIconDirective
  ],
  imports: [
    CommonModule,
  ]
})
export class FlIconModule {
  /**
   * Method to configure the svg icon registrations
   * @param config
   */
  public static forRoot(config: FlIconConfig): ModuleWithProviders<FlIconModule> {
    return {
      ngModule: FlIconModule,
      providers: [
        FlIconRegistryService,
        {provide: FL_ICON_MODULE, useValue: config},
        {provide: APP_INITIALIZER, useFactory: initIcons, deps: [FlIconRegistryService], multi: true},
      ],
    };
  }
}
