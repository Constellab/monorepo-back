import {Component, OnInit} from '@angular/core';
import {Observable} from 'rxjs';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetworkOptionsState} from '../../state/fl-bio-network-options.state';
import {MatSelectChange} from '@angular/material/select';
import {FlBioNetworkClusterSelection} from '../../model/fl-bio-network.class';

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
  clustersAllColored: boolean = false;


  constructor(private state: FlBioNetworkState, private optionState: FlBioNetworkOptionsState) {
  }

  ngOnInit(): void {
    // if there is multiple network we set the list to add a mat-select
    this.clusters$ = this.state.getClusters$();
  }

  onNetworkChange(change: MatSelectChange): void {
    this.state.selectNetwork(change.value);
  }

  selectAllClustersChange(select: boolean): void {
    this.clustersAllSelected = select;
    if (select) {
      this.state.selectAllClusters();
    } else {
      this.state.unselectAllClusters();
    }
  }

  toggleClusterColor(cluster: FlBioNetworkClusterSelection): void {
    cluster.highlighted = !cluster.highlighted;

    const highlightedClusters: FlBioNetworkClusterSelection[] = this.getSelectedClusters()
      .filter(cluster => cluster.highlighted);
    this.optionState.setColoredClusters(highlightedClusters);
  }


  toggleAllClusterColors(): void {
    this.clustersAllColored = !this.clustersAllColored;
    const selectedClusters: FlBioNetworkClusterSelection[] = this.getSelectedClusters();
    selectedClusters.forEach(cluster => cluster.highlighted = this.clustersAllColored);

    if (this.clustersAllColored) {
      this.optionState.setColoredClusters(selectedClusters);
    } else {
      this.optionState.setColoredClusters([]);
    }
  }

  private getSelectedClusters(): FlBioNetworkClusterSelection[] {
    return this.state.getCurrentClusters().filter(
      cluster => cluster.selected
    );
  }

  selectionChanged(cluster: FlBioNetworkClusterSelection): void {
    // when unselecting the pathway, force the highlight to false
    if (!cluster.selected) {
      cluster.highlighted = false;
    }
    this.state.emitClustersSelectionChange();
  }

}
