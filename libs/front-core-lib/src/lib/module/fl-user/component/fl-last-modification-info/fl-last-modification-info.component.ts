import {Component, Input, OnInit} from '@angular/core';
import {FlUser} from '@monorepo/front-core-lib';
import {DateTime} from 'luxon';

/**
 * Simple component to show the last modification info
 */
@Component({
  selector: 'fl-last-modification-info',
  templateUrl: './fl-last-modification-info.component.html',
  styleUrls: ['./fl-last-modification-info.component.scss']
})
export class FlLastModificationInfoComponent implements OnInit {

  @Input() user: FlUser;
  @Input() date: DateTime;

  constructor() { }

  ngOnInit(): void {
  }

}
