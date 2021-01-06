import {Injectable} from '@angular/core';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
import {svgIcons} from '../model/config/svg-icon-config';

/**
 * Service to register custom svg icon to use them with <mat-icon> in html
 */
@Injectable({
  providedIn: 'root'
})
export class IconRegistryService {

  private readonly iconPath: string = 'assets/mat-icons/';


  constructor(private matIconRegistry: MatIconRegistry, private domSanitizer: DomSanitizer) {
  }

  /**
   * Call this method only on app start up only to register custom icons
   */
  public registerCustomIcons(): void {
    for (const icon of svgIcons) {
      this.registerIcon(icon.name, icon.filename);
    }
  }

  private registerIcon(name: string, filename: string): void {
    this.matIconRegistry.addSvgIcon(name,
      this.domSanitizer.bypassSecurityTrustResourceUrl(this.iconPath + filename)
    );
  }
}
