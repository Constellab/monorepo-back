import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {FlBioNetworkClusterSelection, FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';

/**
 * Type of scale to use to color link based on its value
 * normal --> normal linear scale
 * log --> logarithmic scale
 */
export type FlBioNetworkLinkColorScale = 'linear' | 'log2' | 'log10' | 'threshold-75' | 'threshold-95';

export type FlBioNetworkOptionsAction = 'init' | 'toggleText' | 'toggleGrid' | 'toggleArrow' | 'toggleParticles'
  | 'updateVisibilityLevel' | 'color';

/**
 * Object containing options visible element on the pathways
 */
export type FlBioNetworkOptions = {
  action: FlBioNetworkOptionsAction;
  visibleLevels: FlBioNetworkMetaboliteLevel[];
  showTexts: boolean;
  showGrid: boolean;
  showArrows: boolean;
  showParticles: boolean;
  linkColorScale: FlBioNetworkLinkColorScale;
  coloredClusters: FlBioNetworkClusterSelection[];
};


@Injectable()
export class FlBioNetworkOptionsState implements OnDestroy {

  private option$: BehaviorSubject<FlBioNetworkOptions> = new BehaviorSubject({
    action: 'init',
    visibleLevels: [FlBioNetworkMetaboliteLevel.MAJOR],
    showTexts: false,
    showGrid: false,
    showArrows: false,
    showParticles: false,
    linkColorScale: 'linear',
    coloredClusters: [],
  });

  constructor() {
  }

  public init(): void {
    // clear the pathway selection when the state is reset
    this.emitConfig('init', {coloredClusters: []});
  }

  //////////////////////////////// VISIBLE  OPTIONS ////////////////////////////////

  public setVisibleLevels(visibleLevels: FlBioNetworkMetaboliteLevel[]): void {
    this.emitConfig('updateVisibilityLevel', {visibleLevels: visibleLevels});
  }

  public setShowText(showText: boolean): void {
    this.emitConfig('toggleText', {showTexts: showText});
  }

  public setShowGrid(showGrid: boolean): void {
    this.emitConfig('toggleGrid', {showGrid: showGrid});
  }

  public setShowArrows(showArrows: boolean): void {
    this.emitConfig('toggleArrow', {showArrows: showArrows});
  }

  public setShowParticles(showParticles: boolean): void {
    this.emitConfig('toggleParticles', {showParticles: showParticles});
  }


  //////////////////////////////// COLOR OPTIONS ////////////////////////////////


  public setLinkColorMode(mode: FlBioNetworkLinkColorScale): void {
    this.emitConfig('color', {linkColorScale: mode});
  }

  public setColoredClusters(clusters: FlBioNetworkClusterSelection[]): void {
    this.emitConfig('color', {coloredClusters: clusters});
  }

  //////////////////////////////// OPTIONS ////////////////////////////////

  public getCurrentOptions(): FlBioNetworkOptions {
    return this.option$.value;
  }

  public getOptions$(): Observable<FlBioNetworkOptions> {
    return this.option$.asObservable();
  }

  private emitConfig(action: FlBioNetworkOptionsAction, config: Partial<FlBioNetworkOptions>): void {
    this.option$.next(Object.assign({}, this.option$.value, config, {action: action}));
  }

  ngOnDestroy(): void {
    this.option$.complete();
  }


}
