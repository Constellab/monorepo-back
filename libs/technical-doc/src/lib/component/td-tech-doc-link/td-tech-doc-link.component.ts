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

    const typingName: TdTypingName = new TdTypingName(this.uniqueElement.typingName);

    const techDocUrl = this.tdServiceConfig.getTechnicalDocUrl(this.uniqueElement.version, typingName);


    this.isAbsolute = techDocUrl.isAbsolute; // true if getTechnicalDocUrl returned an absolute url
    this.url = techDocUrl.url;
  }

}
