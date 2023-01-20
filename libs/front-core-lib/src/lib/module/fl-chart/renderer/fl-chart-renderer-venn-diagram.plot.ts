import {FlChartNoAxisRenderer} from './fl-chart-renderer.class';
import {FlChartVennData, FlChartVennDataSection} from '../model/data/fl-chart-venn-data.class';
import {FlChartScaleColor} from '../model/scale/fl-chart-scale-color.class';
import {FlD3SelectionSimple} from '../model/fl-d3.class';
import {FlChartPortalHandler} from '../model/portal-handler/fl-chart-portal-handler.class';
import {
  FlChartVennDataPortalComponent
} from '../component/fl-chart-data-portal/fl-chart-venn-data-portal/fl-chart-venn-data-portal.component';

interface FlEllipsePosition {
  x: number;
  y: number;
  xRadius: number;
  yRadius: number;
  rotation: number;
  groupName: string;
}


interface FlSectionTextPosition {
  x: number;
  y: number;
  section: FlChartVennDataSection;
}

/**
 * Draw a venn diagram, support 2,3,4 groups
 */
export class FlChartRendererVennDiagram extends FlChartNoAxisRenderer<FlChartVennData> {

  private portalHandler: FlChartPortalHandler = new FlChartPortalHandler();

  constructor(private colorScale: FlChartScaleColor) {
    super();
  }

  renderFirst(): void {
    switch (this.data.data.totalNbOfGroups) {
      case 2:
        this.draw2Groups();
        break;
      case 3:
        this.draw3Groups();
        break;
      case 4:
        this.draw4Groups();
        break;
      default:
        console.error('Venn diagram of size ' + this.data.data.totalNbOfGroups + ' not supported');
    }
  }

  // draw 2 groups, 2 circle side by side
  private draw2Groups(): void {
    const circleRadius = (Math.min(this.data.chartWidth, this.data.chartHeight)) / 4;

    const firstGroup: string = this.data.data.groupNames[0];
    const secondGroup: string = this.data.data.groupNames[1];

    // Draw circles
    // center vertically
    const yCenter = this.data.chartHeight / 2;
    const xCenter = this.data.chartWidth / 2;

    const x1 = xCenter - (circleRadius / 2);
    const x2 = xCenter + (circleRadius / 2);

    const circlePosition: FlEllipsePosition[] = [
      {xRadius: circleRadius, yRadius: circleRadius, x: x1, y: yCenter, rotation: 0, groupName: firstGroup},
      {xRadius: circleRadius, yRadius: circleRadius, x: x2, y: yCenter, rotation: 0, groupName: secondGroup},
    ];
    this.drawEllipse(this.data.container, circlePosition);

    // Draw texts
    const sections: FlChartVennDataSection[] = this.data.data.sections;
    const textPosition: FlSectionTextPosition[] = [
      // left circle text
      {x: x1 - (circleRadius / 2), y: yCenter, section: this.findSection(sections, [firstGroup])},
      // right circle text
      {x: x2 + (circleRadius / 2), y: yCenter, section: this.findSection(sections, [secondGroup])},
      // join text
      {x: this.data.chartWidth / 2, y: yCenter, section: this.findSection(sections, [firstGroup, secondGroup])}
    ];
    this.drawTexts(this.data.container, textPosition);
  }

