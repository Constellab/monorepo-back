import {Component, ElementRef, HostBinding, Input, OnInit, SecurityContext} from '@angular/core';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {FlTextEditorElementDirective} from '../../model/fl-text-editor-element.directive';
import {FlTextEditorsManagerState} from '../../state/fl-text-editors-manager.state';
import {Observable} from 'rxjs';
import {ClYoutubeHelper} from '@monorepo/core-lib';


@Component({
  selector: 'fl-text-editor-video',
  templateUrl: './fl-text-editor-video.component.html',
  styleUrls: ['./fl-text-editor-video.component.scss']
})
export class FlTextEditorVideoComponent extends FlTextEditorElementDirective implements OnInit {

  @Input() url: string;

  @HostBinding('attr.video-title')
  @Input() videoTitle: string;

  @HostBinding('attr.caption')
  @Input() caption: string;

  sanitizedUrl: SafeUrl;
  urlError: boolean = false;

  disabled$: Observable<boolean>;


  constructor(private sanitize: DomSanitizer,
              elementRef: ElementRef<HTMLElement>,
              managersState: FlTextEditorsManagerState) {
    super(elementRef, managersState);
  }

  ngOnInit(): void {
    if (ClYoutubeHelper.isYoutubeEmbedVideoUrl(this.url)) {
      this.sanitizedUrl = this.sanitize.bypassSecurityTrustResourceUrl(this.sanitize.sanitize(SecurityContext.URL, this.url));
    } else {
      this.urlError = true;
    }
    this.disabled$ = this.getDisabled$();
  }

}
