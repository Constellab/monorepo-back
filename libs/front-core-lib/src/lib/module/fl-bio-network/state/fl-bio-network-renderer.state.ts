import {Simulation} from 'd3-force';
import {ClHelpService, ClSubscriptionHandler} from '@monorepo/core-lib';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';
import {FlD3DragEvent, FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlBioNetworkDrawerState} from './fl-bio-network-drawer.state';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {Injectable, NgZone, OnDestroy, Renderer2} from '@angular/core';
import {FlBioNetworkState} from './fl-bio-network.state';
import {FlBioNetworkSelectionState} from './fl-bio-network-selection.state';
import {FlBioNetworkZoomState} from './fl-bio-network-zoom.state';
import {FlBioNetworkGridState} from './fl-bio-network-grid.state';
import {FlBioNetworkD3} from '../model/fl-bio-network-d3.class';
import {
  FlBioNetworkD3Link,
  FlBioNetworkD3LinkPoint,
  flBioNetworkLinkElement
} from '../model/fl-bio-network-d3-link.class';
import {FlBioNetworkGroupState} from './fl-bio-network-group.state';
import {drag, forceLink, forceManyBody, forceSimulation, line, select} from 'd3';
import {FlBioNetworkMetaboliteLevel} from '../model/fl-bio-network.class';
import {FlBioNetworkColorState} from './fl-bio-network-color.state';
import {FlBioNetworkOptions, FlBioNetworkOptionsState} from './fl-bio-network-options.state';
import {Subscription} from 'rxjs';

/**
 * State to manager the drawing of bio network using d3
 */
@Injectable()
export class FlBioNetworkRendererState implements OnDestroy {

  private htmlContainer: HTMLElement;

  private data: FlBioNetworkD3;

  private svg: FlD3SelectionSimple;

  private enableSimulation: boolean = false;
  private simulation: Simulation<FlBioNetworkD3Node, any>;
  private simulationEnded: boolean = false;

  private readonly subscriptions = new ClSubscriptionHandler();
  private optionSubscription: Subscription;

  ////////////// READONLY VARIABLE //////////////////
  public readonly grey: string;
  private readonly textColor: string;
  private readonly backgroundColor: string;
  private readonly arrowId: string = 'arrow';
  private readonly smallArrowId: string = 'small-arrow';

  constructor(private themeService: FlThemeService, private drawerState: FlBioNetworkDrawerState,
              private state: FlBioNetworkState, private selectionState: FlBioNetworkSelectionState,
              private zoomState: FlBioNetworkZoomState, private gridState: FlBioNetworkGridState,
              private groupState: FlBioNetworkGroupState, private colorState: FlBioNetworkColorState,
              private optionState: FlBioNetworkOptionsState,
              private ngZone: NgZone,
              private renderer: Renderer2) {
    const themeDetail: FlThemeDetail = themeService.getCurrentThemeDetail();
    this.textColor = themeDetail.foreground;
    this.backgroundColor = themeDetail.background;
    this.grey = themeDetail.greyHighContrast;
  }

  public init(htmlContainer: HTMLElement): void {
    this.htmlContainer = htmlContainer;

    this.subscriptions.add(this.state.getChartData$().subscribe(
      chartData => this.drawNetwork(chartData)
    ));
  }

  private drawNetwork(chartData: FlBioNetworkD3): void {
    // run the d3 rendering outside ng zone to avoir ng check
    this.ngZone.runOutsideAngular(() => {

      if (this.svg != null) {
        this.clearNetwork();
      }

      this.data = chartData;

      if (chartData) {
        this.enableSimulation = !chartData.hasPosition();
        this.simulationEnded = !this.enableSimulation;
        console.log('Enable simulation :', this.enableSimulation);

        // if there is no simulation init all position to avoid error
        if (!this.enableSimulation) {
          this.data.initPositions();
        }

        const chartWidth = this.htmlContainer.clientWidth;
        const chartHeight = this.htmlContainer.clientHeight;

        const mainGroup = this.initSVG(chartWidth, chartHeight);


        this.gridState.initGrid(mainGroup);
        this.groupState.initGroups(mainGroup);

        // draw major nodes and links
        this.drawLinks(FlBioNetworkMetaboliteLevel.MAJOR);
        this.drawNodes(FlBioNetworkMetaboliteLevel.MAJOR);

        // draw minor nodes and links
        this.drawLinks(FlBioNetworkMetaboliteLevel.MINOR);
        this.drawNodes(FlBioNetworkMetaboliteLevel.MINOR);


        this.zoomState.enableZoom(this.svg, mainGroup, chartWidth, chartHeight, this.data);
        this.defineArrowMarkers();

        if (this.enableSimulation) {
          this.initSimulation();
          this.simulation.on('end', () => {
            this.endSimulation();
          });
        }

        // init the selection state
        this.selectionState.init(chartData);
        this.optionState.init()

        this.optionSubscription = this.optionState.getOptions$().subscribe(
          event => this.onOptionChange(event)
        );
      }
    });
  }


