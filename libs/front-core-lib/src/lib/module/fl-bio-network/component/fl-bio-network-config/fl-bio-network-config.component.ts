import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {FlBioNetworkState} from '../../state/fl-bio-network.state';
import {FlBioNetwork} from '../../model/fl-bio-network.class';
import {MatSelectChange} from '@angular/material/select';
import {FlDialogService} from '../../../fl-dialog/fl-dialog.service';
import {FlBioNetworkLegendComponent} from '../fl-bio-network-legend/fl-bio-network-legend.component';

/**
 * Component to select the network and the pathways database
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

  // database: FlPathwayDatabase;
  // pathwayDatabases: FlPathwayDatabase[] = flPathwayDatabases;

  constructor(private state: FlBioNetworkState,
              private dialogService: FlDialogService) {
  }

  ngOnInit(): void {
    // if there is multiple network we set the list to add a mat-select
    if (this.state.networks.length > 1) {
      this.networks = this.state.networks;
    }

    this.networkName = this.state.getSelectedNetwork().name;
    // this.database = this.state.getDatabase();
  }

  onNetworkChange(change: MatSelectChange): void {
    this.state.selectNetwork(change.value);
  }

  // onDatabaseChange(change: MatSelectChange): void {
  //   this.state.selectDatabase(change.value);
  // }

  openLegendDialog(): void {
    this.dialogService.openSmallDialog(FlBioNetworkLegendComponent);
  }

}
