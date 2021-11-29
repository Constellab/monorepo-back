import {Component, Input, OnInit} from '@angular/core';
import {BioxResource} from '../../../../model/entities/resource/biox-resource.entity';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {FileResourceService} from '../../../../entity-service/file-resource.service';
import {Observable} from 'rxjs';

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

  downloadLink$: Observable<string>;

  // todo improve svg support to use it directly in src attribute
  svg: SafeHtml;

  alt: string;

  constructor(private sanitizer: DomSanitizer,
              private resourceFileService: FileResourceService) {
  }

  ngOnInit(): void {
    this.initImage();
  }

  private initImage(): void {
    if (this.resource.isFile() && this.resource.fsNode.isImage()) {

      if (this.resource.fsNode.getExtension() === 'svg') {
        // this.svg = this.sanitizer.bypassSecurityTrustHtml(this.resource.data);
      } else {
        this.downloadLink$ = this.resourceFileService.getDownloadFileUrl(this.resource.id);
      }
    }
  }

}
