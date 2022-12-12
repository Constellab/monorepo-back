import {Component, Input, OnInit} from '@angular/core';
import {DateTime} from 'luxon';
import {FlUser} from '../../model/fl-user.class';

/**
 * Component to show the user photo with a date associated
 * Useful for the created and lastModified fields
 */
@Component({
  selector: 'fl-user-with-date',
  templateUrl: './fl-user-with-date.component.html',
  styleUrls: ['./fl-user-with-date.component.scss']
})
export class FlUserWithDateComponent implements OnInit {

  @Input() user: FlUser;
  @Input() date: DateTime;

  constructor() { }

  ngOnInit(): void {
  }

}
