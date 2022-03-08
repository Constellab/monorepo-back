import {Component, OnInit} from '@angular/core';
import {mergeMap, Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {CaSmartDb} from '../../../../ca-core/model/entities/ca-smart-db.entity';
import {CaSmartDbService} from '../../../../ca-core/service-api/ca-smart-db.service';

/**
 * Page to administrate smart DB
 */
@Component({
  selector: 'ca-smart-db-admin-page',
  templateUrl: './ca-smart-db-admin-page.component.html',
  styleUrls: ['./ca-smart-db-admin-page.component.scss']
})
export class CaSmartDbAdminPageComponent implements OnInit {

  smartDb$: Observable<CaSmartDb>;

  constructor(private route: ActivatedRoute,
              private smartDbService: CaSmartDbService) {
  }

  ngOnInit(): void {
    this.smartDb$ =
      this.route.params.pipe(
        mergeMap(params => this.smartDbService.findById(params.smartDbId))
      );
  }

}
