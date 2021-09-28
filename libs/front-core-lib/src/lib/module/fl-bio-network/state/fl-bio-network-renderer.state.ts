import * as d3 from 'd3';
import {Simulation} from 'd3-force';
import {ClHelpService, ClSubscriptionHandler} from '@monorepo/core-lib';
import {ScaleLinear} from 'd3-scale';
import {FlBioNetworkD3Link, FlBioNetworkD3Node, flBioNetworkReactionMaxValue, FlBioxNetworkD3} from '../model/fl-bio-network-d3.class';
import {FlD3DragEvent, FlD3SelectionSimple} from '../../fl-chart/model/fl-d3.class';
import {FlThemeService} from '../../../service/fl-theme.service';
import {FlBioNetworkDrawerState} from './fl-bio-network-drawer.state';
import {FlThemeDetail} from '../../../service/model/fl-theme-detail.class';
import {Injectable, OnDestroy} from '@angular/core';
import {FlBioNetworkState} from './fl-bio-network.state';
import {FlBioNetworkSelectionState} from './fl-bio-network-selection.state';
import {FlBioNetworkZoomState} from './fl-bio-network-zoom.state';
import {FlBioNetworkExportPosition} from '../model/fl-bio-network-export.class';
import {FlBioNetworkGridState} from './fl-bio-network-grid.state';

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
  private mainGroup: FlD3SelectionSimple;

  private nodesContainer: FlD3SelectionSimple<FlBioNetworkD3Node>;
  private links: FlD3SelectionSimple<FlBioNetworkD3Link>;

  private simulation: Simulation<FlBioNetworkD3Node, any>;
  private simulationEnded: boolean = false;

  // if true the link colors switch to logarithm
  private linkColorLogarithm: boolean;

  private readonly subscriptions = new ClSubscriptionHandler();

  ////////////// READONLY VARIABLE //////////////////
  private readonly collideRadius: number = 25;
  public readonly grey: string;
  private readonly textColor: string;
  private readonly backgroundColor: string;

  constructor(themeService: FlThemeService, private drawerState: FlBioNetworkDrawerState,
              private state: FlBioNetworkState, private selectionState: FlBioNetworkSelectionState,
              private zoomState: FlBioNetworkZoomState, private gridState: FlBioNetworkGridState) {
    const themeDetail: FlThemeDetail = themeService.getCurrentThemeDetail();
    this.textColor = themeDetail.foreground;
    this.backgroundColor = themeDetail.background;
    this.grey = themeDetail.greyHighContrast;
  }

  public init(htmlContainer: HTMLElement, slideLinkColorToggle: boolean): void {
    this.htmlContainer = htmlContainer;
    this.chartWidth = htmlContainer.clientWidth;
    // set height minus 10 to avoid scrollbar
    this.chartHeight = htmlContainer.clientHeight;
    this.linkColorLogarithm = slideLinkColorToggle;

    this.subscriptions.add(this.state.getChartData$().subscribe(
      chartData => this.drawNetwork(chartData)
    ));
  }

  private drawNetwork(chartData: FlBioxNetworkD3): void {
    if (this.svg != null) {
      this.clearNetwork();
    }

    this.data = chartData;

    if (chartData) {
      this.initSVG();
      this.initSimulation();
      this.gridState.initGrid(this.mainGroup);
      this.initLinks(this.linkColorLogarithm);
      this.initNodes();
      this.defineArrowMarker();
      this.zoomState.enableZoom(this.svg, this.mainGroup);
      this.launchSimulation();

      // speed up the simulation to quickly end it
      this.simulation.tick(1000);
      this.simulation.on('end', () => this.endSimulation());

      // init the selection state
      this.selectionState.init(chartData, this.nodesContainer, this.links);
    }
  }

  private initSVG(): void {
    this.svg = d3.select(this.htmlContainer)
      .append('svg')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight); // reset the opacity of node and link when clicking on svg

    //add encompassing group for the zoom
    this.mainGroup = this.svg.append('g')
      .attr('class', 'everything');
  }

  private initSimulation(): void {
    this.simulation = d3.forceSimulation(this.data.getAllNodes())
      .force('link',
        d3.forceLink(this.data.links).distance(100)
          .id((d: FlBioNetworkD3Node) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-40))
      .force('center', d3.forceCenter(this.chartWidth / 2, this.chartHeight / 2))
      .force('collide', d3.forceCollide().radius(this.collideRadius));
  }

  private launchSimulation(): void {
    this.simulation.on('tick', () => {

      // refresh link points
      this.links.attr('points', (d: FlBioNetworkD3Link) => d.getPolylinePoints());

      // refresh nodes positions
      this.nodesContainer.attr('transform',
        (d: FlBioNetworkD3Node) => 'translate(' + d.x + ',' + d.y + ')'
      );
    });

    // todo voir ce que c'est a appeler au onDestroy?
    // invalidation.then(() => simulation.stop());
  }

  private initNodes(): void {
    this.nodesContainer = this.mainGroup.append('g')
      .selectAll('g')
      .data(this.data.getAllNodes())
      .join('g')
      .call(this.drag(this.simulation))
      .style('cursor', 'pointer')
      .on('click', this.onNodeClicked());


    const textColor: string = this.textColor;
    const backgroundColor: string = this.backgroundColor;
    this.nodesContainer.each(function (this: SVGElement, d) {
      d.drawNodeAndText(this, textColor, backgroundColor);
    });
  }


  private initLinks(logarithmColor: boolean): void {
    this.links = this.mainGroup.append('g')
      .selectAll('polyline')
      .data(this.data.links)
      .join('polyline')
      .attr('stroke-opacity', 0.9)
      .attr('stroke-width', (d: FlBioNetworkD3Link) => d.absLog10Value + 1)
      .attr('marker-mid', 'url(#mid_arrow)') as any;

    this.setLinksColors(logarithmColor);
  }

  private drag = (simulation: any): any => {
    const gridState: FlBioNetworkGridState = this.gridState;

    function dragStarted(event: FlD3DragEvent<FlBioNetworkD3Node>): void {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: FlD3DragEvent<FlBioNetworkD3Node>): void {
      const roundedCoord = gridState.roundCoordOnGrid(event.subject.convertToCenterCoord(event));

      if (roundedCoord) {
        event.subject.setCenter(roundedCoord);
      } else {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
    }

    function dragEnded(event: any): void {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded);
  };

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
      this.selectionState.selectNodeAndDirectLinks(clickedNode.index);

      // open the drawer with detail
      this.drawerState.newAction({
        action: 'nodeDetail',
        selectedNode: clickedNode
      });
    };
  }

  /**
   * Set the color of the links
   * @param linkColorLogarithm if true the colors are base on logarithm scale, and linear otherwise
   */
  public setLinksColors(linkColorLogarithm: boolean): void {
    this.linkColorLogarithm = linkColorLogarithm;
    const colorTransform: (value: number) => number = this.getLinkColorTransformFunction(linkColorLogarithm);
    const colorScale = this.getLinkColorScale(colorTransform);
    this.links
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
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', this.grey)
      .style('stroke', 'none');
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
    }
  }

  // clear the d3 selections and reset simulation
  private clearNetwork(): void {
    this.svg.remove();
    this.svg = null;
    this.mainGroup = null;
    this.links = null;
    this.nodesContainer = null;
    this.simulationEnded = false;
  }


  public exportPositions(): FlBioNetworkExportPosition {
    const position: FlBioNetworkExportPosition = {
      metabolites: [],
      reactions: []
    };

    position.metabolites = this.data.metabolites.map(node => {
      const coord = node.getCenter()
      return {
        x: coord.x,
        y: coord.y,
        id: node.data.chebi_id
      };
    });
    position.reactions = this.data.reactions.map(node => {
      const coord = node.getCenter()
      return {
        x: coord.x,
        y: coord.y,
        id: node.data.id
      };
    });
    return position;
  }


  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


}
