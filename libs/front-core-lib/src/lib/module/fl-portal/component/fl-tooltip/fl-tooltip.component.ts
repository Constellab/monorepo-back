import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '../../model/fl-portal.class';

/**
 * Simple tooltip component that reuse material classes
 */
@Component({
  selector: 'fl-tooltip',
  templateUrl: './fl-tooltip.component.html',
  styleUrls: ['./fl-tooltip.component.scss']
})
export class FlTooltipComponent implements OnInit {

  message: string;

  constructor(@Inject(FL_PORTAL_DATA) message: string) {
    this.message = message;
  }

  ngOnInit(): void {
  }

}
