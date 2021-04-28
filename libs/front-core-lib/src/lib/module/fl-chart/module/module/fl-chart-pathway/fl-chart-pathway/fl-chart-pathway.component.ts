import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {FlChartPathwayData, FlChartPathwayLink, FlChartPathwayNode, FlPathway} from '../model/fl-pathway.class';
import {FlCoord, FlD3SelectionSimple, FlD3ZoomEvent} from '../../../../model/fl-d3.class';
import {Simulation} from 'd3-force';
import {FlChartPathwayFactory} from '../fl-chart-pathway.factory';
import {ValueFn} from 'd3-selection';
import {ClHelpService} from '@monorepo/core-lib';
import {FlThemeService} from '../../../../../../service/fl-theme.service';
import {FlThemeDetail} from '../../../../../../service/model/fl-theme-detail.class';

@Component({
  selector: 'fl-chart-pathway',
  templateUrl: './fl-chart-pathway.component.html',
  styleUrls: ['./fl-chart-pathway.component.scss']
})
export class FlChartPathwayComponent implements OnInit {

  @Input() data: FlPathway;

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  chartHeight: number;
  chartWidth: number;

  chartData: FlChartPathwayData;

  simulation: Simulation<FlChartPathwayNode, any>;

  svg: FlD3SelectionSimple;
  mainGroup: FlD3SelectionSimple;

  metabolites: FlD3SelectionSimple<FlChartPathwayNode>;
  reactions: FlD3SelectionSimple<FlChartPathwayNode>;
  links: FlD3SelectionSimple<FlChartPathwayLink<FlChartPathwayNode>>;


  simulationEnded: boolean = false;

  ////////////// READONLY VARIABLE //////////////////


  // size for the reaction rect
  readonly reactionWidth: number = 45;
  readonly reactionHeight: number = 12;

  readonly metaboliteRadius: number = 7;

  readonly collideRadius: number = 25;
  readonly grey: string = '#999';
  readonly textColor: string;
  readonly backgroundColor: string;

  constructor(themeService: FlThemeService) {
    const themeDetail: FlThemeDetail = themeService.getCurrentThemeDetail();
    this.textColor = themeDetail.foreground;
    this.backgroundColor = themeDetail.background;
  }

  ngOnInit(): void {
    if (this.data == null) {
      console.error('[FlChartPathwayComponent] Data not provided');
    }

    this.initChartSize();

    this.chartData = FlChartPathwayFactory.convertPathwayToChartPathway(this.data, this.grey);

    this.initSVG();
    this.initSimulation();
    this.initLinks();
    this.initMetabolites();
    this.initReactions();
    this.defineArrowMarker();
    this.enableZoom();
    this.launchSimulation();

    // speed up the simulation to quickly end it
    this.simulation.tick(1000);

    this.simulation.on('end', () => this.endSimulation());
  }

  private initChartSize(): void {
    this.chartWidth = this.chartHtmlContainer.nativeElement.clientWidth;
    this.chartHeight = this.chartHtmlContainer.nativeElement.clientHeight;
  }

  private initSimulation(): void {
    this.simulation = d3.forceSimulation([...this.chartData.metabolites, ...this.chartData.reactions])
      .force('link',
        d3.forceLink(this.chartData.links).distance(100)
          .id((d: FlChartPathwayNode) => d.id)
        // .strength((d: FlChartPathwayLink<FlChartPathwayNode>) => d.absValue)
      )
      .force('charge', d3.forceManyBody().strength(-40))
      .force('center', d3.forceCenter(this.chartWidth / 2, this.chartHeight / 2))
      .force('collide', d3.forceCollide().radius(this.collideRadius));
  }

  // disable all force so the user can move the node independently
  private endSimulation(): void {
    if (!this.simulationEnded) {
      // clear all forces, so the user can drag easily
      this.simulation.force('link', null);
      this.simulation.force('charge', null);
      this.simulation.force('center', null);
      this.simulation.force('collide', null);
      this.simulationEnded = true;
    }
  }

