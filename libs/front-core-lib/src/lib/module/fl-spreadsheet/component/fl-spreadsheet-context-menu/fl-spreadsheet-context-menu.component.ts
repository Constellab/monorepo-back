import {Component, Inject, OnInit} from '@angular/core';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlContextMenuButton, FlContextMenuConfig} from '../../state/fl-spreadsheet-context-menu.state';

/**
 * Configurable component to show the context menu of a spreadsheet (opens on a right click)
 */
@Component({
  selector: 'fl-spreadsheet-context-menu',
  templateUrl: './fl-spreadsheet-context-menu.component.html',
  styleUrls: ['./fl-spreadsheet-context-menu.component.scss']
})
export class FlSpreadsheetContextMenuComponent implements OnInit {

  config: FlContextMenuConfig;

  constructor(private overlayRef: FlOverlayRef,
              @Inject(FL_PORTAL_DATA) config: FlContextMenuConfig) {
    this.config = config;
  }

  ngOnInit(): void {
  }

  selectOption(button: FlContextMenuButton): void {
    // call the button action
    const result = button.onClick();
    // close the overlay
    this.overlayRef.dispose(result);
  }

}
