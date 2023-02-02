import {Component, Input, OnInit} from '@angular/core';
import {FlUser} from '../../model/fl-user.class';
import {DateTime} from 'luxon';

@Component({
  selector: 'fl-creation-info',
  templateUrl: './fl-creation-info.component.html',
  styleUrls: ['./fl-creation-info.component.scss']
})
export class FlCreationInfoComponent implements OnInit {

  @Input() user: FlUser;
  @Input() date: DateTime;

  constructor() { }

  ngOnInit(): void {
  }

}
