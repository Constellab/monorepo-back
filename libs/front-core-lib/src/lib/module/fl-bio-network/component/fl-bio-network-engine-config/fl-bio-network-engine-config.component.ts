import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {FlBioNetworkEngineConfig, FlBioNetworkEngineState} from '../../state/fl-bio-network-engine.state';

@Component({
  selector: 'fl-bio-network-engine-config',
  templateUrl: './fl-bio-network-engine-config.component.html',
  styleUrls: ['./fl-bio-network-engine-config.component.scss']
})
export class FlBioNetworkEngineConfigComponent implements OnInit, OnDestroy {

  formGp: FormGroup<FlBioNetworkEngineConfig>;

  private subscription: Subscription;

  constructor(private engineState: FlBioNetworkEngineState) {
  }

  ngOnInit(): void {
    this.formGp = new FormBuilder().group<FlBioNetworkEngineConfig>({
      liveDrawing: [null],
      alphaMin: [null],
      alphaDecay: [null],
      velocityDecay: [null],
      ignoreNodePositions: [null],
      nodeStrength: [null],
      centerStrength: [null],
      linkDistance: [null],
    });

    this.formGp.patchValue(this.engineState.engineConfig);

    // update the engine config when the form changes
    this.subscription = this.formGp.valueChanges.subscribe(
      (config: FlBioNetworkEngineConfig) => this.engineState.engineConfig = config
    );
  }


  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }


}
