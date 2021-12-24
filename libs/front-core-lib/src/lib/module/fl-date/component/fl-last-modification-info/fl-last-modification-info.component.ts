import {Component, Input, OnInit} from '@angular/core';
import {DateTime} from 'luxon';

/**
 * Simple component to show a text like : 'Last modified by michel two days ago'
 */
@Component({
  selector: 'fl-last-modification-info',
  templateUrl: './fl-last-modification-info.component.html',
  styleUrls: ['./fl-last-modification-info.component.scss']
})
export class FlLastModificationInfoComponent implements OnInit {

  @Input() lastModifiedBy: string;

  @Input() lastModifiedAt: DateTime;

  constructor() { }

  ngOnInit(): void {
  }

}
