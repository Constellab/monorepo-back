import {Component, OnDestroy, OnInit, Optional} from '@angular/core';
import {FlBioNetworkService, FlUpdateMetabolite} from '../../service/fl-bio-network.service';
import {FlBioNetworkNode} from '../../model/fl-bio-network-node.class';
import {FlSnackBarService} from '../../../fl-snack-bar/fl-snack-bar.service';
import {FlBioNetworkMetaboliteLevel} from '../../model/fl-bio-network.class';
import {Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {FlBioNetworkDrawerState} from '../../state/fl-bio-network-drawer.state';
import {FlBioNetworkNodeMetabolite} from '../../model/fl-bio-network-node-metabolite.class';

/**
 * Component to show the position of the node with possibility to save them to biota
 * if enable
 */
@Component({
  selector: 'fl-bio-network-node-positions',
  templateUrl: './fl-bio-network-node-positions.component.html',
  styleUrls: ['./fl-bio-network-node-positions.component.scss']
})
export class FlBioNetworkNodePositionsComponent implements OnInit, OnDestroy {

  node$: Observable<FlBioNetworkNode>;
  metabolites$: Observable<FlBioNetworkNodeMetabolite>;

  nodeLevel: FlBioNetworkMetaboliteLevel;

  serviceIsEnabled: boolean;

  metabolitesLevels = FlBioNetworkMetaboliteLevel;

  saveIsLoading: boolean = false;

  private subscription: Subscription;

  constructor(@Optional() private bioNetworkService: FlBioNetworkService,
              private drawerState: FlBioNetworkDrawerState,
              private snackBarService: FlSnackBarService) {
  }

  ngOnInit(): void {
    this.node$ = this.drawerState.getState$().pipe(
      map(state => state.selectedNode)
    );
    this.metabolites$ = this.node$.pipe(
      map(node => node instanceof FlBioNetworkNodeMetabolite ? node : null)
    );

    this.serviceIsEnabled = this.bioNetworkService?.enableSave() ?? false;

    this.subscription = this.node$.subscribe(node => this.nodeLevel = node.getLevel());
  }

  savePositions(metabolite: FlBioNetworkNodeMetabolite): void {
    if (this.bioNetworkService && !this.saveIsLoading) {
      this.saveIsLoading = true;

      const updateMetabolite: FlUpdateMetabolite = {
        chebi_id: metabolite.data.chebi_id,
        cluster_id: metabolite.cluster.clusterId,
        x: metabolite.x,
        y: metabolite.y,
        level: this.nodeLevel
      };

      this.bioNetworkService.saveNodePosition(updateMetabolite).subscribe({
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

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
