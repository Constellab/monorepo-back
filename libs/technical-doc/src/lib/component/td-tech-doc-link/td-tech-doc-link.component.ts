import {Component, Input, OnInit} from '@angular/core';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {TdServiceConfig, TdTypingName, TdUniqueType} from '@monorepo/technical-doc';

@Component({
  selector: 'td-tech-doc-link',
  templateUrl: './td-tech-doc-link.component.html',
  styleUrls: ['./td-tech-doc-link.component.scss']
})
export class TdTechDocLinkComponent implements OnInit {

  @Input()
  uniqueElement: TdUniqueType;

  isAbsolute: boolean;
  url: string;

  constructor(
    private tdServiceConfig: TdServiceConfig
  ) {
  }

  ngOnInit(): void {
    const techDocUrl = this.tdServiceConfig.getTechnicalDocUrl(
      TdTypingName.getBrickName(this.uniqueElement.typingName),
      this.uniqueElement.version,
      TdTypingName.getTypeName(this.uniqueElement.typingName).toLowerCase(),
      TdTypingName.getUniqueName(this.uniqueElement.typingName));
    this.isAbsolute = techDocUrl.isAbsolute;
    this.url = techDocUrl.url;
  }

}
