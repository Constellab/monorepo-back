import {Component, Input, OnInit} from '@angular/core';
import {StatusHistory} from '../../../model/entities/status-history.class';

export type StatusChipMode = 'iconText' | 'iconOnly' | 'textOnly';

/**
 * Simple component to display a status on a chip with color
 */
@Component({
  selector: 'gen-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrls: ['./status-chip.component.scss']
})
export class StatusChipComponent implements OnInit {

  @Input() statusHistory: StatusHistory<any>;

  /**
   * The position of the icon. Start --> the icon before the text. End --> the icon is after the text
   */
  @Input() iconPosition: 'start' | 'end' = 'start';

  /**
   * Display or not the icon or text
   */
  @Input() mode: StatusChipMode = 'iconText';

  icon: string;

  statusColorClass: string;

  constructor() {
  }

  ngOnInit(): void {
    this.statusColorClass = this.statusHistory.getColor('background');
    this.icon = this.statusHistory.getIcon();
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
