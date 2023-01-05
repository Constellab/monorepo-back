import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';

/**
 * Simple component to show a text with an icon based on a boolean value
 */
@Component({
  selector: 'fl-text-ok-nok',
  templateUrl: './fl-text-ok-nok.component.html',
  styleUrls: ['./fl-text-ok-nok.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlTextOkNokComponent implements OnInit {

  @Input() value: boolean;

  @Input() okText: string;

  @Input() nokText: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
