import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {filter} from 'rxjs/operators';
import {FlBioNetworkGraph} from '../../model/fl-bio-network-graph.class';
import {FlBioNetworkOptionsState, FlBioNetworkParticleColorScale} from '../../state/fl-bio-network-options.state';
import {FlBioNetworkMetaboliteLevel} from '../../model/fl-bio-network.class';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {MatSliderChange} from '@angular/material/slider';

/**
 * Component inside the {@link FlBioNetworkComponent} to show the quick actions
 */
@Component({
  selector: 'fl-bio-network-action-bar',
  templateUrl: './fl-bio-network-action-bar.component.html',
  styleUrls: ['./fl-bio-network-action-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkActionBarComponent implements OnInit {

  isReady: boolean = false;

  fluxThreshold: number = 0;
  maxFluxValue: number;

  // mode for the color of the particles
  particlesColorMode: FlBioNetworkParticleColorScale = 'linear';
  // showCofactor: boolean = false;
  showMinors: boolean = false;
  showText: boolean = false;
  showGrid: boolean = false;
  showArrows: boolean = false;
  showParticles: boolean = false;
  particleSize: number;
  particleDensityThreshold: number;
  particleSpeedThreshold: number;

  constructor(private cdr: ChangeDetectorRef,
              private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState,
              private optionState: FlBioNetworkOptionsState) {
  }

  ngOnInit(): void {
    const options = this.optionState.getCurrentOptions();
    this.particlesColorMode = options.particleColorScale;
    // this.showCofactor = this.rendererState.getShowCofactors();
    this.showMinors = options.visibleLevels.includes(FlBioNetworkMetaboliteLevel.MINOR);
    this.showText = options.showTexts;
    this.showGrid = options.showGrid;
    this.showArrows = options.showArrows;
    this.showParticles = options.showParticles;
    this.particleSize = options.particleSize;
    this.particleDensityThreshold = options.particleDensityThreshold;
    this.particleSpeedThreshold = options.particleSpeedThreshold;

    this.state.getChartData$().subscribe(
      chartData => this.onNewData(chartData)
    );

    // clear the slider every time the selection is not a linkByValue
    this.selectionState.getSelectionMode$().pipe(
      filter(selection => selection.mode !== 'linkByValue')).subscribe(
      () => this.resetSlider()
    );
  }

  private onNewData(chartData: FlBioNetworkGraph): void {
    if (chartData) {
      this.maxFluxValue = Math.trunc(chartData.getLinksMaxAbsoluteValue());
      this.isReady = true;
    } else {
      this.maxFluxValue = 0;
      this.isReady = false;

    }
    this.cdr.markForCheck();
  }


  setParticlesColors(): void {
    this.optionState.setParticleColorMode(this.particlesColorMode);
  }

  toggleShowTexts(): void {
    this.optionState.setShowText(this.showText);
  }

  toggleShowGrid(): void {
    this.optionState.setShowGrid(this.showGrid);
  }

  toggleShowArrows(): void {
    this.optionState.setShowArrows(this.showArrows);
  }

  toggleShowParticles(): void {
    this.optionState.setShowParticles(this.showParticles);
  }

  particleSizeChange(): void {
    this.optionState.setParticleSize(this.particleSize);
  }

  toggleShowMinors(): void {
    this.optionState.setVisibleLevels(this.showMinors ?
      [FlBioNetworkMetaboliteLevel.MAJOR, FlBioNetworkMetaboliteLevel.MINOR] : [FlBioNetworkMetaboliteLevel.MAJOR]);
  }

  particleDensityThresholdChange(): void {
    this.optionState.setParticleDensityThreshold(this.particleDensityThreshold);
  }

  particleSpeedThresholdChange(): void {
    this.optionState.setParticleSpeedThreshold(this.particleSpeedThreshold);
  }

  // set opacity to 0.1 to link where abs value is lower than slider value
  fluxThresholdChange(change: MatSliderChange): void {
    this.selectionState.fluxThresholdOpacity(change.value);
  }

  private resetSlider(): void {
    this.fluxThreshold = 0;

    this.cdr.markForCheck();
  }


  exportAllNetwork(): void {
    this.state.downloadNetworkJson();
  }


}
