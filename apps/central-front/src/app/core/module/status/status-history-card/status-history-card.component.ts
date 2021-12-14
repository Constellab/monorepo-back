import {Component, Input, OnInit} from '@angular/core';
import {StatusHistory} from '../../../model/entities/status-history.class';

/**
 * Card to display information about a status history
 */
@Component({
  selector: 'gen-status-history-card',
  templateUrl: './status-history-card.component.html',
  styleUrls: ['./status-history-card.component.scss']
})
export class StatusHistoryCardComponent implements OnInit {

  @Input() statusHistory: StatusHistory<any>;

  constructor() {
  }

  ngOnInit(): void {
  }

}
