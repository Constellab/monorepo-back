import {Component, Inject, OnInit} from '@angular/core';
import {UnconvertedResource} from '../../../../model/entities/resource/biox-resource.entity';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-biox-resource-portal',
  templateUrl: './biox-resource-portal.component.html',
  styleUrls: ['./biox-resource-portal.component.scss']
})
export class BioxResourcePortalComponent implements OnInit {

  resource: UnconvertedResource;

  constructor(@Inject(FL_PORTAL_DATA) input: UnconvertedResource) {
    this.resource = input;
  }

  ngOnInit(): void {
  }
}
