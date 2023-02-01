import {Component, Input, OnInit} from '@angular/core';
import {CaBucketFull} from '../../../../model/entities/ca-object-storage.class';

/**
 * Small component to show information about a bucket.
 */
@Component({
  selector: 'ca-bucket-info',
  templateUrl: './ca-bucket-info.component.html',
  styleUrls: ['./ca-bucket-info.component.scss']
})
export class CaBucketInfoComponent implements OnInit {

  @Input() bucket: CaBucketFull;

  constructor() {
  }

  ngOnInit(): void {
  }

}
