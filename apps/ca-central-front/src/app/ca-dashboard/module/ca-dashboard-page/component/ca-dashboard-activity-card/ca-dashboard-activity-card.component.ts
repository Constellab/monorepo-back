import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ca-dashboard-activity-card',
  templateUrl: './ca-dashboard-activity-card.component.html',
  styleUrls: ['./ca-dashboard-activity-card.component.scss']
})
export class CaDashboardActivityCardComponent implements OnInit {

  @Input() activityNumber: number;

  @Input() activityText: string;

  constructor() { }

  ngOnInit(): void {
  }

}
