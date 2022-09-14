import {Component, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
  PrResource,
  PrWorkflow,
  PrWorkflowActionSelectNode,
  PrWorkflowActionState,
  PrWorkflowLayer,
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

  workflow: PrWorkflow;

  workflowMode$: Observable<PrWorkflowMode> = of('readOnly');

  workflowConfig: CaWorkflowConfig;

  currentNodeSelected: Observable<PrWorkflowNodeProcess>;

  constructor(private experimentService: CaExperimentService,
              private dialogService: FlDialogService,
              private actionState: PrWorkflowActionState,
              private ngZone: NgZone) {
  }

  ngOnInit(): void {
    this.experimentService.getExperimentTechnicalReport(this.experiment.id).subscribe((res: CaTechnicalReport) => {
      this.technicalReport = res;
      this.workflow = this.technicalReportToWorkflow(res.data.graph, ClStringHelper.generateUUID());
    });

    this.workflowConfig = new CaWorkflowConfig();
    this.actionState.init();


    this.currentNodeSelected = this.actionState.getAction$().pipe(
      filter(action => action?.action === 'selectNode'),
      tap(() => this.drawer.open()),
      map(action => (action as PrWorkflowActionSelectNode).processNode)
    );
  }

  openLabConfigDialog(): void {
    this.dialogService.openSmallDialog(CaExperimentLabConfigDialogComponent, {data: this.experiment});
  }

  private technicalReportToWorkflow(graph: CaTechnicalReportGraph, id: string): PrWorkflow {
    const layer = this.createLayer(graph, true, id);
    return new PrWorkflow(layer, 'readOnly', this.ngZone);
  }

  private createLayer(graph: CaTechnicalReportGraph, rootLayer: boolean,
                      id: string, title?: string): PrWorkflowLayer {

    let layer: PrWorkflowLayer;
    if (rootLayer) {
      layer = PrWorkflowLayer.rootLayer(id);
    } else {
      layer = new PrWorkflowLayer(id, id, title);
    }

    for (const key of Object.keys(graph.nodes)) {
      const caProcess = graph.nodes[key];
      const node = this.caProcessToPrProcessNode(caProcess, key, id);
      layer.addNode(node);
    }

    for (const link of graph.links) {
      layer.addPrConnection({
        fromNode: link.from.node,
        toNode: link.to.node,
        fromPort: link.from.port,
        toPort: link.to.port
      });
    }

    for (const key of Object.keys(graph.interfaces)) {
      const inter = graph.interfaces[key];
      layer.addInterface(inter.name, inter.to.node, inter.to.port);
    }

    for (const key of Object.keys(graph.outerfaces)) {
      const outer = graph.outerfaces[key];
      layer.addOuterface(outer.name, outer.from.node, outer.from.port);
    }

    layer.initNodesPositions();

    return layer;
  }

  private caProcessToPrProcessNode(caProcess: CaTechnicalReportProcess, name: string, protocolId: string): PrWorkflowNodeProcess {
    const prProcess = this.caProcessToPrProcess(caProcess, name, protocolId);

    const getResource = (): Observable<PrResource> => of(null);
    if (caProcess.process_typing_name === TdTypingName.task.source) {
      return new PrWorkflowNodeSource(prProcess, getResource);
    } else if (caProcess.process_typing_name === TdTypingName.task.output.typingName) {
      return new PrWorkflowNodeOutput(prProcess, getResource);
    } else if (caProcess.process_typing_name === TdTypingName.task.viewer) {
      return new PrWorkflowNodeViewer(prProcess, getResource);
    } else if (caProcess.graph != null) {
      const layer$: Observable<PrWorkflowLayer> = of(this.createLayer(caProcess.graph, false, prProcess.id, name));
      return new PrWorkflowNodeProtocol(prProcess, layer$);
    } else {
      return new PrWorkflowNodeProcess(prProcess);
    }
  }

  private caProcessToPrProcess(caProcess: CaTechnicalReportProcess, name: string, protocolId: string): PrProcess {
    return {
      id: ClStringHelper.generateUUID(),
      instanceName: name,
      title: caProcess.human_name,
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
    this.workflow?.destroy();
  }


}


