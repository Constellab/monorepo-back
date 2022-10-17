import {Component, Input, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FlQuillJson, FlTextEditorConfig} from '@monorepo/front-core-lib';
import {CaReportService} from '../../../../../ca-core/service-api/ca-report.service';
import {CaTextEditorConfig} from '../../../../../ca-core/model/config/ca-text-editor-config.class';

/**
 * Component to show the report content in a disabled text editor
 */
@Component({
  selector: 'ca-report-content',
  templateUrl: './ca-report-content.component.html',
  styleUrls: ['./ca-report-content.component.scss']
})
export class CaReportContentComponent implements OnInit {

  @Input() reportId: string;

  content$: Observable<FlQuillJson>;
  textEditorConfig: FlTextEditorConfig;


  constructor(private reportService: CaReportService) { }

  ngOnInit(): void {
    this.content$ = this.reportService.getContent(this.reportId);
    this.textEditorConfig = new CaTextEditorConfig(this.reportService, this.reportId);
  }

}
