import {Component, Input, OnInit} from '@angular/core';
import {CaSmartDbDoc} from '../../../model/ca-smart-db-doc.class';
import {CaRouterService} from '../../../../ca-core/service/ca-router.service';

@Component({
  selector: 'ca-smart-db-doc-card',
  templateUrl: './ca-smart-db-doc-card.component.html',
  styleUrls: ['./ca-smart-db-doc-card.component.scss']
})
export class CaSmartDbDocCardComponent implements OnInit {

  @Input() smartDbId: string

  @Input() doc: CaSmartDbDoc;

  @Input() showDetailPageLink: boolean = false;

  constructor() {
  }

  ngOnInit(): void {
  }

  get detailLink(): string {
    return CaRouterService.getSmartDbDocDetailRoute(this.smartDbId, this.doc?.id);
  }

}
