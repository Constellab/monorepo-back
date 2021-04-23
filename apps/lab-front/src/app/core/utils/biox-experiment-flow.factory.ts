import {BioxExperiment} from '../model/entities/biox-experiment.entity';
import {BioxProcessable, BioxProcessableBase, BioxProtocol} from '../model/entities/biox-processable.entity';
import {BioxConfig} from '../model/entities/biox-config.entity';


/**
 * Factory to create experiment flow object from processable
 */
export class BioxExperimentFlowFactory {

  public static bioxExperimentFromProcessable(bioxProcessable: BioxProcessable, experiment: BioxExperiment): BioxProtocol {
    if (bioxProcessable instanceof BioxProtocol) {
      return BioxExperimentFlowFactory.bioxExperimentFromProtocol(bioxProcessable, experiment);
      // } else if (bioxProcessable instanceof BioxProcess) {
      //   return BioxExperimentFlowFactory.bioxExperimentFromProcess(bioxProcessable, experiment);
    } else {
      throw new Error('Can\'t create an experiment flow from a none processable');
    }
  }


  // todo a tester avec le nouveau flow
  public static bioxExperimentFromProtocol(protocol: BioxProtocol, experiment: BioxExperiment): BioxProtocol {
    const flow: BioxProtocol = BioxExperimentFlowFactory.initExperimentFlow(protocol, experiment);

    // create the jobs
    for (const nodeName of Object.keys(protocol.data.graph.nodes)) {
      const process: BioxProcessableBase = protocol.data.graph.nodes[nodeName];
      // flow.data.graph.nodes[nodeName] = BioxExperimentFlowFactory.flowJobFromProcessable(process, experiment.id);
    }

    // create the flow steps
    for (const link of protocol.data.graph.links) {
      // flow.data.links.push(BioxExperimentFlowFactory.flowStepFromBioxLink(link));
    }

    // init the connections and nodes
    flow.data.initConnectionsAndNodes();

    return flow;
  }

  // public static bioxExperimentFromProcess(process: BioxProcess, experiment: BioxExperiment): BioxFlow {
  //   return BioxExperimentFlowFactory.initExperimentFlow(process, experiment);
  // }

  // todo a tester avec le nouveau flow
  private static initExperimentFlow(process: BioxProcessableBase, experiment: BioxExperiment): BioxProtocol {
    const flow: BioxProtocol = new BioxProtocol();
    flow.experiment = {uri: experiment.id};
    // flow.type = process.type;
    // flow.createdAt = process.createdAt;
    // todo check if useful
    // flow.isRunning = experiment.isInProgress;
    // flow.isFinished = !experiment.isInProgress;
    // todo check type
    flow.config = BioxConfig.empty();
    // todo check if process without interface and outerface is ok
    // flow.process = process as any;


    // create the jobs
    // flow.jobs = {};

    // create the flow steps
    // flow.flows = [];

    return flow;
  }


  // private static flowStepFromBioxLink(link: BioxLink): BioxFlowStep {
  //   const flowStep: BioxFlowStep = new BioxFlowStep();
  //
  //   flowStep.from = BioxExperimentFlowFactory.flowJobFromLinkPart(link.from);
  //   flowStep.to = BioxExperimentFlowFactory.flowJobFromLinkPart(link.to);
  //   flowStep.resource = null;
  //
  //   return flowStep;
  // }
  //
  // private static flowJobFromLinkPart(linkPart: BioxLinkPart): BioxFlowJob {
  //   const flowJob: BioxFlowJob = new BioxFlowJob();
  //   // flowJob.jobId = null;
  //
  //   const flowProcess: BioxFlowProcess = new BioxFlowProcess();
  //   flowProcess.instanceName = linkPart.nodeName;
  //   flowProcess.port = linkPart.port;
  //
  //   // flowJob.process = flowProcess;
  //   return flowJob;
  // }

}
