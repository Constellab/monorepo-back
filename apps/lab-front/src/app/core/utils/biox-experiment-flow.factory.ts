import {BioxProcessable} from '../model/entities/proccesable/biox-processable.entity';
import {Workflow} from '../../biox/module/biox-experiment-detail-page/model/workflow.class';
import {WorkflowLayer} from '../../biox/module/biox-experiment-detail-page/model/workflow-layer.class';
import {BioxProtocolIOFace, BioxProtocolLink, BioxProtocolLinkPart} from '../model/entities/biox-protocol-link.entity';
import {BioxProtocolGraph} from '../model/entities/proccesable/biox-protocol.entity';
import {WorkflowConnection} from '../../biox/module/biox-experiment-detail-page/model/workflow-connection.class';


/**
 * Factory to create experiment flow object from processable
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
    for (const node of layer.getProcessableNodes()) {
      const processable: BioxProcessable = node.object;

      if (layer.children[processable.name] != null) {
        processable.data.graph = BioxExperimentFlowFactory.convertWorkflowToProtocolGraphRecur(layer.children[processable.name]);
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

        if (connection.isInterfaceConnection()) {
          graph.interfaces[ioFaceName] = ioFace;
        } else {
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
