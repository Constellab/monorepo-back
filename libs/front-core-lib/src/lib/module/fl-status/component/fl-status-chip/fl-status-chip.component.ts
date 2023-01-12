import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {FlStatus} from '../../model/fl-status.class';
import {LegacyTooltipPosition as TooltipPosition} from '@angular/material/legacy-tooltip';
import {Observable, of} from 'rxjs';

export type FlStatusChipMode = 'iconText' | 'iconOnly' | 'textOnly';

/**
 * Simple component to display a status on a chip with color
 */
@Component({
  selector: 'fl-status-chip',
  templateUrl: './fl-status-chip.component.html',
  styleUrls: ['./fl-status-chip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlStatusChipComponent implements OnInit {

  @Input() set status(status: FlStatus | Observable<FlStatus>) {
    if (status instanceof Observable) {
      this.status$ = status;
    } else {
      this.status$ = of(status);
    }
  }

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
   * By default tooltip is disabled in iconText and textOnly mode and enable in iconOnly mode
   */
  @Input() tooltipDisabled: boolean;

  @Input() size: 'normal' | 'small' = 'normal';

  status$: Observable<FlStatus>;

  constructor() {
  }

  ngOnInit(): void {
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

  get iconClass(): string {
    return this.size === 'normal' ? 'g-icon-small' : 'g-icon-tiny';
  }

  // get tooltip value, take input value if provided, otherwise disable if text is shown
  get tooltipDisabledBool(): boolean {
    return this.tooltipDisabled != null ? this.tooltipDisabled : this.showText;
  }
}
