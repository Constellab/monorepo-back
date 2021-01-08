import {Inject, Injectable} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {FlSvgIconConfig, LF_SVG_ICON_MODULE} from './fl-svg-icon-config.class';

/**
 * Service to register custom svg icon to use them with <mat-icon> in html
 */
@Injectable()
export class FlSvgIconRegistryService {

  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer,
              @Inject(LF_SVG_ICON_MODULE) private config: FlSvgIconConfig) {
  }

  /**
   * Call this method only on app start up only to register custom icons
   */
  public registerCustomIcons(): void {
    for (const icon of this.config.iconsToRegister) {
      this.registerIcon(icon.name, icon.filename);
    }
  }

  private registerIcon(name: string, filename: string): void {
    this.matIconRegistry.addSvgIcon(name,
      this.domSanitizer.bypassSecurityTrustResourceUrl(this.config.iconFolder + filename)
    );
  }
}
