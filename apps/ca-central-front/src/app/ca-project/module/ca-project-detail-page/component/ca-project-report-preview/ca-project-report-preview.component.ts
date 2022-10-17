import {Component, OnInit} from '@angular/core';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {filter, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * Component in the project page right panel to show the preview of the report
 */
@Component({
  selector: 'ca-project-report-preview',
  templateUrl: './ca-project-report-preview.component.html',
  styleUrls: ['./ca-project-report-preview.component.scss']
})
export class CaProjectReportPreviewComponent implements OnInit {

  reportId$: Observable<string>;

  constructor(private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.reportId$ = this.state.getRightPanelState$().pipe(
      filter(state => state.type === 'report'),
      map(state => state.objectId)
    );
  }

}
