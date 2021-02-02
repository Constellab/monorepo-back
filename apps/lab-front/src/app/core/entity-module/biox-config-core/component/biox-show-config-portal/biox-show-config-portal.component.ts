import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';

/**
 * Simple dialog to show a config json
 */
@Component({
  selector: 'gen-biox-show-config-portal',
  templateUrl: './biox-show-config-portal.component.html',
  styleUrls: ['./biox-show-config-portal.component.scss']
})
export class BioxShowConfigPortalComponent implements OnInit {

  config: any;

  constructor(@Inject(FL_PORTAL_DATA) config: any) {
    this.config = config;
  }

  ngOnInit(): void {
  }

}
