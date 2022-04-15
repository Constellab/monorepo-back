import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {MatSliderChange} from '@angular/material/slider';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {filter} from 'rxjs/operators';
import {FlBioNetworkD3} from '../../model/fl-bio-network-d3.class';
import {FlBioNetworkOptionsState} from '../../state/fl-bio-network-options.state';
import {FlBioNetworkMetaboliteLevel} from '../../model/fl-bio-network.class';

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

  sliderValue: number = 0;
  linksMaxAbsValue: number;

  // if true the link colors switch to logarithm
  linkColorLogarithm: boolean = false;
  // showCofactor: boolean = false;
  showMinors: boolean = false;
  showText: boolean = false;

  constructor(private cdr: ChangeDetectorRef,
              private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState,
              private optionState: FlBioNetworkOptionsState) {
  }

  ngOnInit(): void {
    const options = this.optionState.getCurrentOptions();
    this.linkColorLogarithm = options.linkColorScale === 'logarithm';
    // this.showCofactor = this.rendererState.getShowCofactors();
    this.showMinors = options.visibleLevels.includes(FlBioNetworkMetaboliteLevel.MINOR);
    this.showText = options.showTexts;
    this.state.getChartData$().subscribe(
      chartData => this.onNewData(chartData)
    );

    // clear the slider every time the selection is not a linkByValue
    this.selectionState.getSelectionMode$().pipe(
      filter(selection => selection.mode !== 'linkByValue')).subscribe(
      () => this.resetSlider()
    );
  }

  private onNewData(chartData: FlBioNetworkD3): void {
    if (chartData) {
      this.linksMaxAbsValue = Math.trunc(chartData.getLinksMaxAbsoluteValue());
      this.isReady = true;
    } else {
      this.linksMaxAbsValue = 0;
      this.isReady = false;

    }
    this.cdr.markForCheck();
  }


  setLinksColors(): void {
    this.optionState.setLinkColorMode(this.linkColorLogarithm ? 'logarithm' : 'linear');
  }

  toggleShowTexts(): void {
    this.optionState.setShowText(this.showText);
  }

  toggleShowMinors(): void {
    this.optionState.setVisibleLevels(this.showMinors ?
      [FlBioNetworkMetaboliteLevel.MAJOR, FlBioNetworkMetaboliteLevel.MINOR] : [FlBioNetworkMetaboliteLevel.MAJOR]);
  }

  // set opacity to 0.1 to link where abs value is lower than slider value
  hideLinkLowerThan(change: MatSliderChange): void {
    this.selectionState.hideLinkLowerThan(change.value);
  }

  private resetSlider(): void {
    // also reset slider
    this.sliderValue = 0;

    this.cdr.markForCheck();
  }


  exportAllNetwork(): void {
    this.state.downloadNetworkJson();
  }


}
