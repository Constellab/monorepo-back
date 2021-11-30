import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {ClOnChange} from '@monorepo/core-lib';
import {RouterService} from '../../../../service/router.service';

@Component({
  selector: 'gen-biox-resource-card',
  templateUrl: './biox-resource-card.component.html',
  styleUrls: ['./biox-resource-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BioxResourceCardComponent implements OnInit {

  // update the resource detail route on input change
  @ClOnChange(function (this: BioxResourceCardComponent, resource: BioxResource) {
    if (resource == null) {
      this.resourceDetailRoute = null;
    } else {
      this.resourceDetailRoute = RouterService.getBioxResourceDetailRoute(resource.id);
    }
  })
  @Input() resource: BioxResource;

  resourceDetailRoute: string;

  constructor() {
  }

  ngOnInit(): void {
  }

}
