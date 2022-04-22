import {Component, OnInit} from '@angular/core';
import {FlBioNetwork} from '@monorepo/front-core-lib';
import {RvResourceViewDirective} from '../../model/rv-resource-view.directive';
import {RvResourceViewNetwork} from '../../model/rv-resource-view.class';

/**
 * Display the resource as a network pathway
 */
@Component({
  selector: 'rv-view-network',
  templateUrl: './rv-view-network.component.html',
  styleUrls: ['./rv-view-network.component.scss']
})
export class RvViewNetworkComponent extends RvResourceViewDirective<RvResourceViewNetwork> implements OnInit {

  networks: FlBioNetwork | FlBioNetwork[];

  error: boolean;

  ngOnInit(): void {
    this.networks = this.view.data;
    this.error = false;
  }
}
