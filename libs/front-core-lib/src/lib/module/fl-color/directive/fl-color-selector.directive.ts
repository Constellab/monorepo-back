import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {FlPortalService} from '../../fl-portal/service/fl-portal.service';
import {FlPortalConnectedPosition} from '../../fl-portal/model/fl-portal.class';
import {ClHelpService} from '@monorepo/core-lib';
import {FlColorSelectorPortalComponent} from '../component/fl-color-selector-portal/fl-color-selector-portal.component';

/**
 * directive to place on any element to open the select color portal on click
 *
 * Support double binding with [(flColorSelector)]
 */
@Directive({
  selector: '[flColorSelector]'
})
export class FlColorSelectorDirective {

  @Input() flColorSelector: string;

  @Output() flColorSelectorChange: EventEmitter<string> = new EventEmitter<string>();

  @Input() flColorSelectorPositions: FlPortalConnectedPosition[] = ['bottom', 'left', 'top', 'right'];

  @HostListener('click', ['$event']) onMouseEnter(event: MouseEvent): void {
    this.openPortal(event);
  }

  constructor(private portalService: FlPortalService) {
  }

  private openPortal(event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    const config = this.portalService.configureRelativePortalFromMouseEvent(event,
      this.flColorSelectorPositions, {
        disposeOnOutsideClick: true,
        disposeOnNavigation: true,
        elevation: true,
      });

    this.portalService.createPortal(FlColorSelectorPortalComponent, config, this.flColorSelector).detachments().subscribe(
      color => this.onColorSelectorClose(color)
    );
  }

  private onColorSelectorClose(color?: string): void {
    if (color) {
      this.flColorSelectorChange.next(color);
    }
  }

}
