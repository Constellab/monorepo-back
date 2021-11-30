import {ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FlStatus} from '../../model/fl-status.class';
import {TooltipPosition} from '@angular/material/tooltip';
import {Observable, Subscription} from 'rxjs';

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
export class FlStatusChipComponent implements OnInit, OnDestroy {

  @Input() set status(status: FlStatus | Observable<FlStatus>) {
    this.unsubscribe();
    if (status instanceof Observable) {
      status.subscribe(
        s => this.setStatus(s)
      );
    } else {
      this.setStatus(status);
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
   * By default tooltip is disable in iconText and textOnly mode and enable in iconOnly mode
   */
  @Input() tooltipDisabled: boolean;

  _status: FlStatus;

  icon: string;

  statusColorClass: string;


  private subscription: Subscription;

  constructor() {
  }

  ngOnInit(): void {
  }

  private setStatus(status: FlStatus): void {
    this.statusColorClass = status.getStatusClassColor('background');
    this.icon = status.getStatusIcon();
    this._status = status;
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

  private unsubscribe(): void {
    this.subscription?.unsubscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }


}
