import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FlIconDirective} from './fl-icon/fl-icon.directive';
import {FlSvgIconRegistryService} from './fl-icon-registry.service';
import {FlSvgIconConfig, LF_SVG_ICON_MODULE} from './fl-svg-icon-config.class';

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
export class FlSvgIconModule {
  /**
   * Method to configure the svg icon registrations
   * @param config
   */
  public static forRoot(config: FlSvgIconConfig): ModuleWithProviders<FlSvgIconModule> {
    return {
      ngModule: FlSvgIconModule,
      providers: [
        FlSvgIconRegistryService,
        {provide: LF_SVG_ICON_MODULE, useValue: config},
        {provide: APP_INITIALIZER, useFactory: registerCustomIcon, deps: [FlSvgIconRegistryService], multi: true},
      ],
    };
  }
}
