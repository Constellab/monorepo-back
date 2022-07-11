import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import {flCdkOverlayPanelClass} from '../../../../utils/fl-material.config';

/**
 * Header of the portal with a ng-content for the title. Contain a close button and
 * support drag on header.
 *
 * Can be put in <fl-portal>
 */
@Component({
  selector: 'fl-portal-header',
  templateUrl: './fl-portal-header.component.html',
  styleUrls: ['./fl-portal-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlPortalHeaderComponent implements OnInit {

  /**
   * When true the portal is movable by drag on header
   */
  @Input() enableDrag: boolean = false;

  dragRootElement = '.' + flCdkOverlayPanelClass;

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  // call by another component to disable the drag
  public setEnableDrag(enableDrag: boolean): void {
    this.enableDrag = enableDrag;
    this.cdr.markForCheck();
  }

}
