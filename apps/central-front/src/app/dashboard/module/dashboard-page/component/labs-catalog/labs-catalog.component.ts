import {Component, OnInit} from '@angular/core';
import {Lab} from '../../../../../core/model/entities/lab.class';
import {LabService} from '../../../../service/lab.service';
import {RouterService} from '../../../../../core/service/router.service';
import {FlArrayObs} from '@monorepo/front-core-lib';

/**
 * Catalogue of available labs
 */
@Component({
  selector: 'gen-labs-catalog',
  templateUrl: './labs-catalog.component.html',
  styleUrls: ['./labs-catalog.component.scss']
})
export class LabsCatalogComponent implements OnInit {

  labArray: FlArrayObs<Lab>;

  labsRoute: string = RouterService.getMyLabsRoute();


  constructor(private labService: LabService) {
  }

  ngOnInit(): void {
    this.labArray = this.labService.getCurrentLabs();
  }
}
