import {Component, Input, OnInit} from '@angular/core';
import {FlStatus} from '../../model/fl-status.class';

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

}
