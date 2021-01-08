import {AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild} from '@angular/core';

/**
 * Component to limit the size of the ng-content. If the height is higher than
 * maxHeight, it hides the rest and display a button 'See more'
 */
@Component({
  selector: 'fl-limit-height',
  templateUrl: './fl-limit-height.component.html',
  styleUrls: ['./fl-limit-height.component.scss']
})
export class FlLimitHeightComponent implements OnInit, AfterViewInit {

  // max size to display before 'See more' button
  @Input() maxHeight: number = 350;

  @Input() set expand(value: boolean) {
    this._expand = value;
    this.refreshFullContent();
  }

  @ViewChild('content', {static: true}) content: ElementRef<HTMLElement>;

  // is true the height is limited
  heightIsLimited: boolean = false;

  _expand: boolean = false;

  // true after the view init
  private componentIsReady: boolean = false;

  constructor(private renderer: Renderer2) {
  }

  ngOnInit(): void {
  }

  // display or hide the content based on _expand
  private refreshFullContent(): void {
    if (this.componentIsReady) {
      if (this._expand) {
        this.renderer.removeClass(this.content.nativeElement, 'limit-height');
        this.renderer.setStyle(this.content.nativeElement, 'max-height', 'none');
      } else {
        this.limitHeight();
      }
    }
  }


  private limitHeight(): void {
    this.renderer.addClass(this.content.nativeElement, 'limit-height');
    // limit the size to size minus 50. It allows to have at least 50px to show when we click on 'See more'
    this.renderer.setStyle(this.content.nativeElement, 'max-height', (this.maxHeight - 50) + 'px');
  }

  ngAfterViewInit(): void {
    // mark the component as ready when the view is ready
    this.componentIsReady = true;

    if (this.content.nativeElement.clientHeight > this.maxHeight) {
      setTimeout(() => {
        this.heightIsLimited = true;
        this.refreshFullContent();
      });
      this.limitHeight();
    }
  }


}
