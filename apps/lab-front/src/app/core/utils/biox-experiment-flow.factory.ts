import {BioxProcess} from '../model/entities/process/biox-process.entity';
import {Workflow} from '../../biox/module/biox-experiment-detail-page/model/workflow.class';
import {WorkflowLayer} from '../../biox/module/biox-experiment-detail-page/model/workflow-layer.class';
import {BioxProtocolIOFace, BioxProtocolLink, BioxProtocolLinkPart} from '../model/entities/biox-protocol-link.entity';
import {BioxProtocolGraph} from '../model/entities/process/biox-protocol.entity';
import {WorkflowConnection} from '../../biox/module/biox-experiment-detail-page/model/workflow-connection.class';


/**
 * Factory to create experiment flow object from process
 */
export class BioxExperimentFlowFactory {

  /**
   * Convert a workflow to a protocol graph to be save in the lab
   * @param workflow
   */
  public static convertWorkflowToProtocolGraph(workflow: Workflow): BioxProtocolGraph {
    return BioxExperimentFlowFactory.convertWorkflowToProtocolGraphRecur(workflow.getRootLayer());
  }

  private static convertWorkflowToProtocolGraphRecur(layer: WorkflowLayer): BioxProtocolGraph {
    const graph: BioxProtocolGraph = BioxProtocolGraph.empty();

    // get nodes
    for (const node of layer.getProcessNodes()) {
      const process: BioxProcess = node.object;

      if (layer.children[process.name] != null) {
        process.data.graph = BioxExperimentFlowFactory.convertWorkflowToProtocolGraphRecur(layer.children[process.name]);
      }

      graph.nodes[process.name] = process;
    }

    // get connections
    for (const connection of layer.connections) {

      // if the connection is an interface or outerface, don't add it to the links
      if (connection.isIOFaceConnection()) {
        const ioFace: BioxProtocolIOFace = BioxExperimentFlowFactory.workflowConnection(connection) as BioxProtocolIOFace;
        if (connection.isInterfaceConnection()) {
          // retrieve the name of the ioFace
          ioFace.name = connection.outputPort.name;
          graph.interfaces[ioFace.name] = ioFace;
        } else {
          // retrieve the name of the ioFace
          ioFace.name = connection.inputPort.name;
          graph.outerfaces[ioFace.name] = ioFace;
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
