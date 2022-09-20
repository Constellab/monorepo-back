import {Component, Input, OnInit} from '@angular/core';
import {DateTime} from 'luxon';

@Component({
  selector: 'fl-last-sync-info',
  templateUrl: './fl-last-sync-info.component.html',
  styleUrls: ['./fl-last-sync-info.component.scss']
})
export class FlLastSyncInfoComponent implements OnInit {

  @Input() lastSyncBy: string;

  @Input() lastSyncAt: DateTime;

  constructor() { }

  ngOnInit(): void {
  }

}
