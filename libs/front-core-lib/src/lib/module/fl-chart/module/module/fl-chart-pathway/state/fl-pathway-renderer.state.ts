import * as d3 from 'd3';
import {Simulation} from 'd3-force';
import {ClHelpService} from '@monorepo/core-lib';
import {ValueFn} from 'd3-selection';
import {ScaleLinear} from 'd3-scale';
import {
  FlChartPathwayData,
  FlChartPathwayLink,
  FlChartPathwayNode,
  flPathwayMetaboliteRadius,
  flPathwayReactionHeight,
  flPathwayReactionMaxValue,
  flPathwayReactionWidth
} from '../model/fl-chart-pathway.class';
import {FlCoord, FlD3SelectionSimple, FlD3ZoomEvent} from '../../../../model/fl-d3.class';
import {FlThemeService} from '../../../../../../service/fl-theme.service';
import {FlPathwayDrawerState} from './fl-pathway-drawer.state';
import {FlThemeDetail} from '../../../../../../service/model/fl-theme-detail.class';
import {Injectable} from '@angular/core';

/**
 * State to manager the drawing of pathway network using d3
 */
@Injectable()
export class FlPathwayRendererState {

  private htmlContainer: HTMLElement;
  private chartHeight: number;
  private chartWidth: number;

  private data: FlChartPathwayData;

  private svg: FlD3SelectionSimple;
  private mainGroup: FlD3SelectionSimple;

  private metabolites: FlD3SelectionSimple<FlChartPathwayNode>;
  private reactions: FlD3SelectionSimple<FlChartPathwayNode>;
  private links: FlD3SelectionSimple<FlChartPathwayLink<FlChartPathwayNode>>;

  private simulation: Simulation<FlChartPathwayNode, any>;
  private simulationEnded: boolean = false;

  ////////////// READONLY VARIABLE //////////////////
  private readonly collideRadius: number = 25;
  public readonly grey: string = '#999';
  private readonly textColor: string;
  private readonly backgroundColor: string;
  private readonly selectNodeColor: string;

  constructor(themeService: FlThemeService, private drawerState: FlPathwayDrawerState) {
    const themeDetail: FlThemeDetail = themeService.getCurrentThemeDetail();
    this.textColor = themeDetail.foreground;
    this.backgroundColor = themeDetail.background;
    this.selectNodeColor = themeDetail.warn;
    this.grey = themeDetail.greyHighContrast;
  }

  public init(htmlContainer: HTMLElement): void {
    this.htmlContainer = htmlContainer;
    this.chartWidth = htmlContainer.clientWidth;
    // set height minus 10 to avoid scrollbar
    this.chartHeight = htmlContainer.clientHeight - 10;
  }

  public drawPathway(chartData: FlChartPathwayData, linkLogarithmColor: boolean): void {
    if (this.svg != null) {
      this.clearPathway();
    }

    this.data = chartData;

    if (chartData) {
      this.initSVG();
      this.initSimulation();
      this.initLinks(linkLogarithmColor);
      this.initMetabolites();
      this.initReactions();
      this.defineArrowMarker();
      this.enableZoom();
      this.launchSimulation();

      // speed up the simulation to quickly end it
      this.simulation.tick(1000);
      this.simulation.on('end', () => this.endSimulation());
    }
  }

  private initSVG(): void {
    this.svg = d3.select(this.htmlContainer)
      .append('svg')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .on('click', () => this.resetNodeAndLinkOpacity()); // reset the opacity of node and link when clicking on svg

    //add encompassing group for the zoom
    this.mainGroup = this.svg.append('g')
      .attr('class', 'everything');
  }

  private initSimulation(): void {
    this.simulation = d3.forceSimulation([...this.data.metabolites, ...this.data.reactions])
      .force('link',
        d3.forceLink(this.data.links).distance(100)
          .id((d: FlChartPathwayNode) => d.id)
        // .strength((d: FlChartPathwayLink<FlChartPathwayNode>) => d.absValue)
      )
      .force('charge', d3.forceManyBody().strength(-40))
      .force('center', d3.forceCenter(this.chartWidth / 2, this.chartHeight / 2))
      .force('collide', d3.forceCollide().radius(this.collideRadius));
  }

