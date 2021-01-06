import {Component, Inject, OnInit} from '@angular/core';
import {PORTAL_DATA} from '../../../../model/global/portal/portal.class';

/**
 * Simple tooltip component that reuse material classes
 */
@Component({
  selector: 'gen-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss']
})
export class TooltipComponent implements OnInit {

  message: string;

  constructor(@Inject(PORTAL_DATA) message: string) {
    this.message = message;
  }

  ngOnInit(): void {
  }

}
