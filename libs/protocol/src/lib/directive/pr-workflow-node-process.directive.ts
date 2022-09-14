import {Directive, ElementRef, Input, OnDestroy, Renderer2} from '@angular/core';
import {PrWorkflowNodeProcess} from '../model/node/pr-workflow-node-process.class';
import {PrWorkflowManagerState} from '../state/pr-workflow-manager-state';
import {PrWorkflowActionState} from '../state/pr-workflow-action-state';
import {
  FlHtmlHelper,
  FlMenuDynamic,
  FlOverlayRef,
  FlPortalConnectedPosition,
  FlPortalService,
  FlStatus,
  FlTranslatableText
} from '@monorepo/front-core-lib';
import {
  PrWorkflowPortActionPortalComponent,
  PrWorkflowPortActionPortalInput
} from '../component/pr-workflow-port-action-portal/pr-workflow-port-action-portal.component';
import {PrWorkflowPort} from '../model/pr-workflow-port.class';
import {Observable} from 'rxjs';
import {PrWorkflowNodeDirective} from './pr-workflow-node.directive';

@Directive()
export abstract class PrWorkflowNodeProcessDirective extends PrWorkflowNodeDirective implements OnDestroy {

  static currentOverlayRef: FlOverlayRef = null;

  // Name of the node
  @Input() name: string;

  node: PrWorkflowNodeProcess;

  title$: Observable<FlTranslatableText>;
  subTitle$: Observable<string>;
  status$: Observable<FlStatus>;

  private listener: () => void;

  constructor(workflowManager: PrWorkflowManagerState,
              elementRef: ElementRef,
              protected actionState: PrWorkflowActionState,
              protected renderer: Renderer2,
              private portalService: FlPortalService) {
    super(workflowManager, elementRef);
  }

  protected initNode(): void {
    super.initNode();

    this.title$ = this.node.getTitle$();
    this.subTitle$ = this.node.getSubTitle$();
    this.status$ = this.node.getStatus$();

    this.listenToNodeClick();
  }

  openNodeDetail(): void {
    this.actionState.newAction({
      action: 'selectNode',
      processNode: this.node,
    });
  }

  openResourceDetail(resourceId: string): void {
    this.actionState.newAction({
      action: 'showResource',
      resourceId: resourceId,
    });
  }

  protected listenToNodeClick(): void {
    // retrieve the drawflow element that wrap the node
    const parent: HTMLElement = FlHtmlHelper.getParent(this.elementRef.nativeElement, {className: 'parent-node'});

    if (parent == null) return;

    this.listener = this.renderer.listen(parent, 'click', event => this.onNodeClick(event));
  }

  private onNodeClick(event: PointerEvent): void {
    const element: HTMLElement = event.target as any;

    const classes: string[] = FlHtmlHelper.domTokenListToArray(element.classList);
    if (classes.includes('input')) {
      const inputName: string = classes.find((cls) => cls.startsWith('input_'));
      if (inputName == null) return;

      const port = this.node.findInputPortByDrawflowName(inputName);
      if (port == null) return;

      this.onInputClick(port, element);
    } else if (classes.includes('output')) {
      const outputName: string = classes.find((cls) => cls.startsWith('output_'));
      if (outputName == null) return;

      const port = this.node.findOutputPortByDrawflowName(outputName);
      if (port == null) return;

      this.onOutputClick(port, element);
    }
  }


  private onInputClick(port: PrWorkflowPort, element: Element): void {
    const menuDynamics: FlMenuDynamic[] = this.workflowManager.viewConfig.getInputMenu(port, this.node,
      this.workflowManager.getCurrentMode());
    this.openPortPortal(port, menuDynamics, element);
  }

  private onOutputClick(port: PrWorkflowPort, element: Element): void {
    const menuDynamics: FlMenuDynamic[] = this.workflowManager.viewConfig.getOutputMenu(port, this.node,
      this.workflowManager.getCurrentMode());
    this.openPortPortal(port, menuDynamics, element);
  }

  // open the portal for the input or output port
  private openPortPortal(port: PrWorkflowPort, menuDynamics: FlMenuDynamic[], element: Element): void {
    const data: PrWorkflowPortActionPortalInput = {
      port: port,
      menuDynamics: menuDynamics
    };

    const position: FlPortalConnectedPosition[] = [
      {originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
      'right', 'top', 'left', 'bottom'];

    const config = this.portalService.configureRelativePortal(element, position, {
      disposeOnOutsideClick: true,
      disposeOnNavigation: true,
      elevation: true
    });

    if (PrWorkflowNodeProcessDirective.currentOverlayRef) {
      PrWorkflowNodeProcessDirective.currentOverlayRef.dispose();
    }
    PrWorkflowNodeProcessDirective.currentOverlayRef = this.portalService.createPortal(PrWorkflowPortActionPortalComponent, config, data);
  }

  ngOnDestroy(): void {
    if (this.listener) {
      this.listener();
    }
  }
}
