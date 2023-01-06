import {Component, Input, OnInit} from '@angular/core';
import {CaLabConfig} from '../../../../model/entities/lab/ca-lab-config.class';
import {environment} from '../../../../../../environments/ca-environment';
import {CaBrickVersionComplete} from '../../../../model/entities/ca-brick.class';

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
    const brickName: string = brickVersion.brick.name;
    const majorString: string = 'v' + brickVersion.version.split('.')[0];
    return `${environment.hubUrl}bricks/${brickName}/${majorString}`;
  }
}
