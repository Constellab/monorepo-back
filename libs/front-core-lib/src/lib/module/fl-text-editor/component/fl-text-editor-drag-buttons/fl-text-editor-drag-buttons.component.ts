import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {FlOverlayRef} from '../../../fl-portal/model/fl-overlay-ref.class';
import {DOCUMENT, isPlatformBrowser} from '@angular/common';
import {FlPortalService} from '../../../fl-portal/service/fl-portal.service';
import {FlTextEditorState} from '../../state/fl-text-editor.state';


/**
 * Autonomous component that must be used inside fl-text-editor component.
 * Button that is showed on hover of the text editor.
 * It is used to drag block element in the text editor.
 */
@Component({
  selector: 'fl-text-editor-drag-buttons',
  templateUrl: './fl-text-editor-drag-buttons.component.html',
  styleUrls: ['./fl-text-editor-drag-buttons.component.scss']
})
export class FlTextEditorDragButtonsComponent implements OnInit, OnDestroy {


  @ViewChild('dragIndicator') dragIndicator: TemplateRef<unknown>;
  @ViewChild('dragBar') dragBar: TemplateRef<unknown>;

  // calculated width of the bar (80% of the text editor width)
  barWidth: string;

  private dragIndicatorOverlay?: FlOverlayRef;
  private dragBarOverlay?: FlOverlayRef;

  private isDragging: boolean = false;
  private draggedBlock: HTMLElement;


  private mouseUpListener: () => void;
  private mouseMoveListener: () => void;
  private mouseOverListener: () => void;

  constructor(private state: FlTextEditorState,
              private renderer: Renderer2,
              @Inject(DOCUMENT) private document: Document,
              @Inject(PLATFORM_ID) private platformId: string,
              private portalService: FlPortalService,
              private _viewContainerRef: ViewContainerRef) {
  }

  ngOnInit(): void {
    this.state.getDisabled$().subscribe(
      (disabled) => {
        if (disabled) {
          this.disableIndicator();
        } else {
          this.enableIndicator();
        }
      }
    );

    // remove the overlay on an outside click
    this.state.getOutsideClick$().subscribe(
      () => this.dragIndicatorOverlay?.dispose()
    );
  }

  private enableIndicator(): void {
    if(isPlatformBrowser(this.platformId) && this.state.textEditorContainer) {
      this.mouseOverListener = this.renderer.listen(this.state.textEditorContainer, 'mouseover',
        (event: MouseEvent) => {
          this.onMouseOver(event);
        });
    }
  }

  private disableIndicator(): void {
    this.clearAll();
    if (this.mouseOverListener) {
      this.mouseOverListener();
    }
  }

  onMouseOver(event: MouseEvent): void {
    if (this.isDragging) return;

    const element = this.state.getEditorBlockElement(event.target as any);

    if (!element) return;

    this.dragIndicatorOverlay?.dispose();
    if (!this.state.isEmptyBlock(element)) {
      this.showDragIndicator(element);
    }
  }

  private showDragIndicator(element: HTMLElement): void {
    this.draggedBlock = element;
    const config = this.portalService.configureRelativePortal(element, [{
      originX: 'start',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'top',
      offsetX: -20,
      offsetY: -5
    }], {scrollStrategy: this.portalService.getCloseOnScrollStrategy()});

    this.dragIndicatorOverlay = this.portalService.createPortalTemplate(this.dragIndicator, config, this._viewContainerRef);
  }


  /**
   * Start dragging block and show drag bar
   */
  onDragIndicatorMouseDown(): void {
    this.isDragging = true;

    // on mouse up finish dragging
    this.mouseUpListener = this.renderer.listen(this.document, 'mouseup', (event: MouseEvent) => {

      const element = this.state.getBlockFromMouseYPosition(event.pageY);
      if (element) {
        // move the position of the dragged element
        this.renderer.insertBefore(element.parentElement, this.draggedBlock, element);
      }
      this.clearAll();
    });

    // on move, show drag bar
    this.mouseMoveListener = this.renderer.listen(this.document, 'mousemove', (event: MouseEvent) => {
      const element = this.state.getBlockFromMouseYPosition(event.pageY);

      if (!element) return;

      this.showDragBar(element);
    });
  }


  private showDragBar(element: HTMLElement): void {
    this.dragBarOverlay?.dispose();

    // calculate width of the bar (80% of the text editor width)
    this.barWidth = this.state.getQlEditorElement().clientWidth * 0.8 + 'px';

    const config = this.portalService.configureRelativePortal(element, [{
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: -5,
    }], {scrollStrategy: this.portalService.getCloseOnScrollStrategy()});
    this.dragBarOverlay = this.portalService.createPortalTemplate(this.dragBar, config, this._viewContainerRef);
  }

  private clearAll(): void {
    if (this.mouseMoveListener) {
      this.mouseMoveListener();
    }
    if (this.mouseUpListener) {
      this.mouseUpListener();
    }

    this.dragIndicatorOverlay?.dispose();
    this.dragBarOverlay?.dispose();

    this.isDragging = false;
    this.draggedBlock = null;
  }

  ngOnDestroy(): void {
    this.clearAll();
    if (this.mouseOverListener) {
      this.mouseOverListener();
    }
  }


}
