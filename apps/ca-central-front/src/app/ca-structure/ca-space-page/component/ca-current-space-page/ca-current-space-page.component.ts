import {Component, OnInit} from '@angular/core';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';
import {Observable} from 'rxjs';
import {CaSpace} from '../../../../ca-core/model/entities/space/ca-space.class';
import {CaCurrentSpaceService} from '../../../../ca-core/service-api/ca-current-space.service';

@Component({
  selector: 'ca-current-space-page',
  templateUrl: './ca-current-space-page.component.html',
  styleUrls: ['./ca-current-space-page.component.scss']
})
export class CaCurrentSpacePageComponent implements OnInit {

  space$: Observable<CaSpace> = this.currentSpaceService.getCurrentSpace$();

  dashboardRoute = CaRouterService.getCurrentSpaceRoute();

  usersRoute = CaRouterService.getCurrentSpaceUsersRoute();

  constructor(private currentSpaceService: CaCurrentSpaceService) {
  }

  ngOnInit(): void {
  }

}
