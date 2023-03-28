import {Component, Input, OnInit} from '@angular/core';
import {CaLabConfig} from '../../../../model/entities/lab/ca-lab-config.class';
import {CaBrickVersionComplete} from '../../../../model/entities/ca-brick.class';
import {CaCommunityHelper} from '../../../../utils/ca-community.helper';

@Component({
  selector: 'ca-lab-config',
  templateUrl: './ca-lab-config.component.html',
  styleUrls: ['./ca-lab-config.component.scss']
})
export class CaLabConfigComponent implements OnInit {

  @Input() labConfig: CaLabConfig;

  constructor() {
  }

  ngOnInit(): void {
  }


  getBrickLink(brickVersion: CaBrickVersionComplete): string {
    return CaCommunityHelper.getBrickUrl(brickVersion.brick.name, brickVersion.version);
  }
}
