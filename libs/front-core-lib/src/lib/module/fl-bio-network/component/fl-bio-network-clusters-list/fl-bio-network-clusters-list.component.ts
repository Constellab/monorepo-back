import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkOptionsState} from '../../state/fl-bio-network-options.state';
import {FlBioNetworkClusterSelection} from '../../model/fl-bio-network.class';
import {MatSelectChange} from '@angular/material/select';

/**
 * Show the list of cluster with possibility to select them and color them
 */
@Component({
  selector: 'fl-bio-network-clusters-list',
  templateUrl: './fl-bio-network-clusters-list.component.html',
  styleUrls: ['./fl-bio-network-clusters-list.component.scss']
})
export class FlBioNetworkClustersListComponent implements OnInit {

  clusters$: Observable<FlBioNetworkClusterSelection[]>;
  clustersAllSelected: boolean = false;


  constructor(private state: FlBioNetworkState, private optionState: FlBioNetworkOptionsState) {
  }

  ngOnInit(): void {
    // if there is multiple network we set the list to add a mat-select
    this.clusters$ = this.state.getClusters$();
  }

  onNetworkChange(change: MatSelectChange): void {
    this.state.selectNetwork(change.value);
  }


  /////////////////////// CLUSTER SELECTION ///////////////////////

  selectionChanged(cluster: FlBioNetworkClusterSelection): void {
    // when unselecting the pathway, force the highlight to false
    if (!cluster.selected) {
      cluster.highlighted = false;
    }
    this.state.emitClustersSelectionChange();
    this.emitClusterColored();
  }

  selectAllClustersChange(select: boolean): void {
    this.clustersAllSelected = select;
    if (select) {
      this.state.selectAllClusters();
    } else {
      this.state.unselectAllClusters();
    }

    this.emitClusterColored();
  }

  private getSelectedClusters(): FlBioNetworkClusterSelection[] {
    return this.state.getCurrentClusters().filter(
      cluster => cluster.selected
    );
  }

  ////////////////// COLOR //////////////////

  toggleClusterColor(cluster: FlBioNetworkClusterSelection): void {
    cluster.highlighted = !cluster.highlighted;

    this.emitClusterColored();
  }


  toggleAllClusterColors(): void {
    const selectedClusters: FlBioNetworkClusterSelection[] = this.getSelectedClusters();

    if (!this.clustersAllColored) {
      selectedClusters.forEach(cluster => cluster.highlighted = true);
    } else {
      selectedClusters.forEach(cluster => cluster.highlighted = false);
    }
    this.emitClusterColored();
  }

  private emitClusterColored(): void {
    this.optionState.setColoredClusters(this.getSelectedClusters().filter(cluster => cluster.highlighted));
  }

  get clustersAllColored(): boolean {
    const selectedClusters: FlBioNetworkClusterSelection[] = this.getSelectedClusters();
    return selectedClusters.length > 0 && selectedClusters.every(cluster => cluster.highlighted);
  }




}
