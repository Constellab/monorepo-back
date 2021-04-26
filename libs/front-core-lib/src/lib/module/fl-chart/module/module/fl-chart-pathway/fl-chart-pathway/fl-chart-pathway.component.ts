import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as d3 from 'd3';
import {bigPathwayData, realPathwayData} from '../data';
import {FlChartPathwayData, FlChartPathwayLink, FlChartPathwayNode, FlPathway} from '../model/fl-pathway.class';

@Component({
  selector: 'fl-chart-pathway',
  templateUrl: './fl-chart-pathway.component.html',
  styleUrls: ['./fl-chart-pathway.component.scss']
})
export class FlChartPathwayComponent implements OnInit {

  @ViewChild('chart', {static: true}) chartHtmlContainer: ElementRef<HTMLElement>;

  height = 1000;
  width = 1000;

  constructor() {
  }

  ngOnInit(): void {
    const data: FlChartPathwayData = this.convertPathwayToChartPathway(realPathwayData);
    this.initChart(data);
  }

  private initChart(data: FlChartPathwayData): void {

    const simulation = d3.forceSimulation([...data.metabolites, ...data.reactions])
      .force('link', d3.forceLink(data.links).distance(100).id((d: FlChartPathwayLink<FlChartPathwayNode>) => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

    const svg = d3.select(this.chartHtmlContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    const link = svg.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('stroke-width', (d: FlChartPathwayLink<FlChartPathwayNode>) => Math.sqrt(d.value));

    const metabolites = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('g')
      .data(data.metabolites)
      .join('g')
      .call(this.drag(simulation));

    metabolites
      .append('circle')
      .join('circle')
      .attr('r', 20)
      .attr('fill', 'red');

    const reactions = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('g')
      .data(data.reactions)
      .join('g')
      .call(this.drag(simulation));

    // create the rect of reaction
    reactions.append('rect')
      .join('rect')
      .attr('width', 60)
      .attr('height', 30)
      .attr('fill', 'red');


    // create the text for matabolite
    metabolites.append('text')
      .text((d: FlChartPathwayNode) => d.name.substr(0,5))
      .style('text-anchor', 'middle')
      .style('font-weight', 'lighter')
      .style('font-size', '1em');

    // create the text for reaction
    reactions.append('text')
      .text((d: FlChartPathwayNode) => d.name.substr(0,5))
      .attr('y', '1.5em')
      .attr('x', '2em')
      .style('text-anchor', 'middle')
      .style('font-weight', 'lighter')
      .style('font-size', '1em');


    metabolites.append('title')
      .text((d: FlChartPathwayNode) => d.name);
    reactions.append('title')
      .text((d: FlChartPathwayNode) => d.name);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: FlChartPathwayLink<FlChartPathwayNode>) => d.source.x)
        .attr('y1', (d: FlChartPathwayLink<FlChartPathwayNode>) => d.source.y)
        .attr('x2', (d: FlChartPathwayLink<FlChartPathwayNode>) => d.target.x)
        .attr('y2', (d: FlChartPathwayLink<FlChartPathwayNode>) => d.target.y);

      // metabolites
      //   .attr('cx', (d: any) => d.x)
      //   .attr('cy', (d: any) => d.y);

      metabolites.attr('transform',
        (d: FlChartPathwayNode) => 'translate(' + d.x + ',' + d.y + ')'
      );

      reactions
        .attr('transform',
          (d: FlChartPathwayNode) => 'translate(' + d.x + ',' + d.y + ')'
        );
    });

    // invalidation.then(() => simulation.stop());

    // return svg.node();
  }

  drag = (simulation: any): any => {

    function dragstarted(event: any): void {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any): void {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any): void {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

  private convertPathwayToChartPathway(pathway: FlPathway): FlChartPathwayData {
    const data: FlChartPathwayData = {
      metabolites: [],
      reactions: [],
      links: []
    };

    // create the metabolites nodes
    for (const metabolite of pathway.metabolites) {
      data.metabolites.push({
        id: metabolite.id,
        type: 'metabolite',
        name: metabolite.name
      });
    }

    // create the reactions nodes
    for (const reaction of pathway.reactions) {
      data.reactions.push({
        id: reaction.id,
        type: 'reaction',
        name: reaction.name
      });
    }

    // create the links
    for (const reaction of pathway.reactions) {
      for (const metaboliteId of Object.keys(reaction.metabolites)) {
        const reactionValue: number = reaction.metabolites[metaboliteId];

        // right side of the link
        if (reactionValue > 0) {
          data.links.push({
            source: reaction.id,
            target: metaboliteId,
            value: reactionValue,
          });
        }
        // left side of the link
        else {
          data.links.push({
            source: metaboliteId,
            target: reaction.id,
            value: Math.abs(reactionValue)
          });
        }
      }
    }

    console.log(data);
    return data;
  }


}
