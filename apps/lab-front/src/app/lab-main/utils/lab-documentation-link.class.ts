import {technicalBricks} from './lab-technical-brick.class';
import {LabEnvironmentHelper} from '../../lab-core/utils/lab-environment.helper';

/**
 * Object to get the documentation of a brick
 */
export interface DocumentationBrick {
  icon: string;
  label: string;
  url: string;
}


/**
 * List the documentation bricks
 */
export function getDocumentationBricks(): DocumentationBrick[] {
  const docUrlPrefix = LabEnvironmentHelper.getBaseApiUrl() + 'docs';
  const docUrlSuffix = 'index.html';
  return [
    {
      label: technicalBricks.GWS.label,
      icon: technicalBricks.GWS.icon,
      url: `${docUrlPrefix}/gws/${docUrlSuffix}`
    },
    {
      label: technicalBricks.BIOX.label,
      icon: technicalBricks.BIOX.icon,
      url: `${docUrlPrefix}/biox/${docUrlSuffix}`
    },
    {
      label: technicalBricks.BIOTA.label,
      icon: technicalBricks.BIOTA.icon,
      url: `${docUrlPrefix}/biota/${docUrlSuffix}`
    },
  ];
}
