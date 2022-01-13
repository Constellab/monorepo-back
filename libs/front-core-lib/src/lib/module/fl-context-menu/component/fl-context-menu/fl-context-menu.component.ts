import {ChangeDetectionStrategy, Component, Inject, OnInit} from '@angular/core';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlContextMenuButton, FlContextMenuConfig} from '../../fl-context-menu.class';

@Component({
  selector: 'fl-context-menu',
  templateUrl: './fl-context-menu.component.html',
  styleUrls: ['./fl-context-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlContextMenuComponent implements OnInit {

  config: FlContextMenuConfig;

  constructor(private overlayRef: FlOverlayRef,
              @Inject(FL_PORTAL_DATA) config: FlContextMenuConfig) {
    this.config = config;
    if(config == null || !config.buttons){
      console.error('[FlContextMenuComponent] empty config')
    }
  }

  ngOnInit(): void {
  }

  selectOption(button: FlContextMenuButton, event: MouseEvent): void {
    // call the button action
    const result = button.onClick(event);
    // close the overlay
    this.overlayRef.dispose(result);
  }
}
