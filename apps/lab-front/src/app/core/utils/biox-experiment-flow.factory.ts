import {BioxProcessable} from '../model/entities/proccesable/biox-processable.entity';
import {BioxConfig} from '../model/entities/biox-config.entity';
import {BioxProcessType} from '../model/entities/processable-type/biox-process-type.entity';
import {BioxInput} from '../model/entities/biox-input.entity';
import {Workflow} from '../../biox/module/biox-experiment-detail-page/model/workflow.class';
import {WorkflowLayer} from '../../biox/module/biox-experiment-detail-page/model/workflow-layer.class';
import {BioxProtocolLink, BioxProtocolLinkPart} from '../model/entities/biox-protocol-link.entity';
import {BioxProcess} from '../model/entities/proccesable/biox-process.entity';
import {BioxProtocol, BioxProtocolGraph} from '../model/entities/proccesable/biox-protocol.entity';
import {BioxProcessableType} from '../model/entities/processable-type/biox-processable-type.entity';
import {BioxProtocolType} from '../model/entities/processable-type/biox-protocol-type.entity';


/**
 * Factory to create experiment flow object from processable
 */
export class BioxExperimentFlowFactory {

  public static processableFromProcessableType(processableSpec: BioxProcessableType): BioxProcessable {
    if (processableSpec instanceof BioxProcessType) {
      return BioxExperimentFlowFactory.processFromProcessType(processableSpec);
    } else if (processableSpec instanceof BioxProtocolType) {
      return BioxExperimentFlowFactory.protocolFromProtocolType(processableSpec);
    }
    return null;
  }

  /**
   * Convert a {link BioxProcessType} to a {@link BioxProcessable} to be use in the workflow
   * @param processType
   */
  public static processFromProcessType(processType: BioxProcessType): BioxProcess {
    const process: BioxProcess = new BioxProcess();
    process.typingName = processType.typingName;
    // todo check process data to see how to pass it
    process.data = processType.data as any ?? {};
    process.data.title = processType.name

    process.inputs = BioxExperimentFlowFactory.bioxInputFromSpecs(processType.inputSpecs);
    process.outputs = BioxExperimentFlowFactory.bioxInputFromSpecs(processType.outputSpecs);

    process.config = BioxConfig.fromSpecs(processType.configSpecs);
    return process;
  }

  public static protocolFromProtocolType(protocolType: BioxProtocolType): BioxProcessable {
    const protocol: BioxProtocol = new BioxProtocol();
    protocol.typingName = protocolType.typingName;
    protocol.data = protocolType.data ?? ({} as any);
    protocol.data.title = protocolType.name

    // todo check out to do
    protocol.inputs = BioxExperimentFlowFactory.bioxInputFromSpecs(protocolType.getInputSpecs());
    protocol.outputs = BioxExperimentFlowFactory.bioxInputFromSpecs(protocolType.getOutputSpecs());

    return protocol;
  }

  private static bioxInputFromSpecs(specs: Record<string, string[]>): Record<string, BioxInput> {
    const bioxInputs: Record<string, BioxInput> = {};

    if (specs != null) {
      for (const key of Object.keys(specs)) {
        bioxInputs[key] = BioxInput.fromSpecs(specs[key]);
      }
    }
    return bioxInputs;
  }

  /**
   * Convert a workflow to a protocol to be save in the lab
   * @param workflow
   */
  public static convertWorkflowToProtocol(workflow: Workflow): BioxProtocolGraph {
    const graph: BioxProtocolGraph = BioxProtocolGraph.empty();

    // todo, handle deep protocols
    const layer: WorkflowLayer = workflow.getRootLayer();

    // get nodes
    for (const node of layer.getProcessableNodes()) {
      const processable: BioxProcessable = node.object;
      graph.nodes[processable.name] = processable;
    }

    // get connections
    for (const connection of layer.connections) {
      const link: BioxProtocolLink = new BioxProtocolLink();

      // handle from
      const from: BioxProtocolLinkPart = new BioxProtocolLinkPart();
      from.nodeName = connection.outputNode.nodeName;
      from.port = connection.outputPort.name;
      link.from = from;

      // handle to
      const to: BioxProtocolLinkPart = new BioxProtocolLinkPart();
      to.nodeName = connection.inputNode.nodeName;
      to.port = connection.inputPort.name;
      link.to = to;

      graph.links.push(link);
    }

    return graph;
  }


}
