import {Component, Input, OnInit} from '@angular/core';
import {DateTime} from 'luxon';

/**
 * Simple component to show a text like : 'Created by michel two days ago'
 */
@Component({
  selector: 'fl-creation-info',
  templateUrl: './fl-creation-info.component.html',
  styleUrls: ['./fl-creation-info.component.scss']
})
export class FlCreationInfoComponent implements OnInit {

  @Input() createdBy: string;

  @Input() createdAt: DateTime;

  constructor() {
  }

  ngOnInit(): void {
  }

}
