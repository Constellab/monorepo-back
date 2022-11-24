import {Component, Input, OnInit} from '@angular/core';
import {CaBucketRegion} from '../../../../model/entities/ca-object-storage.class';

@Component({
  selector: 'ca-bucket-region-inline',
  templateUrl: './ca-bucket-region-inline.component.html',
  styleUrls: ['./ca-bucket-region-inline.component.scss']
})
export class CaBucketRegionInlineComponent implements OnInit {

  @Input() region: CaBucketRegion;

  constructor() {
  }

  ngOnInit(): void {
  }

}
