import * as d3 from 'd3';
import {Simulation} from 'd3-force';
import {ClHelpService, ClSubscriptionHandler} from '@monorepo/core-lib';
import {ScaleLinear} from 'd3-scale';
import {FlBioNetworkD3Node} from '../model/fl-bio-network-d3-node.class';
import {FlCoord, FlD3DragEvent, FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlBioNetworkDrawerState} from './fl-bio-network-drawer.state';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {Injectable, NgZone, OnDestroy} from '@angular/core';
import {FlBioNetworkState} from './fl-bio-network.state';
import {FlBioNetworkSelectionState} from './fl-bio-network-selection.state';
import {FlBioNetworkZoomState} from './fl-bio-network-zoom.state';
import {FlBioNetworkGridState} from './fl-bio-network-grid.state';
import {FlBioxNetworkD3} from '../model/fl-bio-network-d3.class';
import {FlBioNetworkD3Link} from '../model/fl-bio-network-d3-link.class';
import {flBioNetworkReactionMaxValue} from '../model/fl-bio-network-d3-reaction.class';
import {FlBioNetwork} from '../model/fl-bio-network.class';
import {FlBioNetworkGroupState} from './fl-bio-network-group.state';

/**
 * State to manager the drawing of bio network using d3
 */
@Injectable()
export class FlBioNetworkRendererState implements OnDestroy {

  private htmlContainer: HTMLElement;
  private chartHeight: number;
  private chartWidth: number;

  private data: FlBioxNetworkD3;

  private svg: FlD3SelectionSimple;

  private enableSimulation: boolean = false;
  private simulation: Simulation<FlBioNetworkD3Node, any>;
  private simulationEnded: boolean = false;

  // if true the link colors switch to logarithm
  private linkColorLogarithm: boolean;

  ///////////// COFACTORS /////////////
  private showCofactor: boolean = false;


  private readonly subscriptions = new ClSubscriptionHandler();

  ////////////// READONLY VARIABLE //////////////////
  private readonly collideRadius: number = 20;
  public readonly grey: string;
  private readonly textColor: string;
  private readonly backgroundColor: string;


  constructor(themeService: FlThemeService, private drawerState: FlBioNetworkDrawerState,
              private state: FlBioNetworkState, private selectionState: FlBioNetworkSelectionState,
              private zoomState: FlBioNetworkZoomState, private gridState: FlBioNetworkGridState,
              private groupState: FlBioNetworkGroupState,
              private ngZone: NgZone) {
    const themeDetail: FlThemeDetail = themeService.getCurrentThemeDetail();
    this.textColor = themeDetail.foreground;
    this.backgroundColor = themeDetail.background;
    this.grey = themeDetail.greyHighContrast;
  }

  public init(htmlContainer: HTMLElement, slideLinkColorToggle: boolean): void {
    this.htmlContainer = htmlContainer;
    this.chartWidth = htmlContainer.clientWidth;
    this.chartHeight = htmlContainer.clientHeight;
    this.linkColorLogarithm = slideLinkColorToggle;

    this.subscriptions.add(this.state.getChartData$().subscribe(
      chartData => this.drawNetwork(chartData)
    ));
  }

  private drawNetwork(chartData: FlBioxNetworkD3): void {
    // run the d3 rendering outside ng zone to avoir ng check
    this.ngZone.runOutsideAngular(() => {

      if (this.svg != null) {
        this.clearNetwork();
      }

      this.data = chartData;

      if (chartData) {
        this.enableSimulation = !chartData.hasPosition();
        this.simulationEnded = !this.enableSimulation;
        this.showCofactor = false;
        console.log('Enable simulation :', this.enableSimulation);

        // if there is no simulation init all position to avoid error
        if (!this.enableSimulation) {
          this.data.initPositions();
        }

        const mainGroup = this.initSVG();


        this.gridState.initGrid(mainGroup);
        this.groupState.initGroups(mainGroup);
        this.drawLinks(this.groupState.linkGroup, this.data.getMetaboliteLinks());
        this.drawNodes(this.groupState.nodeGroup, this.data.getMetabolitesAndReactions());
        this.defineArrowMarker();
        this.zoomState.enableZoom(this.svg, mainGroup, this.chartWidth, this.chartHeight);

        if (this.enableSimulation) {
          this.initSimulation();
          this.launchSimulation();

          // speed up the simulation to quickly end it
          this.simulation.tick(1000);
          this.simulation.on('end', () => this.endSimulation());
        }

        // init the selection state
        this.selectionState.init(chartData);
      }
    });
  }

  private initSVG(): FlD3SelectionSimple {
    this.svg = d3.select(this.htmlContainer)
      .append('svg')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight); // reset the opacity of node and link when clicking on svg

