import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CaSpaceService} from '../../../../ca-core/service-api/ca-space.service';
import {Observable} from 'rxjs';
import {CaSpace} from '../../../../ca-core/model/entities/ca-space.class';
import {CaCurrentSpaceService} from '../../../../ca-core/service-api/ca-current-space.service';
import {CaCurrentSpaceDetailComponent} from '../ca-current-space-detail/ca-current-space-detail.component';

@Component({
  selector: 'ca-current-space-page',
  templateUrl: './ca-current-space-page.component.html',
  styleUrls: ['./ca-current-space-page.component.scss']
})
export class CaCurrentSpacePageComponent implements OnInit {

  space$: Observable<CaSpace>;



  constructor(private route: ActivatedRoute,
              private spaceService: CaSpaceService,
              private currentSpaceService: CaCurrentSpaceService) {
  }

  ngOnInit(): void {
    this.space$ = this.currentSpaceService.getCurrentSpace$();
  }

}
