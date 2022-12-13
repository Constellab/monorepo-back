import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaSpace} from '../../../../ca-core/model/entities/space/ca-space.class';
import {CaCurrentSpaceService} from '../../../../ca-core/service-api/ca-current-space.service';

@Component({
  selector: 'ca-current-space-dashboard-page',
  templateUrl: './ca-current-space-dashboard-page.component.html',
  styleUrls: ['./ca-current-space-dashboard-page.component.scss']
})
export class CaCurrentSpaceDashboardPageComponent implements OnInit {

  space$: Observable<CaSpace> = this.currentSpaceService.getCurrentSpace$();

  constructor(private currentSpaceService: CaCurrentSpaceService) {
  }

  ngOnInit(): void {
  }

}
