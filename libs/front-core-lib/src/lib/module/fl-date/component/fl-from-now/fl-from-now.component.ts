import {Component, Input, OnInit} from '@angular/core';
import {ClDateInput} from '@monorepo/core-lib';
import {TooltipPosition} from '@angular/material/tooltip';

/**
 * Component to show a from with form now format and a tooltip with the exact date
 */
@Component({
  selector: 'fl-from-now',
  templateUrl: './fl-from-now.component.html',
  styleUrls: ['./fl-from-now.component.scss']
})
export class FlFromNowComponent implements OnInit {

  @Input() date: ClDateInput;

  @Input() tooltipFormat: string = 'D HH:mm'

  @Input() tooltipPosition: TooltipPosition = 'above';

  @Input() disabledTooltip: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

}
