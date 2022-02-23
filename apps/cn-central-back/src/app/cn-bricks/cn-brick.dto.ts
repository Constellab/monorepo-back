export class CnBrickVersionLabDto {
  name: string;
  version: string;
  repo_type: 'git' | 'pip';
  repo_commit: string;
}

export interface CnBrickVersionDTO{
  name: string;
  version: string;
  isHidden: boolean,
}

/**
 * List of basic gws bricks
 */
export enum CnBrickGWS {
  GWS_CORE = 'gws_core'
}
