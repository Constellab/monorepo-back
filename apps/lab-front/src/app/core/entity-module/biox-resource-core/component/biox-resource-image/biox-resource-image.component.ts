import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/biox-resource.entity';
import {FileResourcePreview} from '../../../../model/entities/file-resource.entity';

/**
 * Component to view resource as image
 */
@Component({
  selector: 'gen-biox-resource-image',
  templateUrl: './biox-resource-image.component.html',
  styleUrls: ['./biox-resource-image.component.scss']
})
export class BioxResourceImageComponent implements OnInit {

  @Input() resource: BioxResource;

  image: Blob;

  alt: string;

  constructor() {
  }

  ngOnInit(): void {
    this.initImage();
  }

  private initImage(): void {
    if (this.resource instanceof FileResourcePreview && this.resource.isImage()) {
      this.image = this.resource.file;
      this.alt = this.resource.getFileName();
    }
  }

}