  private initSVG(): void {
    this.svg = d3.select(this.chartHtmlContainer.nativeElement)
      .append('svg')
      .attr('width', this.chartWidth)
      .attr('height', this.chartHeight)
      .on('click', this.resetNodeAndLinkOpacity()); // reset the opacity of node and link when clicking on svg

    //add encompassing group for the zoom
    this.mainGroup = this.svg.append('g')
      .attr('class', 'everything');
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
      .data(this.chartData.metabolites)
      .join('g')
      .call(this.drag(this.simulation));

    // create the circles
    this.metabolites
      .append('circle')
      .join('circle')
      .attr('r', this.metaboliteRadius)
      .attr('stroke', (d: FlChartPathwayNode) => d.color)
      .attr('stroke-width', 1)
      .attr('fill', 'white')
      .style('cursor', 'pointer')
      .on('click', this.updateLinkAndNodeOpacity(0.1));


    // create the text for metabolite
    this.metabolites.append('text')
      .text((d: FlChartPathwayNode) => d.name.substr(0, 5))
      .attr('y', this.metaboliteRadius)
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
      .data(this.chartData.reactions)
      .join('g')
      .call(this.drag(this.simulation))
      .style('cursor', 'pointer')
      .on('click', this.updateLinkAndNodeOpacity(0.1));

    // create the rect of reaction
    this.reactions.append('rect')
      .join('rect')
      .attr('width', this.reactionWidth)
      .attr('height', this.reactionHeight)
      .attr('stroke', this.grey)
      .attr('stroke-width', 1)
      .attr('fill', 'white');

    // create the text for reaction
    this.reactions.append('text')
      .text((d: FlChartPathwayNode) => d.name.substr(0, 10))
      .attr('y', this.reactionHeight / 2) // center y
      .attr('x', this.reactionWidth / 2) // center x
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('fill', 'black')
      .style('font-size', '0.5em');
    //text-shadow:;

    this.reactions.append('title')
      .text((d: FlChartPathwayNode) => d.name);
  }

  private initLinks(): void {
    this.links = this.mainGroup.append('g')
      .attr('stroke', this.grey)
      .attr('stroke-opacity', 0.6)
      .selectAll('polyline')
      .data(this.chartData.links)
      .join('polyline')
      .attr('stroke-width', (d: FlChartPathwayLink<FlChartPathwayNode>) => d.absValue)
      .attr('marker-mid', 'url(#mid_arrow)') as any;
  }


  drag = (simulation: any): any => {

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
    const lineCoord: [FlCoord, FlCoord] = this.getLineCoords(d);

    // calculate the middle point
    const midCoord: FlCoord = {
      x: (lineCoord[0].x + lineCoord[1].x) / 2,
      y: (lineCoord[0].y + lineCoord[1].y) / 2
    };

    return `${lineCoord[0].x},${lineCoord[0].y}
            ${midCoord.x},${midCoord.y}
            ${lineCoord[1].x},${lineCoord[1].y} `;
  }

  // returns the coord of the line
  private getLineCoords(d: FlChartPathwayLink<FlChartPathwayNode>): [FlCoord, FlCoord] {
    // attach it to the center
    if (d.isPositive()) {
      return [
        {x: d.source.x + (this.reactionWidth / 2), y: d.source.y + (this.reactionHeight / 2)},
        {x: d.target.x, y: d.target.y}
      ];
    } else {
      // otherwise link it to the left of the rect
      return [
        {x: d.source.x, y: d.source.y},
        {x: d.target.x + (this.reactionWidth / 2), y: d.target.y + (this.reactionHeight / 2)}
      ];
    }
  }

  // return all the directly connected node of the node
  private getConnectedNodes(nodeIndex: number): FlChartPathwayNode[] {
    return this.chartData.links
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
  private updateLinkAndNodeOpacity(opacity: number): any {
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

  private resetNodeAndLinkOpacity(): any {
    return () => {

      // update opacity of metabolites and reaction
      this.metabolites.style('opacity', 1);
      this.reactions.style('opacity', 1);

      // update link opacity
      this.links.style('opacity', 1);
    };
  }


  // link to rect x
  // if value is positive, link to the right of the rect
  // if (d.isPositive()) {
  //   return [
  //     {x: d.source.x + this.reactionWidth, y: d.source.y + (this.reactionHeight / 2)},
  //     {x: d.target.x, y: d.target.y}
  //   ];
  // } else {
  //   // otherwise link it to the left of the rect
  //   return [
  //     {x: d.source.x, y: d.source.y},
  //     {x: d.target.x, y: d.target.y + (this.reactionHeight / 2)}
  //   ];
  // }

  // define the arrow marker to use it in lines
  private defineArrowMarker(): void {
    // define a marker for tha arrow
    this.svg.append('defs').append('marker')
      .attr('id', 'mid_arrow')
      .attr('viewBox', '-0 -5 10 10')
      .attr('refX', 10)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
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

}
