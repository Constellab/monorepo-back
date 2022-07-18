import {Component, OnInit} from '@angular/core';
import {CaStatsService} from '../../../../../ca-core/service-api/ca-stats.service';
import {CaStats} from '../../../../../ca-core/model/entities/ca-stats.class';

@Component({
  selector: 'ca-dashboard-my-activity',
  templateUrl: './ca-dashboard-my-activity.component.html',
  styleUrls: ['./ca-dashboard-my-activity.component.scss']
})
export class CaDashboardMyActivityComponent implements OnInit {

  stats: CaStats;

  constructor(
    private statsService: CaStatsService
  ) {
  }

  ngOnInit(): void {
    this.statsService.getStats().subscribe(stats => this.stats = stats);
  }

}
