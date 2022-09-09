import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CaExperiment} from '../../../../../ca-core/model/entities/ca-experiment.class';
import {CaExperimentService} from '../../../../../ca-core/service-api/ca-experiment.service';
import {
  CaTechnicalReport,
  CaTechnicalReportGraph,
  CaTechnicalReportProcess
} from '../../../../../ca-core/model/entities/ca-technical-report.class';
import {FlDialogService} from '@monorepo/front-core-lib';
import {
  CaExperimentLabConfigDialogComponent
} from '../ca-experiment-lab-config-dialog/ca-experiment-lab-config-dialog.component';
import {
  PrProcess,
  prProcessStatusDict,
  PrProtocolFlow,
  PrResource,
  PrWorkflowActionSelectNode,
  PrWorkflowActionState,
  PrWorkflowMode,
  PrWorkflowNodeOutput,
  PrWorkflowNodeProcess,
  PrWorkflowNodeProtocol,
  PrWorkflowNodeSource,
  PrWorkflowNodeViewer
} from '@monorepo/protocol';
import {filter, Observable, of, tap} from 'rxjs';
import {MatDrawer} from '@angular/material/sidenav';
import {CaWorkflowConfig} from '../../model/ca-workflow-config.class';
import {ClStringHelper} from '@monorepo/core-lib';
import {TdTypingName} from '@monorepo/technical-doc';
import {map} from 'rxjs/operators';

@Component({
  selector: 'ca-experiment-technical-report',
  templateUrl: './ca-experiment-technical-report.component.html',
  styleUrls: ['./ca-experiment-technical-report.component.scss']
})
export class CaExperimentTechnicalReportComponent implements OnInit, OnDestroy {

  @ViewChild(MatDrawer, {static: true}) drawer: MatDrawer;

  @Input() experiment: CaExperiment;

  technicalReport: CaTechnicalReport;

  prProtocol: PrProtocolFlow;

  workflowMode$: Observable<PrWorkflowMode> = of('readOnly');

  workflowConfig: CaWorkflowConfig;

  currentNodeSelected: Observable<PrWorkflowNodeProcess>;

  constructor(private experimentService: CaExperimentService,
              private dialogService: FlDialogService,
              private actionState: PrWorkflowActionState) {
  }

  ngOnInit(): void {
    this.experimentService.getExperimentTechnicalReport(this.experiment.id).subscribe((res: CaTechnicalReport) => {
      this.technicalReport = res;
      this.prProtocol = this.technicalReportToPrProtocol(res.data.graph, ClStringHelper.generateUUID(),
        'Main protocol', res.data.human_name);
    });

    this.workflowConfig = new CaWorkflowConfig();
    this.actionState.init();

    // this.workflowConfig.onNodeSelected$.subscribe((nodeSelected) => {
    //   this.currentNodeSelected = of(nodeSelected);
    //   this.drawer.open();
    // });
    this.currentNodeSelected = this.actionState.getAction$().pipe(
      filter(action => action?.action === 'selectNode'),
      tap(() => this.drawer.open()),
      map(action => (action as PrWorkflowActionSelectNode).processNode)
    );
  }

  openLabConfigDialog(): void {
    this.dialogService.openSmallDialog(CaExperimentLabConfigDialogComponent, {data: this.experiment});
  }

  private technicalReportToPrProtocol(graph: CaTechnicalReportGraph, id: string, name: string, title: string): PrProtocolFlow {
    const protocol = new PrProtocolFlow(id, name, title);


    for (const key of Object.keys(graph.nodes)) {
      const caProcess = graph.nodes[key];
      const node = this.caProcessToPrProcessNode(caProcess, key, protocol.id);
      protocol.addNode(node);
    }

    for (const link of graph.links) {
      protocol.addConnection(link.from.node, link.to.node, link.from.port, link.to.port);
    }

    for (const key of Object.keys(graph.interfaces)) {
      const inter = graph.interfaces[key];
      protocol.addInterface(inter.name, inter.to.node, inter.to.port);
    }

    for (const key of Object.keys(graph.outerfaces)) {
      const outer = graph.outerfaces[key];
      protocol.addOuterface(outer.name, outer.from.node, outer.from.port);
    }

    return protocol;
  }


  private caProcessToPrProcessNode(caProcess: CaTechnicalReportProcess, name: string, protocolId: string): PrWorkflowNodeProcess {
    const prProcess = this.caProcessToPrProcess(caProcess, name, protocolId);

    const getResource = (): Observable<PrResource> => of(null);
    if (caProcess.process_typing_name === TdTypingName.task.source) {
      return new PrWorkflowNodeSource(prProcess, getResource, 0, 0, prProcess);
    } else if (caProcess.process_typing_name === TdTypingName.task.output.typingName) {
      return new PrWorkflowNodeOutput(prProcess, getResource, 0, 0, prProcess);
    } else if (caProcess.process_typing_name === TdTypingName.task.viewer) {
      return new PrWorkflowNodeViewer(prProcess, getResource, 0, 0, prProcess);
    } else if (caProcess.graph != null) {
      const flow$: Observable<PrProtocolFlow> = of(this.technicalReportToPrProtocol(caProcess.graph, prProcess.id,
        name, caProcess.human_name));
      return new PrWorkflowNodeProtocol(prProcess, flow$, 0, 0, prProcess);
    } else {
      return new PrWorkflowNodeProcess(prProcess, 0, 0, prProcess);
    }
  }

  private caProcessToPrProcess(caProcess: CaTechnicalReportProcess, name: string, protocolId: string): PrProcess {
    return {
      id: ClStringHelper.generateUUID(),
      name: name,
      humanName: caProcess.human_name,
      config: caProcess.config,
      parentProtocolId: protocolId,
      outputs: caProcess.outputs,
      inputs: caProcess.inputs,
      processTypingName: caProcess.process_typing_name,
      status: prProcessStatusDict[caProcess.status],
    };
  }

  ngOnDestroy(): void {
    this.actionState.clear();
  }


}


