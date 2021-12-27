import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlIconDirective} from './fl-icon/fl-icon.directive';
import {FlSvgIconRegistryService} from './fl-icon-registry.service';
import {FL_ICON_MODULE, FlIconConfig} from './fl-icon-config.class';

function registerCustomIcon(flSvgIconRegistryService: FlSvgIconRegistryService): () => void {
  return (): void => flSvgIconRegistryService.registerCustomIcons();
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
        FlSvgIconRegistryService,
        {provide: FL_ICON_MODULE, useValue: config},
        {provide: APP_INITIALIZER, useFactory: registerCustomIcon, deps: [FlSvgIconRegistryService], multi: true},
      ],
    };
  }
}
