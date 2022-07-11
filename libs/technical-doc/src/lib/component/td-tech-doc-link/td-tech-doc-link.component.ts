import {Component, Input, OnInit} from '@angular/core';
import {TdUniqueType} from '../../model/td-type.entity';
import {TdServiceConfig} from '../../service/td-service-config.config';
import {TdTypingName} from '../../model/td-typing-name.entity';

@Component({
  selector: 'td-tech-doc-link',
  templateUrl: './td-tech-doc-link.component.html',
  styleUrls: ['./td-tech-doc-link.component.scss']
})
export class TdTechDocLinkComponent implements OnInit {

  @Input() set uniqueElement(u: TdUniqueType) {
    this._uniqueElement = u;
    this.setup();
  }

  _uniqueElement: TdUniqueType;

  isAbsolute: boolean;
  url: string;


  constructor(
    private tdServiceConfig: TdServiceConfig,
  ) {
  }

  ngOnInit(): void {
  }

  private setup(): void {
    const typingName: TdTypingName = new TdTypingName(this._uniqueElement.typingName);

    const techDocUrl = this.tdServiceConfig.getTechnicalDocUrl(this._uniqueElement.version, typingName);


    this.isAbsolute = techDocUrl.isAbsolute; // true if getTechnicalDocUrl returned an absolute url
    this.url = techDocUrl.url;
  }

}
