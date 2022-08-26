import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {LabViewConfigService} from '../../../../../lab-core/entity-service/lab-view-config.service';
import {mergeMap, Observable} from 'rxjs';
import {LabResourceView} from '../../../../../lab-core/model/entities/resource/lab-resource-view.entity';

/**
 * Page to see the detail of a stored view
 */
@Component({
  selector: 'lab-view-config-detail-page',
  templateUrl: './lab-view-config-detail-page.component.html',
  styleUrls: ['./lab-view-config-detail-page.component.scss']
})
export class LabViewConfigDetailPageComponent implements OnInit {

  labView$: Observable<LabResourceView>;

  constructor(private route: ActivatedRoute,
              private viewConfigService: LabViewConfigService) {
  }

  ngOnInit(): void {
    this.labView$ = this.route.params.pipe(
      mergeMap(params => this.viewConfigService.callViewConfig(params.id))
    );
  }
}
