import {Component, OnInit} from '@angular/core';
import {CaProjectDetailState} from '../../state/ca-project-detail.state';
import {filter, Observable, switchMap} from 'rxjs';
import {map} from 'rxjs/operators';
import {CaReport} from '../../../../../ca-core/model/entities/project/ca-report.class';

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
  report$: Observable<CaReport>;

  constructor(private state: CaProjectDetailState) {
  }

  ngOnInit(): void {
    this.reportId$ = this.state.getRightPanelState$().pipe(
      filter(state => state.type === 'report'),
      map(state => state.objectId)
    );

    this.report$ = this.reportId$.pipe(
      switchMap(id => this.state.getReport$(id))
    );
  }

}
