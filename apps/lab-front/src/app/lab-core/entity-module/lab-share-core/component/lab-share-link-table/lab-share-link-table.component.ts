import {Component, Input, OnInit} from '@angular/core';
import {FlTableAbstractDirective} from '@monorepo/front-core-lib';
import {LabShareLink, LabShareLinkDatasource} from '../../../../model/entities/lab-share.entity';
import {LabShareService} from '../../../../entity-service/lab-share.service';

@Component({
  selector: 'lab-share-link-table',
  templateUrl: './lab-share-link-table.component.html',
  styleUrls: ['./lab-share-link-table.component.scss']
})
export class LabShareLinkTableComponent extends FlTableAbstractDirective<LabShareLink>
  implements OnInit {

  @Input() datasource: LabShareLinkDatasource;

  constructor(private shareService: LabShareService) {
    super(['entityType', 'entityName', 'validUntil', 'downloadLink', 'actions']);
  }

  ngOnInit(): void {
  }

  onLinkUpdated(entity: LabShareLink): void {
    this.datasource.updateItem(entity);
  }

  onLinkDeleted(entity: LabShareLink): void {
    this.datasource.removeItem(entity);
  }

  getDownloadLink(entity: LabShareLink): string {
    return this.shareService.getDownloadRoute(entity.entityType, entity.token);
  }


}
