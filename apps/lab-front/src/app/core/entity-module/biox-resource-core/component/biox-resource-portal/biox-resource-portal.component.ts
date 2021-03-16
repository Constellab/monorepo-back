import {Component, Inject, OnInit} from '@angular/core';
import {BioxResourceVM} from '../../../../model/entities/biox-resource.entity';
import {Observable} from 'rxjs';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

@Component({
  selector: 'gen-biox-resource-portal',
  templateUrl: './biox-resource-portal.component.html',
  styleUrls: ['./biox-resource-portal.component.scss']
})
export class BioxResourcePortalComponent implements OnInit {

  resource: BioxResourceVM;

  constructor(@Inject(FL_PORTAL_DATA) input: BioxResourceVM | Observable<BioxResourceVM>) {
    if (input instanceof Observable) {
      input.subscribe(
        resources => this.resource = resources
      );
    } else {
      this.resource = input;
    }
  }

  ngOnInit(): void {
  }

}