  // draw 3 groups, 3 circle in triangle shape
  private draw3Groups(): void {
    const circleRadius = (Math.min(this.data.chartWidth, this.data.chartHeight)) / 4;

    const firstGroup: string = this.data.data.groupNames[0];
    const secondGroup: string = this.data.data.groupNames[1];
    const thirdGroup: string = this.data.data.groupNames[2];

    // Draw circles
    // center vertically
    const yCenter = this.data.chartHeight / 2;
    const xCenter = this.data.chartWidth / 2;
    const x1 = xCenter - (circleRadius / 2);
    const x2 = xCenter + (circleRadius / 2);

    const lowerY = yCenter + (circleRadius / 2);
    const higherY = yCenter - (circleRadius / 2);

    const circlePosition: FlEllipsePosition[] = [
      {xRadius: circleRadius, yRadius: circleRadius, x: xCenter, y: higherY, rotation: 0, groupName: firstGroup},
      {xRadius: circleRadius, yRadius: circleRadius, x: x1, y: lowerY, rotation: 0, groupName: secondGroup},
      {xRadius: circleRadius, yRadius: circleRadius, x: x2, y: lowerY, rotation: 0, groupName: thirdGroup},
    ];
    this.drawEllipse(this.data.container, circlePosition);

    // Draw texts
    const halfRadius = circleRadius / 2;
    const sections: FlChartVennDataSection[] = this.data.data.sections;
    const textPosition: FlSectionTextPosition[] = [
      // top circle text
      {x: xCenter, y: higherY - halfRadius, section: this.findSection(sections, [firstGroup])},
      // left circle text
      {x: x1 - halfRadius, y: lowerY + halfRadius, section: this.findSection(sections, [secondGroup])},
      // right circle text
      {x: x2 + halfRadius, y: lowerY + halfRadius, section: this.findSection(sections, [thirdGroup])},
      // join 1 - 2 (top left)
      {x: x1 - halfRadius / 4, y: yCenter, section: this.findSection(sections, [firstGroup, secondGroup])},
      // join 1 - 3 (top right)
      {x: x2 + halfRadius / 4, y: yCenter, section: this.findSection(sections, [firstGroup, thirdGroup])},
      // join 2 - 3 (center bottom)
      {x: xCenter, y: lowerY + halfRadius, section: this.findSection(sections, [secondGroup, thirdGroup])},
      // join  1 - 2 - 3 (center)
      {
        x: xCenter,
        y: yCenter + halfRadius / 2,
        section: this.findSection(sections, [firstGroup, secondGroup, thirdGroup])
      }
    ];
    this.drawTexts(this.data.container, textPosition);
  }

  // draw 4 groups, 4 ellipse in rose shape
  private draw4Groups(): void {
    const xRadius = (Math.min(this.data.chartWidth, this.data.chartHeight)) / 5;
    const yRadius = (Math.min(this.data.chartWidth, this.data.chartHeight)) * 3 / 8;

    const firstGroup: string = this.data.data.groupNames[0];
    const secondGroup: string = this.data.data.groupNames[1];
    const thirdGroup: string = this.data.data.groupNames[2];
    const fourthGroup: string = this.data.data.groupNames[3];

    // Draw circles
    // center vertically
    const yCenter = this.data.chartHeight / 2;
    const xCenter = this.data.chartWidth / 2;
    const higherY = yCenter - (xRadius / 2);
    const shift = xRadius * 2 / 3;

    const ellipsePositions: FlEllipsePosition[] = [
      {
        xRadius: xRadius,
        yRadius: yRadius,
        x: xCenter - shift,
        y: higherY + shift,
        rotation: -35,
        groupName: firstGroup
      },
      {xRadius: xRadius, yRadius: yRadius, x: xCenter, y: higherY, rotation: -35, groupName: secondGroup},
      {xRadius: xRadius, yRadius: yRadius, x: xCenter, y: higherY, rotation: 35, groupName: thirdGroup},
      {
        xRadius: xRadius,
        yRadius: yRadius,
        x: xCenter + shift,
        y: higherY + shift,
        rotation: 35,
        groupName: fourthGroup
      },
    ];
    this.drawEllipse(this.data.container, ellipsePositions);

    const chartWidth: number = this.data.chartWidth;
    const chartHeight: number = this.data.chartHeight;
    // Draw texts
    const sections: FlChartVennDataSection[] = this.data.data.sections;

    // all positions are based on chart width and height
    const textPosition: FlSectionTextPosition[] = [
      // 1 (left)
      {x: chartWidth * 0.21, y: chartHeight * 0.38, section: this.findSection(sections, [firstGroup])},
      // 4 (right)
      {x: chartWidth * 0.79, y: chartHeight * 0.38, section: this.findSection(sections, [fourthGroup])},
      // 2 (middle left)
      {x: chartWidth * 0.36, y: chartHeight * 0.15, section: this.findSection(sections, [secondGroup])},
      // 3 (middle right)
      {x: chartWidth * 0.64, y: chartHeight * 0.15, section: this.findSection(sections, [thirdGroup])},
      // join 1 - 2 (left top)
      {x: chartWidth * 0.32, y: chartHeight * 0.28, section: this.findSection(sections, [firstGroup, secondGroup])},
      // join 3 - 4 (right top)
      {x: chartWidth * 0.68, y: chartHeight * 0.28, section: this.findSection(sections, [thirdGroup, fourthGroup])},
      // join 2 - 3 (center top)
      {x: xCenter, y: chartHeight * 0.2, section: this.findSection(sections, [secondGroup, thirdGroup])},
      // join 1 - 3 (left-left bottom)
      {x: chartWidth * 0.325, y: chartHeight * 0.59, section: this.findSection(sections, [firstGroup, thirdGroup])},
      // join 2 - 3 (right-right bottom)
      {x: chartWidth * 0.675, y: chartHeight * 0.59, section: this.findSection(sections, [secondGroup, fourthGroup])},
      // join 1 - 4 (center bottom)
      {x: xCenter, y: chartHeight * 0.76, section: this.findSection(sections, [firstGroup, fourthGroup])},
      // join 1 - 2 - 3 (center-left center)
      {
        x: chartWidth * 0.4,
        y: chartHeight * 0.38,
        section: this.findSection(sections, [firstGroup, secondGroup, thirdGroup])
      },
      // join 2 - 3 - 4 (center-right center)
      {
        x: chartWidth * 0.6,
        y: chartHeight * 0.38,
        section: this.findSection(sections, [secondGroup, thirdGroup, fourthGroup])
      },
      // join 1 - 3 - 4 (center-left bottom)
      {
        x: chartWidth * 0.425,
        y: chartHeight * 0.66,
        section: this.findSection(sections, [firstGroup, thirdGroup, fourthGroup])
      },
      // join 1 - 2 - 4 (center-right bottom)
      {
        x: chartWidth * 0.575,
        y: chartHeight * 0.66,
        section: this.findSection(sections, [firstGroup, secondGroup, fourthGroup])
      },
      // join  1 - 2 - 3 - 4 (center center)
      {
        x: xCenter,
        y: yCenter,
        section: this.findSection(sections, [firstGroup, secondGroup, thirdGroup, fourthGroup])
      }
    ];
    this.drawTexts(this.data.container, textPosition, 15);
  }

