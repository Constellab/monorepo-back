import {Component, Input, OnInit} from '@angular/core';
import {CaTechnicalReportNode} from '../../../../../ca-core/model/entities/ca-technical-report.class';
import {TdTypeEntity, TdTypingName} from '@monorepo/technical-doc';
import {FlDialogService} from '@monorepo/front-core-lib';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../../../../environments/ca-environment';
import {
  CaExperimentTechnicalReportProcessDocDialogComponent
} from '../ca-experiment-technical-report-process-doc-dialog/ca-experiment-technical-report-process-doc-dialog.component';

@Component({
  selector: 'ca-experiment-technical-report-node',
  templateUrl: './ca-experiment-technical-report-node.component.html',
  styleUrls: ['./ca-experiment-technical-report-node.component.scss']
})
export class CaExperimentTechnicalReportNodeComponent implements OnInit {

  @Input()
  node: CaTechnicalReportNode;

  typingName: TdTypingName;

  constructor(
    private dialogService: FlDialogService,
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.typingName = new TdTypingName(this.node.process_typing_name);
  }

  openTechDocDialog(): void {
    this.http.post(`${environment.hubApiUrl}brick/technical-doc-by-path`, {
      brickName: this.typingName.brickName,
      brickVersion: this.node.brick_version,
      techDocType: this.typingName.type.toLowerCase(),
      techDocUniqueName: this.typingName.uniqueName
    }).subscribe((res: TdTypeEntity) => {
      this.dialogService.openMediumDialog(CaExperimentTechnicalReportProcessDocDialogComponent, {data: res});
    });
  }

}
