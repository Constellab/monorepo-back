import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {SelectionModel} from '@angular/cdk/collections';
import {FlBioNetwork, FlBioNetworkPathwayDetail, FlPathwayDatabase, flPathwayDatabases} from '../../model/fl-bio-network.class';
import {Observable} from 'rxjs';
import {MatSelectChange} from '@angular/material/select';

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

  pathways: Observable<FlBioNetworkPathwayDetail[]>;

  // handle the selection per id
  selection: SelectionModel<string>;

  pathwayDatabases: FlPathwayDatabase[] = flPathwayDatabases;

  constructor(private state: FlBioNetworkState) {
  }

  ngOnInit(): void {
    // if there is multiple network we set the list to add a mat-select
    if (this.state.networks.length > 1) {
      this.networks = this.state.networks;
    }

    this.networkName = this.state.getSelectedNetwork().name;
    this.database = this.state.getDatabase();
    this.selection = this.state.selectedPathways;
    this.pathways = this.state.getPathwayList$();
  }

  onNetworkChange(change: MatSelectChange): void {
    this.state.selectNetwork(change.value);
  }

  onDatabaseChange(change: MatSelectChange): void {
    this.state.selectDatabase(change.value);
  }
}
