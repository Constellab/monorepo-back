import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlPathwayState} from '../../state/fl-pathway.state';
import {SelectionModel} from '@angular/cdk/collections';
import {FlPathway, FlPathwayDatabase, flPathwayDatabases, FlPathwayReactionPathwayDetail} from '../../model/fl-pathway.class';
import {Observable} from 'rxjs';
import {MatSelectChange} from '@angular/material/select';

/**
 * Component to select the config of the pathway before showing it
 */
@Component({
  selector: 'fl-pathway-config',
  templateUrl: './fl-pathway-config.component.html',
  styleUrls: ['./fl-pathway-config.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlPathwayConfigComponent implements OnInit {

  networks: FlPathway[] | null;

  networkName: string;
  database: FlPathwayDatabase;

  subPathways: Observable<FlPathwayReactionPathwayDetail[]>;

  // handle the selection per id
  selection: SelectionModel<string>;

  pathwayDatabases: FlPathwayDatabase[] = flPathwayDatabases;

  constructor(private state: FlPathwayState) {
  }

  ngOnInit(): void {
    // if there is multiple network we set the list to add a mat-select
    if (this.state.networks.length > 1) {
      this.networks = this.state.networks;
    }

    this.networkName = this.state.getSelectedNetwork().name;
    this.database = this.state.getDatabase();
    this.selection = this.state.selectedPathways;
    this.subPathways = this.state.getPathwayList$();
  }

  onNetworkChange(change: MatSelectChange): void {
    this.state.selectNetwork(change.value);
  }

  onDatabaseChange(change: MatSelectChange): void {
    this.state.selectDatabase(change.value);
  }
}
