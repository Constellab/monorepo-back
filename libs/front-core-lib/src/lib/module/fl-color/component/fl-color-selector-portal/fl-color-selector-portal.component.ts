import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../../fl-portal/model/fl-portal.class';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';

@Component({
  selector: 'fl-color-selector-portal',
  templateUrl: './fl-color-selector-portal.component.html',
  styleUrls: ['./fl-color-selector-portal.component.scss']
})
export class FlColorSelectorPortalComponent implements OnInit {

  color?: string;

  constructor(@Inject(FL_PORTAL_DATA) color: string | null,
              private overlayRef: FlOverlayRef) {
    this.color = color;
  }

  ngOnInit(): void {
  }

  onColorSelected(color: string): void {
    this.overlayRef.dispose(color);
  }
}
