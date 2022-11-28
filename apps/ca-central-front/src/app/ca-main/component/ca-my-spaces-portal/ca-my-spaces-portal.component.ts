import {Component, OnInit} from '@angular/core';
import {CaSpaceService} from '../../../ca-core/service-api/ca-space.service';
import {combineLatestWith, Observable} from 'rxjs';
import {CaSpace} from '../../../ca-core/model/entities/ca-space.class';
import {map} from 'rxjs/operators';
import {CaCurrentSpaceService} from '../../../ca-core/service-api/ca-current-space.service';
import {CaRouterService} from '../../../ca-core/service/ca-router.service';


/**
 * Portal to list the space of the user with possibility to switch between them
 */
@Component({
  selector: 'ca-my-spaces-portal',
  templateUrl: './ca-my-spaces-portal.component.html',
  styleUrls: ['./ca-my-spaces-portal.component.scss']
})
export class CaMySpacesPortalComponent implements OnInit {

  currentSpace$: Observable<CaSpace>;
  currentSpaceRoute: string = CaRouterService.getCurrentSpaceRoute();

  mySpaces$: Observable<CaSpace[]>;

  appRoute = CaRouterService.getAppRoute();

  constructor(private spaceService: CaSpaceService,
              private currentSpaceService: CaCurrentSpaceService) {
  }

  ngOnInit(): void {
    this.currentSpace$ = this.currentSpaceService.getCurrentSpace$();
    // list all the space of the user except from the current one
    this.mySpaces$ = this.spaceService.getMySpaces().pipe(
      combineLatestWith(this.currentSpaceService.getCurrentSpace$()),
      map(([spaces, currentSpace]) => spaces.filter(space => space.id !== currentSpace.id))
    );
  }

}
