import {Component, Input, OnInit} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';
import {CaLabIframeOptions} from '../../../ca-core/service/ca-router.service';
import {CaLabIframeService} from '../../../ca-core/service-api/ca-lab-iframe.service';

/**
 * Component to display the iframe of the running lab instance
 */
@Component({
  selector: 'ca-lab-instance-iframe',
  templateUrl: './ca-lab-instance-iframe.component.html',
  styleUrls: ['./ca-lab-instance-iframe.component.scss']
})
export class CaLabInstanceIframeComponent implements OnInit {

  @Input() labUrl: string;

  @Input() token: string;

  @Input() iframeOption: CaLabIframeOptions;

  safeUrl: SafeUrl;

  constructor(private labIframeService: CaLabIframeService) {
  }

  ngOnInit(): void {
    this.safeUrl = this.labIframeService.getLoginSafeUrl(this.labUrl, this.token, this.iframeOption);
  }

}
