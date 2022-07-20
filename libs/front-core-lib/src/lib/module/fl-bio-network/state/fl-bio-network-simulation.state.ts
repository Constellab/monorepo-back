import {Injectable, OnDestroy} from '@angular/core';
import {ForceManyBody, Simulation} from 'd3-force';
import {FlBioNetworkNode} from '../model/fl-bio-network-node.class';
import {ForceCenter, forceCenter, ForceLink, forceLink, forceManyBody, forceSimulation} from 'd3';
import {FlBioNetworkGraph} from '../model/fl-bio-network-graph.class';
import {FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';
import {FlBioNetworkEngineConfig} from './fl-bio-network-engine.state';
import {Observable, Subject} from 'rxjs';

export interface FlBioNetworkSimulationProgressEvent {
  status: 'started' | 'ended' | 'progress';
  progress: number;
  duration?: number;
}

@Injectable()
export class FlBioNetworkSimulationState implements OnDestroy {

  private simulation: Simulation<FlBioNetworkNode, any>;
  private simulationEnded: boolean = false;

  private startTime: number;
  private tickCount: number = 0;
  private totalTickExpected: number = 0;

  private progress$: Subject<FlBioNetworkSimulationProgressEvent> = new Subject();


  public initSimulation(data: FlBioNetworkGraph, config: FlBioNetworkEngineConfig): Promise<void> {
    this.simulationEnded = false;
    this.markAsStarted(config);
    this.simulation = forceSimulation(data.getMetabolitesAndReactions())
      .force('link',
        this.getLinkForce(data, config)
        // .id((d: FlBioNetworkD3Node) => d.id)
      )
      .force('charge', this.getChargeForce(config))
      .force('center', this.getCenterForce(config))
      .alphaDecay(config.alphaDecay)
      .alphaMin(config.alphaMin)
      .velocityDecay(config.velocityDecay)
    ;

    this.simulation.on('tick', () => {
      this.newTick();
    });

    return new Promise((resolve) => {
      this.simulation.on('end', () => {
        this.endSimulation();
        resolve();
        this.markAsEnded();
      });
    });
  }

  public getLinkForce(data: FlBioNetworkGraph, config: FlBioNetworkEngineConfig): ForceLink<any, any> {
    return forceLink(data.links.filter(link => link.getLevel() !== FlBioNetworkMetaboliteLevel.COFACTOR)).distance(config.linkDistance);
  }

  public getChargeForce(config: FlBioNetworkEngineConfig): ForceManyBody<any> {
    return forceManyBody().strength(config.nodeStrength);
  }

  public getCenterForce(config: FlBioNetworkEngineConfig): ForceCenter<any> {
    return forceCenter().strength(config.centerStrength);
  }

  // disable all force so the user can move the node independently
  private endSimulation(): void {
    if (!this.simulationEnded) {
      // clear all forces, so the user can drag easily
      this.simulation.force('link', null);
      this.simulation.force('charge', null);
      this.simulation.force('center', null);
      this.simulation.force('collide', null);
      this.simulation.stop();
      this.simulationEnded = true;
    }
  }

  public markAsStarted(config: FlBioNetworkEngineConfig): void {

    this.startTime = new Date().getTime();
    this.tickCount = 0;

    // calculating the total number of tick expected
    let expectedTickCount = 0;
    let alpha = 1;
    while (alpha > config.alphaMin) {
      alpha = alpha * (1 - config.alphaDecay);
      expectedTickCount++;
    }
    this.totalTickExpected = expectedTickCount;

    this.progress$.next({status: 'started', progress: 0, duration: 0});
    console.log('[BioNetwork] start simulation. Expected tick count: ' + expectedTickCount);
  }

  public markAsEnded(): void {
    const duration = new Date().getTime() - this.startTime;
    this.progress$.next({status: 'ended', progress: 100, duration: duration});
    console.log(`[BioNetwork] end simulation ${duration / 1000} seconds. Tick count: ${this.tickCount}`);
  }

  public newTick(): void {
    this.tickCount++;
    const progress = (this.tickCount / this.totalTickExpected) * 100;

    this.progress$.next({status: 'progress', progress: progress});

    if (this.simulation) {
      console.log(`Alpha: ${this.simulation.alpha()}. Percent: ${progress}%`);
    }
  }

  public getProgress$(): Observable<FlBioNetworkSimulationProgressEvent> {
    return this.progress$.asObservable();
  }

  ngOnDestroy(): void {
    this.endSimulation();
    this.progress$.complete();
  }


}

