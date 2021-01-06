import {Component, Input, OnInit} from '@angular/core';
import {SafeUrl} from '@angular/platform-browser';
import {LabIframeOptions} from '../../../core/service/router.service';
import {LabIframeService} from '../../../core/service-api/lab-iframe.service';

/**
 * Component to display the iframe of the running lab instance
 */
@Component({
  selector: 'gen-lab-instance-iframe',
  templateUrl: './lab-instance-iframe.component.html',
  styleUrls: ['./lab-instance-iframe.component.scss']
})
export class LabInstanceIframeComponent implements OnInit {

  @Input() labUrl: string;

  @Input() token: string;

  @Input() iframeOption: LabIframeOptions;

  safeUrl: SafeUrl;

  constructor(private labIframeService: LabIframeService) {
  }

  ngOnInit(): void {
    this.safeUrl = this.labIframeService.getLoginSafeUrl(this.labUrl, this.token, this.iframeOption);
  }

}
