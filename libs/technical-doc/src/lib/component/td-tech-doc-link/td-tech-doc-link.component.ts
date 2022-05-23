import {Component, Input, OnInit} from '@angular/core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {TdProcessType, TdServiceConfig, TdTypingName} from '@monorepo/technical-doc';

@Component({
  selector: 'td-tech-doc-link',
  templateUrl: './td-tech-doc-link.component.html',
  styleUrls: ['./td-tech-doc-link.component.scss']
})
export class TdTechDocLinkComponent implements OnInit {

  @Input()
  doc: TdProcessType;

  isAbsolute: boolean;
  url: string;

  constructor(
    private tdServiceConfig: TdServiceConfig
  ) {
  }

  ngOnInit(): void {
    const techDocUrl = this.tdServiceConfig.getTechnicalDocUrl(
      TdTypingName.getBrickName(this.doc.parentTypingName),
      this.doc.parentVersion,
      TdTypingName.getTypeName(this.doc.parentTypingName).toLowerCase(),
      TdTypingName.getUniqueName(this.doc.parentTypingName));
    this.isAbsolute = techDocUrl.isAbsolute;
    this.url = techDocUrl.url;
  }

}
