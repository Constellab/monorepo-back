import {Component, Input, OnInit} from '@angular/core';
import {RouterService} from '../../../../service/router.service';

/**
 * Simple component to display information about a {@link BioxResource}
 */
@Component({
  selector: 'gen-biox-resource-info',
  templateUrl: './biox-resource-info.component.html',
  styleUrls: ['./biox-resource-info.component.scss']
})
export class BioxResourceInfoComponent implements OnInit {

  @Input() resourceId: string;

  resourceDetailUrl: string;

  constructor() {
  }

  ngOnInit(): void {
    this.resourceDetailUrl = RouterService.getBioxResourceDetailRoute(this.resourceId);
  }

}
