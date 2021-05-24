import {Component, Inject, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/biox-resource.entity';
import {Observable} from 'rxjs';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-biox-resource-portal',
  templateUrl: './biox-resource-portal.component.html',
  styleUrls: ['./biox-resource-portal.component.scss']
})
export class BioxResourcePortalComponent implements OnInit {

  resource: BioxResource | Observable<BioxResource>;

  constructor(@Inject(FL_PORTAL_DATA) input: BioxResource | Observable<BioxResource>) {
    this.resource = input;
  }

  ngOnInit(): void {
  }
}
