import {BioxLink, BioxLinkPart, BioxProcess, BioxProcessable, BioxProtocol} from '../model/entities/biox-processable.entity';
import {BioxExperiment} from '../model/entities/biox-experiment.entity';
import {
  BioxExperimentFlow,
  BioxExperimentFlowJob,
  BioxExperimentFlowProcess,
  BioxExperimentFlowStep
} from '../model/entities/biox-experiment-flow.entity';
import {BioxProcessableBase} from '../model/entities/biox-processable-base.entity';
import {BioxConfig} from '../model/entities/biox-config.entity';
import {BioxJob} from '../model/entities/biox-job.entity';


/**
 * Factory to create experiment flow object from processable
 */
export class BioxExperimentFlowFactory {

  public static bioxExperimentFromProcessable(bioxProcessable: BioxProcessable, experiment: BioxExperiment): BioxExperimentFlow {
    if (bioxProcessable instanceof BioxProtocol) {
      return BioxExperimentFlowFactory.bioxExperimentFromProtocol(bioxProcessable, experiment);
    } else if (bioxProcessable instanceof BioxProcess) {
      return BioxExperimentFlowFactory.bioxExperimentFromProcess(bioxProcessable, experiment);
    } else {
      throw new Error('Can\'t create an experiment flow from a none processable');
    }
  }


  public static bioxExperimentFromProtocol(protocol: BioxProtocol, experiment: BioxExperiment): BioxExperimentFlow {
    const flow: BioxExperimentFlow = BioxExperimentFlowFactory.initExperimentFlow(protocol, experiment);

    // create the jobs
    for (const nodeName of Object.keys(protocol.data.graph.nodes)) {
      const process: BioxProcessableBase = protocol.data.graph.nodes[nodeName];
      flow.jobs[nodeName] = BioxExperimentFlowFactory.flowJobFromProcessable(process, experiment.id);
    }

    // create the flow steps
    for (const link of protocol.data.graph.links) {
      flow.flows.push(BioxExperimentFlowFactory.flowStepFromBioxLink(link));
    }

    // init the connections and nodes
    flow.initConnectionsAndNodes();

    return flow;
  }

  public static bioxExperimentFromProcess(process: BioxProcess, experiment: BioxExperiment): BioxExperimentFlow {
    return BioxExperimentFlowFactory.initExperimentFlow(process, experiment);
  }

  private static initExperimentFlow(process: BioxProcessableBase, experiment: BioxExperiment): BioxExperimentFlow {
    const flow: BioxExperimentFlow = new BioxExperimentFlow();
    flow.experimentId = experiment.id;
    flow.type = process.type;
    flow.createdAt = process.createdAt;
    // todo check if useful
    flow.isRunning = experiment.isInProgress;
    flow.isFinished = !experiment.isInProgress;
    // todo check type
    flow.config = process.configSpecs;
    flow.process = process;

    // create the jobs
    flow.jobs = {};

    // create the flow steps
    flow.flows = [];

    return flow;
  }

  public static flowJobFromProcessable(processable: BioxProcessableBase,
                                        experimentId: string): BioxJob {
    const job: BioxJob = new BioxJob();
    job.type = 'gws.model.Job';
    job.isRunning = false;
    job.isFinished = false;
    job.process = processable;
    job.experimentId = experimentId;
    job.parentJobId = null;
    job.config = BioxConfig.empty();
    job.name = processable.name;
    job.inputs = processable.inputs;


    return job;
  }

  private static flowStepFromBioxLink(link: BioxLink): BioxExperimentFlowStep {
    const flowStep: BioxExperimentFlowStep = new BioxExperimentFlowStep();

    flowStep.from = BioxExperimentFlowFactory.flowJobFromLinkPart(link.from);
    flowStep.to = BioxExperimentFlowFactory.flowJobFromLinkPart(link.to);
    flowStep.resource = null;

    return flowStep;
  }

  private static flowJobFromLinkPart(linkPart: BioxLinkPart): BioxExperimentFlowJob {
    const flowJob: BioxExperimentFlowJob = new BioxExperimentFlowJob();
    flowJob.jobId = null;

    const flowProcess: BioxExperimentFlowProcess = new BioxExperimentFlowProcess();
    flowProcess.instanceName = linkPart.getNodeName();
    flowProcess.port = linkPart.getPort();

    flowJob.process = flowProcess;
    return flowJob;
  }

}
