import {Component, OnInit} from '@angular/core';
import {Protocol} from '../../../core/model/entities/protocol.entity';
import {ProtocolService} from '../../../core/service-api/protocol.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'gen-protocol-detail-page',
  templateUrl: './protocol-detail-page.component.html',
  styleUrls: ['./protocol-detail-page.component.scss']
})
export class ProtocolDetailPageComponent implements OnInit {

  protocol: Protocol;

  isLoading: boolean = false;

  constructor(private protocolService: ProtocolService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getProtocolById(params.id)
    );
  }

  private getProtocolById(id: string): void {
    this.protocolService.findById(id).subscribe(
      protocol => this.getSuccess(protocol),
      () => this.isLoading = false
    );
  }

  private getSuccess(protocol: Protocol): void {
    this.protocol = protocol;
    this.isLoading = false;
  }
}
