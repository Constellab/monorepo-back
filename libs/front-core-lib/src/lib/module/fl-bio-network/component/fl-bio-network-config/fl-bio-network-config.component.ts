import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {SelectionModel} from '@angular/cdk/collections';
import {FlBioNetwork, FlBioNetworkPathwayDetail, FlPathwayDatabase, flPathwayDatabases} from '../../model/fl-bio-network.class';
import {MatSelectChange} from '@angular/material/select';
import {Observable} from 'rxjs';

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

  pathways$: Observable<FlBioNetworkPathwayDetail[]>;
  // handle the selection per id
  pathwaySelection: SelectionModel<string>;
  pathwaysAllSelected: boolean = false;

  constructor(private state: FlBioNetworkState) {
  }

  ngOnInit(): void {
    // if there is multiple network we set the list to add a mat-select
    if (this.state.networks.length > 1) {
      this.networks = this.state.networks;
    }

    this.networkName = this.state.getSelectedNetwork().name;
    this.database = this.state.getDatabase();
    this.pathwaySelection = this.state.selectedPathways;
    this.pathways$ = this.state.getPathwayList$();
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


}
