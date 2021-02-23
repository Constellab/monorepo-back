import {Component, OnInit} from '@angular/core';
import {Protocol} from '../../../core/model/entities/protocol.entity';
import {ProtocolService} from '../../../core/service-api/protocol.service';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs';

@Component({
  selector: 'gen-protocol-detail-page',
  templateUrl: './protocol-detail-page.component.html',
  styleUrls: ['./protocol-detail-page.component.scss']
})
export class ProtocolDetailPageComponent implements OnInit {

  protocol: Observable<Protocol>;

  constructor(private protocolService: ProtocolService,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(
      params => this.getProtocolById(params.id)
    );
  }

  private getProtocolById(id: string): void {
    this.protocol = this.protocolService.findById(id);
  }
}
