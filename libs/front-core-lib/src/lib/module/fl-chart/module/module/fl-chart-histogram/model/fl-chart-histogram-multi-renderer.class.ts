import {FlChart2dRendererInput, FlChart2dRendererMultiple} from '../../../../model/fl-chart-2d-renderer.class';
import {select} from 'd3';
import {FlChart2dMultipleSerie, FlChartDataWithSerie} from '../../../../model/fl-chart-2d-serie.class';
import {FlChart2dDatum} from '../../../../model/fl-chart-2d-data.class';


export class FlChartHistogramMultiRenderer
  extends FlChart2dRendererMultiple<FlChart2dMultipleSerie<FlChart2dDatum>> {


  initData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
    this.initColor(input.data);


    const data: FlChartDataWithSerie[][] = input.data.invert();


    const groupWidthWithPadding: number = input.chartWidth / input.data.countSerie();

    // 5 % of left padding in a serie
    const groupLeftPadding: number = groupWidthWithPadding / 20;
    const groupWidth: number = groupWidthWithPadding - (2 * groupLeftPadding);


    // Show the bars
    // input.container.append('g')
    //   .selectAll('g')
    //   // Enter in data = loop group per group
    //   .data(data)
    //   .enter()
    //   .append('g')
    //   .attr('transform', function (d) {
    //     return 'translate(' + x(d.group) + ',0)';
    //   })
    //   .selectAll('rect')
    //   .data(function (d) {
    //     return subgroups.map(function (key) {
    //       return {key: key, value: d[key]};
    //     });
    //   })
    //   .enter().append('rect')
    //   .attr('x', function (d) {
    //     return xSubgroup(d.key);
    //   })
    //   .attr('y', function (d) {
    //     return y(d.value);
    //   })
    //   .attr('width', xSubgroup.bandwidth())
    //   .attr('height', function (d) {
    //     return height - y(d.value);
    //   })
    //   .attr('fill', function (d) {
    //     return color(d.key);
    //   });


    input.container
      // generate a group for each serie
      .selectAll()
      .data(data)
      .enter()
      .append('g')
      .attr('transform', (d, index) =>
        'translate(' + ((groupWidth * index) + (((index * 2) + 1) * groupLeftPadding)) + ',0)')

      // for each group generate the values
      .each((data, index, nodes) =>
        this.drawSerie(nodes[index], data, groupWidth, input));
  }

  private drawSerie(group: SVGElement, data: FlChartDataWithSerie[],
                    groupWidth: number, input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {

    const barWidth: number = groupWidth / data.length;

    select(group).selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('transform',
        (d, index) => 'translate(' + barWidth * index + ',' + input.yScale.scale(d.data.getY()) + ')'
      )
      .attr('width', barWidth - 1) // - 1 to let space between bars
      .attr('height', (d) => input.chartHeight - input.yScale.scale(d.data.getY()))
      .style('fill', (d) => this.colorScale.scale(d.serieKey));
  }

  refreshData(input: FlChart2dRendererInput<FlChart2dMultipleSerie<FlChart2dDatum>>): void {
  }
}
