import {BioxProcessable} from '../model/entities/proccesable/biox-processable.entity';
import {BioxConfig} from '../model/entities/biox-config.entity';
import {BioxProcessType} from '../model/entities/lab-type/biox-process-type.entity';
import {BioxInput} from '../model/entities/biox-input.entity';
import {Workflow} from '../../biox/module/biox-experiment-detail-page/model/workflow.class';
import {WorkflowLayer} from '../../biox/module/biox-experiment-detail-page/model/workflow-layer.class';
import {BioxProtocolIOFace, BioxProtocolLink, BioxProtocolLinkPart} from '../model/entities/biox-protocol-link.entity';
import {BioxProcess} from '../model/entities/proccesable/biox-process.entity';
import {BioxProtocol, BioxProtocolGraph} from '../model/entities/proccesable/biox-protocol.entity';
import {BioxProcessableType} from '../model/entities/lab-type/biox-processable-type.entity';
import {BioxProtocolType} from '../model/entities/lab-type/biox-protocol-type.entity';
import {WorkflowConnection} from '../../biox/module/biox-experiment-detail-page/model/workflow-connection.class';


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
    process.data.title = processType.name;

    process.inputs = BioxExperimentFlowFactory.bioxInputFromSpecs(processType.inputSpecs);
    process.outputs = BioxExperimentFlowFactory.bioxInputFromSpecs(processType.outputSpecs);

    process.config = BioxConfig.fromSpecs(processType.configSpecs);
    return process;
  }

  public static protocolFromProtocolType(protocolType: BioxProtocolType): BioxProcessable {
    const protocol: BioxProtocol = new BioxProtocol();
    protocol.typingName = protocolType.typingName;
    protocol.data = protocolType.data ?? ({} as any);
    protocol.data.title = protocolType.name;

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
    return BioxExperimentFlowFactory.convertWorkflowToProtocolRecur(workflow.getRootLayer());
  }

  private static convertWorkflowToProtocolRecur(layer: WorkflowLayer): BioxProtocolGraph {
    const graph: BioxProtocolGraph = BioxProtocolGraph.empty();

    // get nodes
    for (const node of layer.getProcessableNodes()) {
      const processable: BioxProcessable = node.object;

      if (layer.children[processable.name] != null) {
        processable.data.graph = BioxExperimentFlowFactory.convertWorkflowToProtocolRecur(layer.children[processable.name]);
      }

      graph.nodes[processable.name] = processable;
    }

    // get connections
    for (const connection of layer.connections) {

      // if the connection is an interface or outerface, don't add it to the links
      if (connection.isIOFaceConnection()) {
        const ioFace: BioxProtocolIOFace = BioxExperimentFlowFactory.workflowConnection(connection) as BioxProtocolIOFace;
        // retrieve the name of the ioFace
        const ioFaceName: string = (connection.object as BioxProtocolIOFace).name;
        ioFace.name = ioFaceName;

        if (connection.isInterfaceConnection()){
          graph.interfaces[ioFaceName] = ioFace;
        }
        else{
          graph.outerfaces[ioFaceName] = ioFace;
        }

      } else {
        const link: BioxProtocolLink = BioxExperimentFlowFactory.workflowConnection(connection);
        graph.links.push(link);
      }
    }

    return graph;
  }

  private static workflowConnection(connection: WorkflowConnection): BioxProtocolLink | BioxProtocolIOFace {
    let link: BioxProtocolLink | BioxProtocolIOFace;
    if (connection.isIOFaceConnection()) {
      link = new BioxProtocolIOFace();
    } else {
      link = new BioxProtocolLink();
    }

    // handle from
    const from: BioxProtocolLinkPart = new BioxProtocolLinkPart();
    if (connection.isInterfaceConnection()) {
      // indicate that this is an interface link to the parent
      from.nodeName = ':parent:';
    } else {
      from.nodeName = connection.outputNode.nodeName;
    }
    from.port = connection.outputPort.name;
    link.from = from;

    // handle to
    const to: BioxProtocolLinkPart = new BioxProtocolLinkPart();
    if (connection.isOuterfaceConnection()) {
      // indicate that this is an outerface link to the parent
      to.nodeName = ':parent:';
    } else {
      to.nodeName = connection.inputNode.nodeName;
    }
    to.port = connection.inputPort.name;
    link.to = to;

    return link;
  }


}
