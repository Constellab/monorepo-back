import {Component, OnInit, SecurityContext} from '@angular/core';
import {RvResourceViewDirective} from '../../model/rv-resource-view.directive';
import {RvResourceViewImage} from '../../model/rv-resource-view.class';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'rv-view-image',
  templateUrl: './rv-view-image.component.html',
  styleUrls: ['./rv-view-image.component.scss']
})
export class RvViewImageComponent extends RvResourceViewDirective<RvResourceViewImage>
  implements OnInit {

  safeImage: any;

  constructor(private sanitizer: DomSanitizer) {
    super();
  }

  ngOnInit(): void {

    this.safeImage = this.sanitizer.sanitize(SecurityContext.HTML,
      `data:${this.view.data.mime_type};base64,${this.view.data.base_64_img}`
    );

  }

}
