import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkRendererState} from '../../state/fl-bio-network-renderer.state';
import {MatSliderChange} from '@angular/material/slider';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {filter} from 'rxjs/operators';
import {FlFileHelper} from '../../../../service/fl-file.helper';
import {FlBioxNetworkD3} from '../../model/fl-bio-network-d3.class';
import {FlBioNetwork} from '../../model/fl-bio-network.class';

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
  showCofactor: boolean = false;

  constructor(private cdr: ChangeDetectorRef,
              private state: FlBioNetworkState,
              private selectionState: FlBioNetworkSelectionState,
              private rendererState: FlBioNetworkRendererState) {
  }

  ngOnInit(): void {
    this.linkColorLogarithm = this.rendererState.getLinkColorLogarithm();
    this.showCofactor = this.rendererState.getShowCofactor();
    this.state.getChartData$().subscribe(
      chartData => this.onNewData(chartData)
    );

    // clear the slider every time the selection is not a linkByValue
    this.selectionState.getSelectionMode$().pipe(
      filter(selection => selection.mode !== 'linkByValue')).subscribe(
      () => this.resetSlider()
    );
  }

  private onNewData(chartData: FlBioxNetworkD3): void {
    if (chartData) {
      this.linksMaxAbsValue = chartData.getLinksMaxAbsoluteValue();
      this.isReady = true;
    } else {
      this.linksMaxAbsValue = 0;
      this.isReady = false;

    }

    this.cdr.markForCheck();
  }


  setLinksColors(): void {
    this.rendererState.setLinksColors(this.linkColorLogarithm);
  }

  toggleShowCofactor(): void {
    this.rendererState.toggleCofactors(this.showCofactor);
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
    const network: FlBioNetwork = this.rendererState.exportAllNetwork();

    // TODO to remove, this is temporary to export a view object
    const viewObject = {
      type: 'network-view',
      data: network
    }

    FlFileHelper.downloadJsonFile(viewObject, 'network.json');
  }


}
