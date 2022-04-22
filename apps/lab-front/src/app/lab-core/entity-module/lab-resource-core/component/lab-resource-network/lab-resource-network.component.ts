import {Component, OnInit} from '@angular/core';
import {FlBioNetwork} from '@monorepo/front-core-lib';
import {LabResourceViewDirective} from '../../model/lab-resource-view.directive';
import {LabResourceViewNetwork} from '../../../../model/entities/resource/lab-resource-view.entity';

/**
 * Display the resource as a network pathway
 */
@Component({
  selector: 'lab-resource-network',
  templateUrl: './lab-resource-network.component.html',
  styleUrls: ['./lab-resource-network.component.scss']
})
export class LabResourceNetworkComponent extends LabResourceViewDirective<LabResourceViewNetwork> implements OnInit {

  networks: FlBioNetwork | FlBioNetwork[];

  error: boolean;

  ngOnInit(): void {
    this.networks = this.view.data;
    this.error = false;
  }
}
