import {Directive, ElementRef, Host, Inject, Input, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {FlSvgIconConfig, LF_SVG_ICON_MODULE} from '../fl-svg-icon-config.class';

/**
 * directive to be placed on a mat-icon. It set the icon and support both
 * mat icon and svg icon
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-icon[flIcon]'
})
export class FlIconDirective implements OnInit {

  @Input() set flIcon(flIcon: string) {
    this.setIcon(flIcon);
  }

  constructor(@Host() private matIcon: MatIcon,
              private elementRef: ElementRef<HTMLElement>,
              @Inject(LF_SVG_ICON_MODULE) private config: FlSvgIconConfig) {
  }

  ngOnInit(): void {

  }

  private setIcon(icon: string): void {
    if (icon == null) {
      this.setMatIcon(null);
      this.setSvgIcon(null);
    } else if (this.isSvgIcon(icon)) {
      // set the svgIcon property of mat icon
      this.setMatIcon(null);
      this.matIcon.fontSet = null;
      this.setSvgIcon(icon);
    } else {
      this.setSvgIcon(null);
      this.matIcon.fontSet = 'material-icons';
      this.setMatIcon(icon);
    }
  }

  // return true if this is an SVG icon and not a material icon
  private isSvgIcon(icon: string): boolean {
    return this.config.iconsToRegister.find(svgIcon => svgIcon.name === icon) != null;
  }

  private setMatIcon(icon: string): void {
    this.elementRef.nativeElement.innerText = icon;
  }

  private setSvgIcon(icon: string): void {
    this.matIcon.svgIcon = icon;
  }

}
