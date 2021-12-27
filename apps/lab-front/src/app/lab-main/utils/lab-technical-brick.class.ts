// list of available brick
export type BrickTechnicalName = 'GWS' | 'BIOX' | 'BIOTA';

/**
 * information about the technical brick that composed the app
 */

export interface TechnicalBrick {
  technicalName: BrickTechnicalName;
  label: string;
  icon: string;
}

/**
 * Detail of the technical bricks
 */
export const technicalBricks: Record<BrickTechnicalName, TechnicalBrick> = {
  GWS: {
    label: 'gws',
    icon: 'http',
    technicalName: 'GWS'
  },
  BIOX: {
    label: 'biox.biox',
    icon: 'experiment',
    technicalName: 'BIOX'
  },
  BIOTA: {
    label: 'biota.biota',
    icon: 'database',
    technicalName: 'BIOTA'
  },
};
