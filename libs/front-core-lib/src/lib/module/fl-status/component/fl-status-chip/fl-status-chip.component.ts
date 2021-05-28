import {Component, Input, OnInit} from '@angular/core';
import {FlStatus} from '../../model/fl-status.class';
import {TooltipPosition} from '@angular/material/tooltip';

export type FlStatusChipMode = 'iconText' | 'iconOnly' | 'textOnly';

/**
 * Simple component to display a status on a chip with color
 */
@Component({
  selector: 'fl-status-chip',
  templateUrl: './fl-status-chip.component.html',
  styleUrls: ['./fl-status-chip.component.scss']
})
export class FlStatusChipComponent implements OnInit {

  @Input() status: FlStatus;

  /**
   * The position of the icon. Start --> the icon before the text. End --> the icon is after the text
   */
  @Input() iconPosition: 'start' | 'end' = 'start';

  /**
   * Display or not the icon or text
   */
  @Input() mode: FlStatusChipMode = 'iconText';

  @Input() tooltipPosition: TooltipPosition = 'below';

  /**
   * If true the tooltip is disabled
   * By default tooltip is disable in iconText and textOnly mode and enable in iconOnly mode
   */
  @Input() tooltipDisabled: boolean;

  icon: string;

  statusColorClass: string;

  constructor() {
  }

  ngOnInit(): void {
    this.statusColorClass = this.status.getStatusClassColor('background');
    this.icon = this.status.getStatusIcon();
  }

  get showIcon(): boolean {
    return this.mode === 'iconText' || this.mode === 'iconOnly';
  }

  get showText(): boolean {
    return this.mode === 'iconText' || this.mode === 'textOnly';
  }

  get gap(): string {
    return this.mode === 'iconText' ? '5px' : '0';
  }

  // get tooltip value, take input value if provided, otherwise disable if text is shown
  get tooltipDisabledBool(): boolean {
    return this.tooltipDisabled != null ? this.tooltipDisabled : this.showText;
  }

}