    //add encompassing group for the zoom
    return this.svg.append('g')
      .attr('class', 'everything');
  }


  ///////////////////////////////////////////////// Nodes ///////////////////////////////////////////////////////

  private drawNodes(selection: FlD3SelectionSimple, nodes: FlBioNetworkD3Node[]): void {
    const textColor: string = this.textColor;
    const backgroundColor: string = this.backgroundColor;
    const drag: any = d3.drag()
      .on('drag', (d) => this.dragNode(d));
    selection
      .selectAll('g')
      .data(nodes)
      .join('g')
      .call(drag)
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


    this.groupState.nodes.filter((d) => nodeToMoveIds.includes(d.id))
      .attr('transform',
        (d: FlBioNetworkD3Node) => 'translate(' + d.x + ',' + d.y + ')'
      );

    // refresh link points
    this.groupState.links
      .filter((d) => d.isLinkedToNode(dragEvent.subject.id))
      .attr('points', (d: FlBioNetworkD3Link) => d.getPolylinePoints());

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

  private drawLinks(selection: FlD3SelectionSimple, links: FlBioNetworkD3Link[]): void {
    selection
      .selectAll('polyline')
      .data(links)
      .join('polyline')
      .attr('stroke-opacity', 0.9)
      .attr('stroke-width', (d: FlBioNetworkD3Link) => d.getLinkWidth())
      .attr('marker-mid', 'url(#mid_arrow)')
      .attr('points', d => this.simulationEnded ? d.getPolylinePoints() : null)
      .each(d => d.visible = true);


    this.setLinksColors(this.linkColorLogarithm);
  }


  /**
   * Set the color of the links
   * @param linkColorLogarithm if true the colors are base on logarithm scale, and linear otherwise
   */
  public setLinksColors(linkColorLogarithm: boolean): void {
    this.linkColorLogarithm = linkColorLogarithm;
    const colorTransform: (value: number) => number = this.getLinkColorTransformFunction(linkColorLogarithm);
    const colorScale = this.getLinkColorScale(colorTransform);
    this.groupState.links
      .attr('stroke', (d: FlBioNetworkD3Link) => colorScale(colorTransform(d.value)));
  }

  // create a color scale for link
  private getLinkColorScale(colorTransform: (value: number) => number): ScaleLinear<string, any, any> {
    const range: [string, string, string] = ['red', this.grey, 'green'];

    return d3.scaleLinear<string>().domain(
      [colorTransform(-flBioNetworkReactionMaxValue), 0, colorTransform(flBioNetworkReactionMaxValue)])
      .range(range);
  }

  // return a function to apply on link value before calling the color scale
  private getLinkColorTransformFunction(logarithmColor: boolean): (value: number) => number {
    if (logarithmColor) {
      return (value => {
        // get the log 2 of absolute value
        const absLog2 = Math.log2(Math.abs(value) + 1);
        // return log 2 as positive or negative based on value
        return value > 0 ? absLog2 : -absLog2;
      });
    } else {
      return (value => value);
    }
  }


  // define the arrow marker to use it in lines
  private defineArrowMarker(): void {
    // define a marker for tha arrow
    this.svg.append('defs').append('marker')
      .attr('id', 'mid_arrow')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 4)
      .attr('markerHeight', 4)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', this.grey)
      .style('stroke', 'none');
  }

  /////////////////////////////////////////// SIMULATION //////////////////////////////////////////////

  private initSimulation(): void {
    this.simulation = d3.forceSimulation(this.data.getMetabolitesAndReactions())
      .force('link',
        d3.forceLink(this.data.links).distance(1)
          .id((d: FlBioNetworkD3Node) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-10))
      .force('center', d3.forceCenter(this.chartWidth / 2, this.chartHeight / 2))
      .force('collide', d3.forceCollide().radius(this.collideRadius));
  }

  private launchSimulation(): void {
    this.simulation.on('tick', () => {

      // refresh link points
      this.groupState.links.attr('points', (d: FlBioNetworkD3Link) => d.getPolylinePoints());

      // refresh nodes positions
      this.groupState.nodes.attr('transform',
        (d: FlBioNetworkD3Node) => 'translate(' + d.x + ',' + d.y + ')'
      );
    });

    // todo voir ce que c'est a appeler au onDestroy?
    // invalidation.then(() => simulation.stop());
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
      // save the new positions
      this.data.savePositions();
    }
  }

  /////////////////////////////////////////// COFACTORS //////////////////////////////////////////////

  public toggleCofactors(showCofactor: boolean): void {
    if (this.showCofactor === showCofactor) return;

    this.showCofactor = showCofactor;
    if (showCofactor) {
      for (const reaction of this.data.reactions) {
        // init cofactor positions
        const tSpaces = Math.PI * 2 / reaction.linkedNodes.length;
        let t = 0;
        const center: FlCoord = reaction.getCenter();


        for (const node of reaction.linkedNodes) {
          const x = 25 * Math.cos(t) + center.x;
          const y = 25 * Math.sin(t) + center.y;
          node.setCenter({x, y});
          t += tSpaces;
        }
      }

      this.drawNodes(this.groupState.cofactorGroup, this.data.cofactors);
      this.drawLinks(this.groupState.cofactorLinkGroup, this.data.getCofactorLinks());

    } else {
      this.clearGroup(this.groupState.cofactorGroup);
      this.clearGroup(this.groupState.cofactorLinkGroup);
    }
  }

  public getShowCofactor(): boolean {
    return this.showCofactor;
  }

  // clear the d3 selections and reset simulation
  private clearNetwork(): void {
    this.svg.remove();
    this.svg = null;
    this.simulationEnded = false;
    this.groupState.clearNetwork();
  }


  public exportAllNetwork(): FlBioNetwork {
    const network: FlBioNetwork = {
      metabolites: [],
      reactions: [],
      compartments: this.state.getSelectedNetwork().compartments,
      name: this.state.getSelectedNetwork().name
    };

    network.metabolites = this.data.metabolites.map(node => {
      return node.data;
    });
    network.reactions = this.data.reactions.map(node => {
      return node.data;
    });

    // add cofactor metabolite and check if there the metabolite was not already added (because cofactor are duplicated)
    // don't send position
    for (const cofactorD3 of this.data.cofactors) {
      const cofactor = cofactorD3.data;
      if (network.metabolites.findIndex(metabolite => metabolite.id === cofactor.id) === -1) {
        network.metabolites.push(cofactor);
      }
    }


    return network;
  }

  public getLinkColorLogarithm(): boolean {
    return this.linkColorLogarithm;
  }

  private clearGroup(selection: FlD3SelectionSimple): void {
    selection.selectAll('*').remove();
  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


}