  private initSVG(chartWidth: number, chartHeight: number): FlD3SelectionSimple {
    this.svg = select(this.htmlContainer)
      .append('svg')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .on('contextmenu', (ev: Event) => ev.preventDefault()); // disable context menu

    //add encompassing group for the zoom
    return this.svg.append('g')
      .attr('class', 'everything');
  }


  ///////////////////////////////////////////////// Nodes ///////////////////////////////////////////////////////

  private drawNodes(level: FlBioNetworkMetaboliteLevel): void {

    const nodes = this.data.getNodes(level);
    const textColor: string = this.textColor;
    const backgroundColor: string = this.backgroundColor;
    const dragFunction: any = drag()
      .on('drag', (d) => this.dragNode(d));

    this.groupState.getNodesGroup([level])
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(dragFunction)
      .style('cursor', 'pointer')
      .on('click', this.onNodeClicked())
      .attr('transform', d => this.simulationEnded ? `translate(${d.x},${d.y})` : null)
      .each(function (this: SVGElement, d) {
        d.drawNodeAndText(this, textColor, backgroundColor);
      });
  }


  private dragNode(dragEvent: FlD3DragEvent<FlBioNetworkD3Node>): void {
    // use to round the position based on grid if closed enough
    const roundedCoord = this.gridState.roundCoordOnGrid(dragEvent.subject.convertFromCenterCoord(dragEvent));

    let nodeToMoveIds: string[];
    if (roundedCoord) {
      nodeToMoveIds = dragEvent.subject.setCenter(roundedCoord);
    } else {
      nodeToMoveIds = dragEvent.subject.setPosition(dragEvent);
    }

    this.groupState.allNodes.filter((d) => nodeToMoveIds.includes(d.id))
      .attr('transform',
        (d: FlBioNetworkD3Node) => 'translate(' + d.x + ',' + d.y + ')'
      );

    // refresh link points
    this.groupState.allLinks
      .filter((d) => d.isLinkedToNode(dragEvent.subject.id))
      .select(flBioNetworkLinkElement)
      .attr('d', (d: FlBioNetworkD3Link) => d.getPathAttr());

  }

  /**
   * Update the opacity of node and link not connected to clicked node
   * to the opacity provided
   * @private
   */
  private onNodeClicked(): any {
    return (mouseEvent: MouseEvent, clickedNode: FlBioNetworkD3Node) => {
      // stop the event propagation do prevent click event on svg that reset the opacity
      ClHelpService.stopEventPropagation(mouseEvent);

      // select the nodes and its connections
      this.selectionState.selectNodeAndDirectLinks(clickedNode);
    };
  }

  ///////////////////////////////////////////////// LINKS ///////////////////////////////////////////////////////

  private drawLinks(level: FlBioNetworkMetaboliteLevel): void {
    const links = this.data.getLinks(level);

    const linkGroup: FlD3SelectionSimple<FlBioNetworkD3Link> = this.groupState.getLinksGroup([level])
      .selectAll('g')
      .data(links)
      .join('g')
      .each(function (this: SVGGElement, d) {
        d.groupElement = this;
      });

    linkGroup
      .append(flBioNetworkLinkElement)
      .attr('d', (d: FlBioNetworkD3Link) => d.getPathAttr())
      .attr('stroke-opacity', 0.9)
      .attr('stroke-width', (d: FlBioNetworkD3Link) => d.getLinkWidth())
      .attr('fill', d => d.defaultColor)
      // define the arrow marker, no marker for link of cofactors
      .attr('marker-end', (d: FlBioNetworkD3Link) => d.isLinkedToCofactor() ? `url(#${this.smallArrowId})` : `url(#${this.arrowId})`)
      .on('contextmenu', this.createLinkPoint());

    this.drawLinkPoints(linkGroup);
  }

