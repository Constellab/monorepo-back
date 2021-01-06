import {AfterContentInit, Component, ContentChild, Input, OnInit, ViewContainerRef} from '@angular/core';
import {HelpService} from '../../../utils/help-service';
import {SectionBodyDirective} from '../section-body';
import {TemplatePortal} from '@angular/cdk/portal';

/**
 * Component to display a section containing an object or a list
 *
 * If the object or list if loading or the object list is empty,
 * it doesn't render the section-body
 * To use the section-body, use <ng-template genSectionBody>
 */
@Component({
  selector: 'gen-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements OnInit, AfterContentInit {

  _isLoading: boolean = false;
  @Input() set isLoading(isLoading: boolean) {
    this._isLoading = isLoading;
    this.lazyRender();
  }

  _object: any = null;

  @Input() set object(object: any) {
    this._object = object;
    this.lazyRender();
  }


  @Input() emptyText: string = 'object_not_found';

  /** Content that will be rendered lazily. */
  @ContentChild(SectionBodyDirective) private lazyContent: SectionBodyDirective;

  /** Portal holding the user's content. */
  portal: TemplatePortal;

  constructor(private viewContainerRef: ViewContainerRef) {
  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    this.lazyRender();
  }


  // if it returns true, the section body is rendered
  get renderBody(): boolean {
    return !this._isLoading && !this.objectIsNullOrEmpty;
  }

  get objectIsNullOrEmpty(): boolean {
    return HelpService.isNullOrEmpty(this._object);
  }

  lazyRender(): void {
    // if we can render the portal
    if (this.lazyContent && this.renderBody) {
      // don't re-create the portal if already present
      if (this.portal == null) {
        this.portal = new TemplatePortal(this.lazyContent._template, this.viewContainerRef);
      }
    } else {
      this.portal = null;
    }
  }

}
