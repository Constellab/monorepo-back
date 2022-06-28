import {Component, Input, OnInit} from '@angular/core';
import {CaBrickVersion} from '../../../../model/entities/ca-brick.class';

/**
 * Simple component to show brick version detail
 */
@Component({
  selector: 'ca-brick-version-detail',
  templateUrl: './ca-brick-version-detail.component.html',
  styleUrls: ['./ca-brick-version-detail.component.scss']
})
export class CaBrickVersionDetailComponent implements OnInit {

  @Input() brickName: string;
  @Input() brickVersion: CaBrickVersion;

  constructor() { }

  ngOnInit(): void {
  }
}
