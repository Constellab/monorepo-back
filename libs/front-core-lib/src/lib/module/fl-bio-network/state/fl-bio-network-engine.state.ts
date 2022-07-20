import {Injectable} from '@angular/core';
import {ClHelpService} from '@monorepo/core-lib';


export interface FlBioNetworkEngineConfig {
  // if true, the network is drawn live, if false it is calculated then draw
  liveDrawing: boolean;
  ignoreNodePositions: boolean;

  alphaMin: number;
  alphaDecay: number;
  velocityDecay: number;
  nodeStrength: number;
  centerStrength: number;
  linkDistance: number;
}

const FL_BIO_NETWORK_DEFAULT_ENGINE_CONFIG: FlBioNetworkEngineConfig = {
  liveDrawing: false,
  ignoreNodePositions: false,

  alphaMin: 0.001,
  alphaDecay: 0.0228,
  velocityDecay: 0.4,
  nodeStrength: -30,
  centerStrength: 1,
  linkDistance: 30,
};


@Injectable()
export class FlBioNetworkEngineState {

  private _engineConfig: FlBioNetworkEngineConfig = FL_BIO_NETWORK_DEFAULT_ENGINE_CONFIG;

  get engineConfig(): FlBioNetworkEngineConfig {
    return ClHelpService.deepClone(this._engineConfig);
  }

  set engineConfig(value: FlBioNetworkEngineConfig) {
    this._engineConfig = ClHelpService.deepClone(value);
  }
}