  private launchSimulation(): void {
    this.simulation.on('tick', () => {

      // refresh link points
      this.links.attr('points', (d: FlChartPathwayLink<FlChartPathwayNode>) => this.getPolylinePoints(d));

      // refresh metabolites positions
      this.metabolites.attr('transform',
        (d: FlChartPathwayNode) => 'translate(' + d.x + ',' + d.y + ')'
      );

      // refresh reaction positions
      this.reactions
        .attr('transform',
          (d: FlChartPathwayNode) => 'translate(' + d.x + ',' + d.y + ')'
        );
    });

    // todo voir ce que c'est a appeler au onDestroy?
    // invalidation.then(() => simulation.stop());
  }

  private initMetabolites(): void {
    this.metabolites = this.mainGroup.append('g')
      .selectAll('g')
      .data(this.data.metabolites)
      .join('g')
      .call(this.drag(this.simulation));

    // create the circles
    this.metabolites
      .append('circle')
      .join('circle')
      .attr('r', flPathwayMetaboliteRadius)
      .attr('stroke', (d: FlChartPathwayNode) => d.color)
      .attr('stroke-width', 1)
      .attr('fill', 'white')
      .style('cursor', 'pointer')
      .on('click', this.onNodeClicked(0.1));


    // create the text for metabolite
    this.metabolites.append('text')
      .text((d: FlChartPathwayNode) => d.name.substr(0, 5))
      .attr('y', flPathwayMetaboliteRadius)
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .attr('fill', this.textColor)
      .style('text-shadow', this.getTextShadow())
      .style('font-size', '0.5em');

    this.metabolites.append('title')
      .text((d: FlChartPathwayNode) => d.name);
  }

  private initReactions(): void {
    this.reactions = this.mainGroup.append('g')
      .selectAll('g')
      .data(this.data.reactions)
      .join('g')
      .call(this.drag(this.simulation))
      .style('cursor', 'pointer')
      .on('click', this.onNodeClicked(0.1));

    // create the rect of reaction
    this.reactions.append('rect')
      .join('rect')
      .attr('width', flPathwayReactionWidth)
      .attr('height', flPathwayReactionHeight)
      .attr('stroke', this.grey)
      .attr('stroke-width', 1)
      .attr('fill', 'white');

    // create the text for reaction
    this.reactions.append('text')
      .text((d: FlChartPathwayNode) => d.name.substr(0, 10))
      .attr('x', flPathwayReactionWidth / 2) // center x
      .attr('y', flPathwayReactionHeight / 2) // center y
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '0.5em');
    //text-shadow:;

