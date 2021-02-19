import {technicalBricks} from './technical-brick.class';
import {environment} from '../../../environments/environment';

/**
 * Object to get the documentation of a brick
 */
export interface DocumentationBrick {
  icon: string;
  label: string;
  url: string;
}

const docUrlPrefix = environment.apiUrl + 'docs';
const docUrlSuffix = 'index.html';

/**
 * List the documentation bricks
 */
export const documentationBricks: DocumentationBrick[] = [
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
