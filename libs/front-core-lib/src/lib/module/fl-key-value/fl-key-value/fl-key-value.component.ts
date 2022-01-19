import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

/**
 * Component to show a text with a key and a value like 'Key : value'
 *  <fl-key-value><fl-key>{{'host' | translate}}</fl-key>{{serverInfo.host}}</fl-key-value>
 */
@Component({
  selector: 'fl-key-value',
  templateUrl: './fl-key-value.component.html',
  styleUrls: ['./fl-key-value.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlKeyValueComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
