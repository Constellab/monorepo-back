import {Component, Input, OnInit, Optional} from '@angular/core';
import {FlBioNetworkService} from '../../service/fl-bio-network.service';
import {FlBioNetworkNode} from '../../model/fl-bio-network-node.class';
import {FlSnackBarService} from '../../../fl-snack-bar/fl-snack-bar.service';

/**
 * Component to show the position of the node with possibility to save them to biota
 * if enable
 */
@Component({
  selector: 'fl-bio-network-node-positions',
  templateUrl: './fl-bio-network-node-positions.component.html',
  styleUrls: ['./fl-bio-network-node-positions.component.scss']
})
export class FlBioNetworkNodePositionsComponent implements OnInit {

  @Input() node: FlBioNetworkNode;

  serviceIsEnabled: boolean;

  saveIsLoading: boolean = false;

  constructor(@Optional() private bioNetworkService: FlBioNetworkService,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.serviceIsEnabled = this.bioNetworkService?.enableSave() ?? false;
  }

  savePositions(): void {
    if (this.bioNetworkService && !this.saveIsLoading) {
      this.saveIsLoading = true;

      this.bioNetworkService.saveNodePosition(this.node.data.id, this.node.getCoords()).subscribe({
        next: result => this.savePositionsSuccess(result),
        error: () => this.saveIsLoading = false
      });
    }
  }

  private savePositionsSuccess(result: boolean): void {
    if (result) {
      this.snackBarService.openSuccessMessage({
        text: 'flBioNetwork.save_positions_to_biota_success',
        translateText: true
      });
    }
    this.saveIsLoading = false;
  }

}
