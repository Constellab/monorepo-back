import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetwork, FlBioNetworkPathwaySelection, FlPathwayDatabase, flPathwayDatabases} from '../../model/fl-bio-network.class';
import {MatSelectChange} from '@angular/material/select';
import {Observable} from 'rxjs';
import {FlBioNetworkSelectionState} from '../../state/fl-bio-network-selection.state';
import {ClHelpService} from '@monorepo/core-lib';

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

  constructor(private state: FlBioNetworkState, private selectionState: FlBioNetworkSelectionState) {
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

  togglePathwayHighlight(pathwayDetail: FlBioNetworkPathwaySelection, event: MouseEvent): void {
    ClHelpService.stopEventPropagation(event);
    this.selectionState.togglePathwayHighlight(pathwayDetail);
  }

  // todo améliorer la gestion des pathways coloré
  // faire un state ? Garer le pathway coloré quand on en ajout un autre ?
  toggleAllPathwayHighlight(): void {
    const selectedPathways: FlBioNetworkPathwaySelection[] = this.state.getCurrentPathways().filter(
      pathway => pathway.selected
    );
    this.selectionState.toggleAllPathwayHighlight(selectedPathways);
  }

  selectionChanged(pathway: FlBioNetworkPathwaySelection): void {
    // when unselecting the pathway, force the highlight to false
    if (!pathway.selected) {
      pathway.highlighted = false;
    }
    this.state.emitPathwaySelectionChange();
  }
}
