import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {
  FlBioNetwork,
  FlBioNetworkPathwaySelection,
  FlPathwayDatabase,
  flPathwayDatabases
} from '../../model/fl-bio-network.class';
import {MatSelectChange} from '@angular/material/select';
import {Observable} from 'rxjs';
import {FlBioNetworkOptionsState} from '../../state/fl-bio-network-options.state';

/**
 * Component to select the config of the pathway before showing it
 */
@Component({
  selector: 'fl-bio-network-config',
  templateUrl: './fl-bio-network-config.component.html',
  styleUrls: ['./fl-bio-network-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlBioNetworkConfigComponent implements OnInit {

  networks: FlBioNetwork[] | null;
  networkName: string;

  database: FlPathwayDatabase;
  pathwayDatabases: FlPathwayDatabase[] = flPathwayDatabases;

  pathways$: Observable<FlBioNetworkPathwaySelection[]>;
  pathwaysAllSelected: boolean = false;
  pathwaysAllColored: boolean = false;

  constructor(private state: FlBioNetworkState, private optionState: FlBioNetworkOptionsState) {
  }

  ngOnInit(): void {
    // if there is multiple network we set the list to add a mat-select
    if (this.state.networks.length > 1) {
      this.networks = this.state.networks;
    }

    this.networkName = this.state.getSelectedNetwork().name;
    this.database = this.state.getDatabase();
    this.pathways$ = this.state.getPathways$();
  }

  onNetworkChange(change: MatSelectChange): void {
    this.state.selectNetwork(change.value);
  }

  onDatabaseChange(change: MatSelectChange): void {
    this.state.selectDatabase(change.value);
  }

  selectAllPathwayChange(select: boolean): void {
    this.pathwaysAllSelected = select;
    if (select) {
      this.state.selectAllPathways();
    } else {
      this.state.unselectAllPathways();
    }
  }

  togglePathwayColor(pathwayDetail: FlBioNetworkPathwaySelection): void {
    pathwayDetail.highlighted = !pathwayDetail.highlighted;

    const highlightedPathways: FlBioNetworkPathwaySelection[] = this.getSelectedPathways()
      .filter(pathway => pathway.highlighted);
    this.optionState.setColoredPathways(highlightedPathways);
  }


  toggleAllPathwayColors(): void {
    this.pathwaysAllColored = !this.pathwaysAllColored;
    const selectedPathways: FlBioNetworkPathwaySelection[] = this.getSelectedPathways();
    selectedPathways.forEach(pathway => pathway.highlighted = this.pathwaysAllColored);

    if (this.pathwaysAllColored) {
      this.optionState.setColoredPathways(selectedPathways);
    } else {
      this.optionState.setColoredPathways([]);
    }
  }

  private getSelectedPathways(): FlBioNetworkPathwaySelection[] {
    return this.state.getCurrentPathways().filter(
      pathway => pathway.selected
    );
  }

  selectionChanged(pathway: FlBioNetworkPathwaySelection): void {
    // when unselecting the pathway, force the highlight to false
    if (!pathway.selected) {
      pathway.highlighted = false;
    }
    this.state.emitPathwaySelectionChange();
  }
}
