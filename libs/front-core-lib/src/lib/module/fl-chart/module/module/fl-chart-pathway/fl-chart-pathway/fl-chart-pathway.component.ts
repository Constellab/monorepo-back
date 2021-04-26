import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {bigPathwayData} from '../data';
import {FlChartPathwayData, FlChartPathwayLink, FlChartPathwayNode, FlPathway} from '../model/fl-pathway.class';
import {FlCoord, FlD3SelectionSimple, FlD3ZoomEvent} from '../../../../model/fl-d3.class';
import {FlColorHelper} from '../../../../../../utils/fl-color-helper.class';
import {Simulation} from 'd3-force';

@Component({
  selector: 'fl-chart-pathway',
  templateUrl: './fl-chart-pathway.component.html',
  styleUrls: ['./fl-chart-pathway.component.scss']
})
export class FlChartPathwayComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  data: FlChartPathwayData;

  simulation: Simulation<FlChartPathwayNode, any>;

  svg: FlD3SelectionSimple;
  mainGroup: FlD3SelectionSimple;

  metabolites: FlD3SelectionSimple<FlChartPathwayNode>;
  reactions: FlD3SelectionSimple<FlChartPathwayNode>;
  links: FlD3SelectionSimple<FlChartPathwayLink<FlChartPathwayNode>>;


  simulationEnded: boolean = false;

  ////////////// READONLY VARIABLE //////////////////

  readonly height = 1000;
  readonly width = 1000;

  // size for the reaction rect
  readonly reactionWidth: number = 45;
  readonly reactionHeight: number = 12;

  readonly metaboliteRadius: number = 7;

  readonly collideRadius: number = 25;
  readonly grey: string = '#999';

  constructor() {
  }

  ngOnInit(): void {
    this.data = this.convertPathwayToChartPathway(bigPathwayData);

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

  private initSimulation(): void {
    this.simulation = d3.forceSimulation([...this.data.metabolites, ...this.data.reactions])
      .force('link',
        d3.forceLink(this.data.links).distance(100)
          .id((d: FlChartPathwayNode) => d.id)
        // .strength((d: FlChartPathwayLink<FlChartPathwayNode>) => d.absValue)
      )
      .force('charge', d3.forceManyBody().strength(-40))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2))
      .force('collide', d3.forceCollide().radius(this.collideRadius));
  }

  // disable all force so the user can move the node independently
  private endSimulation(): void{
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
      .attr('width', this.width)
      .attr('height', this.height);

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
      .data(this.data.metabolites)
      .join('g')
      .call(this.drag(this.simulation));

    // create the circles
    this.metabolites
      .append('circle')
      .join('circle')
      .attr('r', this.metaboliteRadius)
      .attr('stroke', (d: FlChartPathwayNode) => d.color)
      .attr('stroke-width', 1)
      .attr('fill', 'white');


    // create the text for metabolite
    this.metabolites.append('text')
      .text((d: FlChartPathwayNode) => d.name.substr(0, 5))
      .attr('y', this.metaboliteRadius)
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .attr('fill', this.grey)
      .style('font-size', '0.5em');

    this.metabolites.append('title')
      .text((d: FlChartPathwayNode) => d.name);
  }

  private initReactions(): void {
    this.reactions = this.mainGroup.append('g')
      .selectAll('g')
      .data(this.data.reactions)
      .join('g')
      .call(this.drag(this.simulation));

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
      .attr('fill', this.grey)
      .style('font-size', '0.5em');


    this.reactions.append('title')
      .text((d: FlChartPathwayNode) => d.name);
  }

  private initLinks(): void {
    this.links = this.mainGroup.append('g')
      .attr('stroke', this.grey)
      .attr('stroke-opacity', 0.6)
      .selectAll('polyline')
      .data(this.data.links)
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
      .attr('markerWidth', 10)
      .attr('markerHeight', 10)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', this.grey)
      .style('stroke', 'none');
  }


  private convertPathwayToChartPathway(pathway: FlPathway): FlChartPathwayData {
    const data: FlChartPathwayData = {
      metabolites: [],
      reactions: [],
      links: []
    };

    // create the metabolites nodes
    for (const metabolite of pathway.metabolites) {
      const color: string = metabolite.compartment ?
        FlColorHelper.stringToRGBColor(metabolite.compartment) : this.grey;


      data.metabolites.push(
        new FlChartPathwayNode(metabolite.id,
          metabolite.name ? metabolite.name : metabolite.id,
          'metabolite',
          color
        ));
    }

    // create the reactions nodes
    for (const reaction of pathway.reactions) {
      data.reactions.push(new FlChartPathwayNode(reaction.id,
        reaction.name ? reaction.name : reaction.id, 'reaction',
        this.grey
      ));
    }

    // create the links
    for (const reaction of pathway.reactions) {
      for (const metaboliteId of Object.keys(reaction.metabolites)) {
        const reactionValue: number = reaction.metabolites[metaboliteId];

        // right side of the link
        if (reactionValue > 0) {
          data.links.push(new FlChartPathwayLink(reaction.id, metaboliteId, reactionValue));
        }
        // left side of the link
        else {
          data.links.push(new FlChartPathwayLink(metaboliteId, reaction.id, reactionValue));
        }
      }
    }

    return data;
  }

}
