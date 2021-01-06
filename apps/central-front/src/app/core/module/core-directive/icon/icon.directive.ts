import {Directive, ElementRef, Host, Input, OnInit} from '@angular/core';
import {svgIcons} from '../../../model/config/svg-icon-config';
import {MatIcon} from '@angular/material/icon';

/**
 * directive to be placed on a mat-icon. It set the icon and support both
 * mat icon and svg icon
 */
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: 'mat-icon[genIcon]'
})
export class IconDirective implements OnInit {

  @Input() set genIcon(genIcon: string) {
    this.setIcon(genIcon);
  }

  constructor(@Host() private matIcon: MatIcon,
              private elementRef: ElementRef<HTMLElement>) {
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
    return svgIcons.find(svgIcon => svgIcon.name === icon) != null;
  }

  private setMatIcon(icon: string): void {
    this.elementRef.nativeElement.innerText = icon;
  }

  private setSvgIcon(icon: string): void {
    this.matIcon.svgIcon = icon;
  }

}
