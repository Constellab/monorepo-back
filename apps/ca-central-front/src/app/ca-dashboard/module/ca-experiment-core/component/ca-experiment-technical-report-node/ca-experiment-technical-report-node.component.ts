import {Component, Input, OnInit} from '@angular/core';
import {CaTechnicalReportNode} from '../../../../../ca-core/model/entities/ca-technical-report.class';
import {environment} from '../../../../../../environments/ca-environment';
import {TdTypingName} from '@monorepo/technical-doc';

@Component({
  selector: 'ca-experiment-technical-report-node',
  templateUrl: './ca-experiment-technical-report-node.component.html',
  styleUrls: ['./ca-experiment-technical-report-node.component.scss']
})
export class CaExperimentTechnicalReportNodeComponent implements OnInit {

  @Input()
  node: CaTechnicalReportNode;

  typingName: TdTypingName;

  constructor() {
  }

  ngOnInit(): void {
    this.typingName = new TdTypingName(this.node.process_typing_name);
  }

  getHubLink(): string {
    const major: string = this.node.brick_version.split('.')[0];

    return `${environment.hubUrl}bricks/${this.typingName.brickName}/v${major}/doc/` +
      `technical-folder/${this.typingName.type.toLowerCase()}/${this.typingName.uniqueName}`
  }

}
