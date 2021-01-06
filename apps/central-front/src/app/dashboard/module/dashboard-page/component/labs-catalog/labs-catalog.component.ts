import {Component, OnInit} from '@angular/core';
import {Lab} from '../../../../../core/model/entities/lab.class';
import {LabService} from '../../../../service/lab.service';
import {ArrayObs} from '../../../../../core/model/datasource/array-obs.class';
import {RouterService} from '../../../../../core/service/router.service';

/**
 * Catalogue of available labs
 */
@Component({
  selector: 'gen-labs-catalog',
  templateUrl: './labs-catalog.component.html',
  styleUrls: ['./labs-catalog.component.scss']
})
export class LabsCatalogComponent implements OnInit {

  labArray: ArrayObs<Lab>;

  labsRoute: string = RouterService.getMyLabsRoute();


  constructor(private labService: LabService) {
  }

  ngOnInit(): void {
    this.labArray = this.labService.getCurrentLabs();
  }
}
