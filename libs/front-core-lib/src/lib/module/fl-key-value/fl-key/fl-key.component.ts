import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

/**
 * Key of the fl-key-value component
 */
@Component({
  selector: 'fl-key',
  templateUrl: './fl-key.component.html',
  styleUrls: ['./fl-key.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlKeyComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

}
