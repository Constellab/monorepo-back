import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

/**
 * Simple button icon component that support double binding to toggle between
 * pin and unpinned
 */
@Component({
  selector: 'fl-pin-unpin-button',
  templateUrl: './fl-pin-unpin-button.component.html',
  styleUrls: ['./fl-pin-unpin-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlPinUnpinButtonComponent implements OnInit {

  @Input() pin: boolean;
  @Output() pinChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {
  }

  ngOnInit(): void {
  }

  get pinToggleText(): string {
    return this.pin ? 'flCoreComponent.unpin' : 'flCoreComponent.pin';
  }

  get pinToggleIcon(): string {
    return this.pin ? 'material-icons' : 'material-icons-outlined';
  }

  togglePin(): void {
    this.pinChange.next(!this.pin);
  }
}