    this.reactions.append('title')
      .text((d: FlChartPathwayNode) => d.name);
  }

  private initLinks(logarithmColor: boolean): void {
    this.links = this.mainGroup.append('g')
      .selectAll('polyline')
      .data(this.data.links)
      .join('polyline')
      .attr('stroke-opacity', 0.9)
      .attr('stroke-width', (d: FlChartPathwayLink<FlChartPathwayNode>) => d.absLog10Value)
      .attr('marker-mid', 'url(#mid_arrow)') as any;

    this.setLinksColors(logarithmColor);
  }

  private drag = (simulation: any): any => {

    function dragStarted(event: any): void {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any): void {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
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

  private enableZoom(): void {
    //add zoom capabilities
    const zoom_handler = d3.zoom()
      .on('zoom', (event) => this.zoom_actions(event));

    zoom_handler(this.svg);
  }

  //Zoom functions
  private zoom_actions(event: FlD3ZoomEvent): void {
    this.mainGroup.attr('transform', event.transform.toString());
  }

  // return points for the line with a point in middle to draw the arrow
  private getPolylinePoints(d: FlChartPathwayLink<FlChartPathwayNode>): string {
    const startCoord: FlCoord = d.source.getCenter();
    const endCoord: FlCoord = d.target.getCenter();

    // calculate the middle point
    const midCoord: FlCoord = {
      x: (startCoord.x + endCoord.x) / 2,
      y: (startCoord.y + endCoord.y) / 2
    };

    return `${startCoord.x},${startCoord.y}
            ${midCoord.x},${midCoord.y}
            ${endCoord.x},${endCoord.y} `;
  }

  // return all the directly connected node of the node
  private getConnectedNodes(nodeIndex: number): FlChartPathwayNode[] {
    return this.data.links
      // filter the link directly connected
      .filter(link => link.target.index === nodeIndex || link.source.index === nodeIndex)
      // get the connected node (the one not with different index)
      .map(link => link.target.index === nodeIndex ? link.source : link.target);
  }

  /**
   * Update the opacity of node and link not connected to clicked node
   * to the opacity provided
   * @param opacity
   * @private
   */
  private onNodeClicked(opacity: number): any {
    return (mouseEvent: MouseEvent, clickedNode: FlChartPathwayNode) => {
      // stop the event propagation do prevent click event on svg that reset the opacity
      ClHelpService.stopEventPropagation(mouseEvent);

      // retrieve connected node
      const connectedNodes: FlChartPathwayNode[] = this.getConnectedNodes(clickedNode.index);

      // update opacity of metabolites and reaction
      this.metabolites.style('opacity', this.updateNodeOpacity(opacity, clickedNode, connectedNodes));
      this.reactions.style('opacity', this.updateNodeOpacity(opacity, clickedNode, connectedNodes));

      // update link opacity
      this.links.style('opacity', this.updateLinkOpacity(opacity, clickedNode));

      // set a specific color to the selected node
      this.metabolites.selectAll('circle')
        .attr('stroke', (d: FlChartPathwayNode) => d.index === clickedNode.index ? this.selectNodeColor : d.color);
      this.reactions.selectAll('rect')
        .attr('stroke', (d: FlChartPathwayNode) => d.index === clickedNode.index ? this.selectNodeColor : d.color);

      // open the drawer with detail
      this.drawerState.newAction({
        action: 'nodeDetail',
        title: clickedNode.name,
        data: clickedNode
      });
    };
  }

  // update the opacity of node that are not the clickedNode or in connected node
  private updateNodeOpacity(opacity: number, clickedNode: FlChartPathwayNode, connectedNodes: FlChartPathwayNode[])
    : ValueFn<any, any, number> {
    return (other: FlChartPathwayNode) => {
      return clickedNode.index === other.index ||
      connectedNodes.findIndex((connected) => connected.index === other.index) >= 0 ? 1 : opacity;
    };
  }

  // update the opacity to opacity on link that are not connected to node
  private updateLinkOpacity(opacity: number, clickedNode: FlChartPathwayNode): ValueFn<any, any, number> {
    return (other: FlChartPathwayLink<FlChartPathwayNode>) => {
      return other.source.index === clickedNode.index || other.target.index === clickedNode.index ? 1 : opacity;
    };
  }

  public resetNodeAndLinkOpacity(): any {
    // update opacity of metabolites and reaction
    this.metabolites.style('opacity', 1);
    this.reactions.style('opacity', 1);

    // set a specific color to the selected node
    this.metabolites.selectAll('circle')
      .attr('stroke', (d: FlChartPathwayNode) => d.color);
    this.reactions.selectAll('rect')
      .attr('stroke', (d: FlChartPathwayNode) => d.color);

    // update link opacity
    this.links.style('opacity', 1);
  }

  /**
   * Set the color of the links
   * @param logarithmColor if true the colors are base on logarithm scale, and linear otherwise
   */
  public setLinksColors(logarithmColor: boolean): void {
    const colorTransform: (value: number) => number = this.getLinkColorTransformFunction(logarithmColor);
    const colorScale = this.getLinkColorScale(colorTransform);
    this.links
      .attr('stroke', (d: FlChartPathwayLink<FlChartPathwayNode>) => colorScale(colorTransform(d.value)));
  }

  // create a color scale for link
  private getLinkColorScale(colorTransform: (value: number) => number): ScaleLinear<string, any, any> {
    const range: [string, string, string] = ['red', '#E8F5E9', 'green'];

    return d3.scaleLinear<string>().domain(
      [colorTransform(-flPathwayReactionMaxValue), 0, colorTransform(flPathwayReactionMaxValue)])
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

  // set opacity to 0.1 to link where abs value is lower than slider value
  public hideLinkLowerThan(value: number): void {
    // update link opacity
    this.links.style('opacity', (link: FlChartPathwayLink<FlChartPathwayNode>) =>
      link.absValue >= value ? 1 : 0.1);
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
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', this.grey)
      .style('stroke', 'none');
  }

  private getTextShadow(): string {
    return `-1px -1px 0 ${this.backgroundColor}, 1px -1px 0 ${this.backgroundColor},
            -1px 1px 0 ${this.backgroundColor}, 1px 1px 0 ${this.backgroundColor}`;
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
  private clearPathway(): void {
    this.svg.remove();
    this.svg = null;
    this.mainGroup = null;
    this.metabolites = null;
    this.reactions = null;
    this.links = null;
    this.simulationEnded = false;
  }

}
