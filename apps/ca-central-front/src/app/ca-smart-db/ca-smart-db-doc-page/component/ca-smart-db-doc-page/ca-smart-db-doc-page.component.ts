import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {CaSmartDbDoc} from '../../../model/ca-smart-db-doc.class';
import {CaSmartDbService} from '../../../../ca-core/service-api/ca-smart-db.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'ca-smart-db-doc-page',
  templateUrl: './ca-smart-db-doc-page.component.html',
  styleUrls: ['./ca-smart-db-doc-page.component.scss']
})
export class CaSmartDbDocPageComponent implements OnInit {

  smartDbId: string;

  doc$: Observable<CaSmartDbDoc>;

  constructor(private route: ActivatedRoute,
              private smartDbService: CaSmartDbService) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.init(params.smartDbId, params.docId)
    );
  }

  private init(smartDbId: string, id: string): void {
    this.smartDbId = smartDbId;
    this.doc$ = this.smartDbService.findDocById(smartDbId, id);
  }

}
