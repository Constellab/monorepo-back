import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

/**
 * Generic dialog title with centered title and close button
 */
@Component({
  selector: 'fl-dialog-header',
  templateUrl: './fl-dialog-header.component.html',
  styleUrls: ['./fl-dialog-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlDialogHeaderComponent implements OnInit {

  @Input() hideCloseButton: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

}
