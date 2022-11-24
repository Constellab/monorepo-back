import {Component, Input, OnInit} from '@angular/core';
import {CaBucketCredentials} from '../../../../model/entities/ca-object-storage.class';

@Component({
  selector: 'ca-bucket-credentials-inline',
  templateUrl: './ca-bucket-credentials-inline.component.html',
  styleUrls: ['./ca-bucket-credentials-inline.component.scss']
})
export class CaBucketCredentialsInlineComponent implements OnInit {

  @Input() credentials: CaBucketCredentials;

  constructor() {
  }

  ngOnInit(): void {
  }

}