  private createLinkPoint(): any {
    return (mouseEvent: MouseEvent, link: FlBioNetworkD3Link) => {
      if (link.isLinkedToCofactor()) return;

      link.insertPoint(this.zoomState.convertCoord({x: mouseEvent.offsetX, y: mouseEvent.offsetY}));

      const linkGroup: FlD3SelectionSimple<FlBioNetworkD3Link> = this.groupState.allLinks
        .filter((d) => d.id === link.id);

      linkGroup.select(flBioNetworkLinkElement)
        .attr('d', (d: FlBioNetworkD3Link) => d.getPathAttr());

      this.drawLinkPoints(linkGroup);
    };
  }

  // draw of redraw all the link points of a link selection
  private drawLinkPoints(linkGroup: FlD3SelectionSimple<FlBioNetworkD3Link>): void {
    linkGroup.selectAll('circle')
      .data((d) => d.pointPositions)
      .call(this.drawLinkPoint(this.grey));
  }

  private drawLinkPoint(color: string): any {
    return (selection: FlD3SelectionSimple): void => {
      const dragFunction: any = drag()
        .on('drag', (d) => this.dragLinkNode(d));

      selection
        .join('circle')
        .attr('r', '2')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('fill', color)
        .attr('stroke-width', '0')
        .style('cursor', 'pointer')
        .call(dragFunction)
        .on('contextmenu', this.deleteLinePoint());
    };

  }


  private deleteLinePoint(): any {
    return (mouseEvent: MouseEvent, linkPoint: FlBioNetworkD3LinkPoint) => {
      const linkGroup: FlD3SelectionSimple<FlBioNetworkD3Link> = this.groupState.allLinks
        .filter((d) => d.id === linkPoint.link.id);

      // delete the point
      linkPoint.delete();

      // redraw the path
      linkGroup.select(flBioNetworkLinkElement)
        .attr('d', (d: FlBioNetworkD3Link) => d.getPathAttr());
    };
  }

  private dragLinkNode(dragEvent: FlD3DragEvent<FlBioNetworkD3LinkPoint>): void {
    // use to round the position based on grid if closed enough
    const roundedCoord = this.gridState.roundCoordOnGrid(dragEvent);
    dragEvent.subject.setCoord(roundedCoord ?? {x: dragEvent.x, y: dragEvent.y});

    const linkGroup: FlD3SelectionSimple<FlBioNetworkD3Link> = this.groupState.allLinks
      .filter((d) => d.id === dragEvent.subject.link.id);


    linkGroup.select(flBioNetworkLinkElement)
      .attr('d', (d: FlBioNetworkD3Link) => d.getPathAttr());

    linkGroup
      .selectAll('circle')
      .data((d) => d.pointPositions)
      .attr('cx', (d: FlBioNetworkD3LinkPoint) => d.x)
      .attr('cy', (d: FlBioNetworkD3LinkPoint) => d.y);
  }

  private defineArrowMarkers(): void {
    this.defineArrowMarker(this.arrowId, 1, 21);
    this.defineArrowMarker(this.smallArrowId, 1, 10);
  }


  // define the arrow marker to use it in lines
  private defineArrowMarker(id: string, size: number, xOffset: number): void {
    // arrow from https://observablehq.com/@harrylove/draw-an-arrowhead-marker-connected-to-a-line-in-d3
    const ref = size / 2;
    this.svg.append('defs')
      .append('marker')
      .attr('id', id)
      .attr('viewBox', [0, 0, size, size] as any)
      .attr('refX', xOffset) // use as offset to avoir overlap nodes
      .attr('refY', ref) // use to center the arrow in the line
      .attr('markerWidth', size)
      .attr('markerHeight', size)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', line()([[0, 0], [0, size], [size, ref]]))
      .attr('stroke', 'none')
      .attr('fill', this.themeService.getCurrentThemeDetail().foreground);
  }


  /////////////////////////////////////////// SIMULATION //////////////////////////////////////////////

  private initSimulation(): void {
    this.simulation = forceSimulation(this.data.getMetabolitesAndReactions())
      .force('link',
        forceLink(this.data.links)
          .id((d: FlBioNetworkD3Node) => d.id)
      )
      .force('charge', forceManyBody()).alphaDecay(0.05);
  }


