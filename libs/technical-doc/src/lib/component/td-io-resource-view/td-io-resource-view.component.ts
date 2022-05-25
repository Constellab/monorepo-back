import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TdTypingName} from '../../model/td-typing-name.entity';
import {FlColorHelper} from '@monorepo/front-core-lib';
import {TdResourceTypeDTO} from '../../model/td-process-type.entity';
import {TdUniqueType} from '../../model/td-type.entity';

@Component({
  selector: 'td-io-resource-view',
  templateUrl: './td-io-resource-view.component.html',
  styleUrls: ['./td-io-resource-view.component.scss']
})
export class TdIoResourceViewComponent implements OnInit {

  @Input()
  resource: TdResourceTypeDTO;

  uniqueParent: TdUniqueType;

  color: string;

  activatedRoute: ActivatedRoute;

  constructor(private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.activatedRoute = this.route;
    this.uniqueParent = {
      typingName: this.resource.typing_name,
      version: this.resource.brick_version ? this.resource.brick_version : 'latest',
      humanName: this.resource.human_name
    }
    this.color = FlColorHelper.stringToRGBColor(this.resource.typing_name);
  }

  getIoBrickName(typingName: string): string {
    return TdTypingName.getBrickName(typingName);
  }

  getIoUniqueName(typingName: string): string {
    return TdTypingName.getUniqueName(typingName);
  }
}
