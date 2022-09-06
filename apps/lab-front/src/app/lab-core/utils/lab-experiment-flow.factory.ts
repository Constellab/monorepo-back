import {LabProcess} from '../model/entities/process/lab-process.entity';
import {LabProtocolIOFace, LabProtocolLink, LabProtocolLinkPart} from '../model/entities/lab-protocol-link.entity';
import {LabProtocolGraph} from '../model/entities/process/lab-protocol.entity';
import {PrWorkflow, PrWorkflowConnection, PrWorkflowLayer} from '@monorepo/protocol';


/**
 * Factory to create experiment flow object from process
 */
export class LabExperimentFlowFactory {

  /**
   * Convert a workflow to a protocol graph to be saved in the lab
   * @param workflow
   */
  public static convertWorkflowToProtocolGraph(workflow: PrWorkflow): LabProtocolGraph {
    return LabExperimentFlowFactory.convertWorkflowToProtocolGraphRecur(workflow.getRootLayer());
  }

  private static convertWorkflowToProtocolGraphRecur(layer: PrWorkflowLayer): LabProtocolGraph {
    const graph: LabProtocolGraph = LabProtocolGraph.empty();

    // get nodes
    for (const node of layer.getProcessNodes()) {
      const process: LabProcess = node.additionalObject;

      if (layer.children[process.name] != null) {
        process.data.graph = LabExperimentFlowFactory.convertWorkflowToProtocolGraphRecur(layer.children[process.name]);
      }

      graph.nodes[process.name] = process;
    }

    // get connections
    for (const connection of layer.connections) {

      // if the connection is an interface or outerface, don't add it to the links
      if (connection.isIOFaceConnection()) {
        const ioFace: LabProtocolIOFace = LabExperimentFlowFactory.workflowConnection(connection) as LabProtocolIOFace;
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
        const link: LabProtocolLink = LabExperimentFlowFactory.workflowConnection(connection);
        graph.links.push(link);
      }
    }

    return graph;
  }

  private static workflowConnection(connection: PrWorkflowConnection): LabProtocolLink | LabProtocolIOFace {
    let link: LabProtocolLink | LabProtocolIOFace;
    if (connection.isIOFaceConnection()) {
      link = new LabProtocolIOFace();
    } else {
      link = new LabProtocolLink();
    }

    // handle from
    const from: LabProtocolLinkPart = new LabProtocolLinkPart();
    if (connection.isInterfaceConnection()) {
      // indicate that this is an interface link to the parent
      from.nodeName = ':parent:';
    } else {
      from.nodeName = connection.outputNode.nodeName;
    }
    from.port = connection.outputPort.name;
    link.from = from;

    // handle to
    const to: LabProtocolLinkPart = new LabProtocolLinkPart();
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
