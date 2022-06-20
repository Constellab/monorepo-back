import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {TdUniqueType} from '../../model/td-type.entity';
import {TdServiceConfig} from '../../service/td-service-config.config';
import {TdTypingName} from '../../model/td-typing-name.entity';

@Component({
  selector: 'td-tech-doc-link',
  templateUrl: './td-tech-doc-link.component.html',
  styleUrls: ['./td-tech-doc-link.component.scss']
})
export class TdTechDocLinkComponent implements OnInit, OnChanges{

  @Input()
  uniqueElement: TdUniqueType;

  isAbsolute: boolean;
  url: string;

  constructor(
    private tdServiceConfig: TdServiceConfig
  ) {
  }

  ngOnInit(): void {
    this.setup();
  }

  ngOnChanges(): void{
    this.setup();
  }

  private setup(): void{
    const typingName: TdTypingName = new TdTypingName(this.uniqueElement.typingName);

    const techDocUrl = this.tdServiceConfig.getTechnicalDocUrl(this.uniqueElement.version, typingName);


    this.isAbsolute = techDocUrl.isAbsolute; // true if getTechnicalDocUrl returned an absolute url
    this.url = techDocUrl.url;
  }

}