  private refreshPosition(): void {
    // refresh link points
    this.groupState.allLinks.selectAll(flBioNetworkLinkElement).attr('d', (d: FlBioNetworkD3Link) => d.getPathAttr());

    // refresh nodes positions
    this.groupState.allNodes.attr('transform',
      (d: FlBioNetworkD3Node) => 'translate(' + d.x + ',' + d.y + ')'
    );
  }

  // disable all force so the user can move the node independently
  private endSimulation(): void {
    if (!this.simulationEnded) {
      // clear all forces, so the user can drag easily
      this.simulation.force('link', null);
      this.simulation.force('charge', null);
      this.simulation.force('center', null);
      this.simulation.force('collide', null);
      this.simulation.stop();
      this.simulationEnded = true;
      this.refreshPosition();
      // save the new positions
      this.data.savePositions();
    }
  }

  /////////////////////////////////////////// COFACTORS //////////////////////////////////////////////

  // public toggleCofactors(showCofactor: boolean): void {
  //   if (this.showCofactors === showCofactor) return;
  //
  //   this.showCofactors = showCofactor;
  //   if (showCofactor) {
  //     for (const reaction of this.data.reactions) {
  //       // init cofactor positions
  //       const tSpaces = Math.PI * 2 / reaction.childNodes.length;
  //       let t = 0;
  //       const center: FlCoord = reaction.getCenter();
  //
  //       // use the size of the grid for the distance of the metabolite
  //       const distance = this.gridState.xAxisTick.size;
  //
  //       for (const node of reaction.childNodes) {
  //         const x = distance * Math.cos(t) + center.x;
  //         const y = distance * Math.sin(t) + center.y;
  //         node.setCenter({x, y});
  //         t += tSpaces;
  //       }
  //     }
  //
  //     this.drawNodes(FlBioNetworkMetaboliteLevel.COFACTOR);
  //     this.drawLinks(FlBioNetworkMetaboliteLevel.COFACTOR);
  //
  //   } else {
  //     this.clearGroup(this.groupState.getNodesGroup([FlBioNetworkMetaboliteLevel.COFACTOR]));
  //     this.clearGroup(this.groupState.getLinksGroup([FlBioNetworkMetaboliteLevel.COFACTOR]));
  //   }
  // }

  private onOptionChange(options: FlBioNetworkOptions): void {
    switch (options.action){
      case 'updateVisibilityLevel':
        this.toggleShowMinors(options.visibleLevels.includes(FlBioNetworkMetaboliteLevel.MINOR));
        break;
      case 'toggleText':
        this.toggleShowTexts(options.showTexts);
        break;
      case 'init':
        this.toggleShowMinors(options.visibleLevels.includes(FlBioNetworkMetaboliteLevel.MINOR));
        this.toggleShowTexts(options.showTexts);
        break;

    }
  }

  private toggleShowMinors(showMinors: boolean): void {
    if (showMinors) {
      this.renderer.removeClass(this.groupState.getLinkGroupElement(FlBioNetworkMetaboliteLevel.MINOR), 'hide-group');
      this.renderer.removeClass(this.groupState.getNodeGroupElement(FlBioNetworkMetaboliteLevel.MINOR), 'hide-group');
    } else {
      this.renderer.addClass(this.groupState.getLinkGroupElement(FlBioNetworkMetaboliteLevel.MINOR), 'hide-group');
      this.renderer.addClass(this.groupState.getNodeGroupElement(FlBioNetworkMetaboliteLevel.MINOR), 'hide-group');
    }
  }

  private toggleShowTexts(showTexts: boolean): void {
    if (showTexts) {
      this.renderer.removeClass(this.htmlContainer, 'hide-text');
    } else {
      this.renderer.addClass(this.htmlContainer, 'hide-text');
    }
  }

  // clear the d3 selections and reset simulation
  private clearNetwork(): void {
    this.svg.remove();
    this.svg = null;
    this.simulationEnded = false;
    this.groupState.clearNetwork();
    this.optionSubscription?.unsubscribe();
  }


  private clearGroup(selection: FlD3SelectionSimple): void {
    selection.selectAll('*').remove();
  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.simulation?.stop();
  }
}