  // return the correct section based on a group list
  private findSection(sections: FlChartVennDataSection[], groupNames: string[]): FlChartVennDataSection {
    return sections.find(section => {
      if (section.groupNames.length !== groupNames.length) return false;

      // all the requested group name must be in section group names
      for (const groupName of groupNames) {
        if (!section.groupNames.includes(groupName)) {
          return false;
        }
      }
      return true;
    });
  }


  private drawEllipse(container: FlD3SelectionSimple, ellipse: FlEllipsePosition[]): void {
    container
      .selectAll('ellipse')
      .data(ellipse)
      .join('ellipse')
      .attr('rx', d => d.xRadius)
      .attr('ry', d => d.yRadius)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('transform', d => `rotate(${d.rotation})`)
      .attr('transform-origin', d => `${d.x}px ${d.y}px`)
      .attr('fill-opacity', 0.6)
      .attr('fill', d => this.colorScale.scale(d.groupName));
  }

  private drawTexts(container: FlD3SelectionSimple, sections: FlSectionTextPosition[], fontSize: number = 18): void {
    container
      .selectAll('text')
      .data(sections)
      .join('text')
      .text(section => section.section.data?.length ?? 0)
      .attr('x', section => section.x)
      // set y with some modification to vertically center it
      .attr('y', section => section.y + (fontSize / 2) - 2)
      // .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      // .attr('fill', textColor)
      // .style('text-shadow', this.getTextShadow(backgroundColor))
      .style('font-size', `${fontSize}px`)
      .on('mouseover', (event, d) => this.openPortal(event, d.section, false))
      .on('mouseout', () => this.closePortal())
      .on('click', (event, d) => this.openPortal(event, d.section, true));
  }

  private openPortal(event: MouseEvent, d: FlChartVennDataSection, fixPortal: boolean): void {
    // create the portal
    this.portalHandler.openPortal(event.target as any, FlChartVennDataPortalComponent, d, fixPortal);
  }

  private closePortal(): void {
    this.portalHandler.closePortal();
  }

}
