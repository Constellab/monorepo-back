import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA} from '@monorepo/front-core-lib';
import {BioxJob} from '../../../../model/entities/biox-job.entity';

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

  constructor(@Inject(FL_PORTAL_DATA) job: BioxJob) {
    // merge the current config with the default values
    this.config = job.process.configSpecs.mergeConfigWithDefault(job.config.params);
  }

  ngOnInit(): void {
  }

}
