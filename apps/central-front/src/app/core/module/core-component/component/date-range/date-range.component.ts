import {Component, Input, OnInit} from '@angular/core';
import {Moment} from 'moment';

/**
 * Display a date range with text,
 * Support different mode where there is no start or end date
 */
@Component({
  selector: 'gen-date-range',
  templateUrl: './date-range.component.html',
  styleUrls: ['./date-range.component.scss']
})
export class DateRangeComponent implements OnInit {

  @Input() startingDate?: Moment;

  @Input() endingDate?: Moment;

  @Input() dateFormat: string = 'L';

  mode: 'between' | 'from' | 'to';

  constructor() {
  }

  ngOnInit(): void {
    if (this.startingDate != null && this.endingDate != null) {
      this.mode = 'between';
    } else if (this.startingDate == null) {
      this.mode = 'to';
    } else if (this.endingDate == null) {
      this.mode = 'from';
    } else {
      console.error('[DateRangeComponent] starting date and ending date are null');
    }
  }

}
