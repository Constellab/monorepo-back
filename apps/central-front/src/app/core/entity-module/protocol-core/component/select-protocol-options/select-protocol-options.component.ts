import {AfterViewInit, Component, Host, OnInit} from '@angular/core';
import {MatSelect} from '@angular/material/select';
import {ProtocolDatasource} from '../../../../model/entities/protocol.entity';
import {ProtocolService} from '../../../../service-api/protocol.service';
import {FlEmbeddedOptionsAbstractDirective} from '@monorepo/front-core-lib';

/**
 * Component to be included in <mat-select> to automatically add the list of
 * user protocol
 *
 * This select options is paginated
 */
@Component({
  selector: 'gen-select-protocol-options',
  templateUrl: './select-protocol-options.component.html',
  styleUrls: ['./select-protocol-options.component.scss']
})
export class SelectProtocolOptionsComponent extends FlEmbeddedOptionsAbstractDirective
  implements OnInit, AfterViewInit {

  datasource: ProtocolDatasource;

  constructor(@Host() private select: MatSelect,
              private protocolService: ProtocolService) {
    super(select);
  }

  ngOnInit(): void {
    this.overrideCompareWithOnIds(this.select);

    // call find page of datasource
    this.datasource = this.protocolService.getMyProtocolsDatasource();
  }

  ngAfterViewInit(): void {
    this.initOptions();
  }

  private getCurrentProtocols(): void {
    this.datasource.getFirstPage();
  }

  loadMoreResult(): void {
    this.datasource.getNextPage();
  }

  // method call by outside to reload the options
  public refreshOptions(): void {
    this.getCurrentProtocols();
  }
}
