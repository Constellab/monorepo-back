import {Component, OnInit} from '@angular/core';
import {CaLab} from '../../../../../ca-core/model/entities/ca-lab.class';
import {CaLabService} from '../../../../../ca-core/service-api/ca-lab.service';
import {CaRouterService} from '../../../../../ca-core/service/ca-router.service';
import {FlArrayObs} from '@monorepo/front-core-lib';

/**
 * Catalogue of available labs
 */
@Component({
  selector: 'ca-labs-catalog',
  templateUrl: './ca-labs-catalog.component.html',
  styleUrls: ['./ca-labs-catalog.component.scss']
})
export class CaLabsCatalogComponent implements OnInit {

  labArray: FlArrayObs<CaLab>;

  labsRoute: string = CaRouterService.getMyLabsRoute();


  constructor(private labService: CaLabService) {
  }

  ngOnInit(): void {
    this.labArray = this.labService.getCurrentLabs();
  }
}
