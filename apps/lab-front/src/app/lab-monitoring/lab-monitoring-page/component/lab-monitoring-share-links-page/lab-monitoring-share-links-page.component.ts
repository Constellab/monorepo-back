import {Component, OnInit} from '@angular/core';
import {LabShareLinkService} from '../../../../lab-core/entity-service/lab-share-link.service';
import {LabShareLink, LabShareLinkDatasource} from '../../../../lab-core/model/entities/lab-share.entity';
import {FlTableColumn} from '@monorepo/front-core-lib';

@Component({
  selector: 'lab-monitoring-share-links-page',
  templateUrl: './lab-monitoring-share-links-page.component.html',
  styleUrls: ['./lab-monitoring-share-links-page.component.scss']
})
export class LabMonitoringShareLinksPageComponent implements OnInit {

  shareLinks: LabShareLinkDatasource = this.shareLinkService.getAllDatasource();

  columns: FlTableColumn<LabShareLink>[] = ['entityType', 'entityName', 'validUntil', 'downloadLink', 'actions']

  constructor(private shareLinkService: LabShareLinkService) { }

  ngOnInit(): void {
  }

}
