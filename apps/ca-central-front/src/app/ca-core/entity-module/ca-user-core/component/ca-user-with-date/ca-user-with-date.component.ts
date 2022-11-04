import {Component, Input, OnInit} from '@angular/core';
import {CaUser} from '../../../../model/entities/ca-user.class';
import {DateTime} from 'luxon';

/**
 * Component to show the user photo with a date associated
 * Useful for the created and lastModified fields
 */
@Component({
  selector: 'ca-user-with-date',
  templateUrl: './ca-user-with-date.component.html',
  styleUrls: ['./ca-user-with-date.component.scss']
})
export class CaUserWithDateComponent implements OnInit {

  @Input() user: CaUser;
  @Input() date: DateTime;

  constructor() {
  }

  ngOnInit(): void {
  }

}
