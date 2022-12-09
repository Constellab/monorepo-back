import {FlCoord} from '../../../model/shared/fl-coord.class';

/**
 * Complete Structured data of a pathway
 */
export interface FlBioNetwork {
  name?: string;
  metabolites: FlBioNetworkMetabolite[];
  reactions: FlBioNetworkReaction[];
  compartments: FlBioNetworkCompartment[];
}

// Level of the metabolite 3 = cofactor
// The lower the level, the more important the metabolite is
export enum FlBioNetworkMetaboliteLevel {
  MAJOR = 1,
  MINOR = 2,
  COFACTOR = 3
}

export interface FlBioNetworkObject {
  id: string;
  name: string;
  level: FlBioNetworkMetaboliteLevel;
}

export type FlBioNetworkMetaboliteType =  'default' | 'cofactor' | 'residue';

export interface FlBioNetworkMetabolite extends FlBioNetworkObject {
  compartment: string;
  charge?: any;
  mass?: any;
  formula?: string;
  chebi_id?: string;
  layout?: FlBioNetworkLayout;

  type: FlBioNetworkMetaboliteType;
}

export function flBioNetworkIsCofactor(type: FlBioNetworkMetaboliteType): boolean {
  return type === 'cofactor' || type === 'residue';
}


export interface FlBioNetworkReaction extends FlBioNetworkObject {
  metabolites: Record<string, number>;
  lower_bound?: number;
  upper_bound?: number;
  enzyme?: FlBioNetworkEnzyme;
  data: FlBioNetworkReactionData;
  layout?: FlCoord;
  rhea_id?: string;
}

export interface FlBioNetworkLayout {
  // x: number;
  // y: number;
  clusters: Record<string, FlBioNetworkCluster>;
}

export interface FlBioNetworkCluster extends FlCoord {
  x: number;
  y: number;
  level: FlBioNetworkMetaboliteLevel;
  name: string;
  id: string;
}

export interface FlBioNetworkCompartment {
  id: string;
  go_id: string;
  bigg_d: string;
  name: string;
  color: string;
}

// TODO rename and review format with cluster
export interface FlBioNetworkClusterInfo {
  clusterId: string;
  subClusterIds: string[];
}

// Information about the enzyme in the reaction
export interface FlBioNetworkEnzyme {
  title: string;
  ec_number: string;
  pathways: FlBioNetworkPathways;
}

// list of database ref for a pathway
export type FlPathwayDatabase = keyof FlBioNetworkPathways;

export const flPathwayDatabases: FlPathwayDatabase[] = ['kegg', 'brenda', 'metacyc'];

// info of which pathway the reaction is
// It define the pathway name based for known DB (EU, US, Japan)
export interface FlBioNetworkPathways {
  brenda?: FlBioNetworkPathwayDetail;
  kegg?: FlBioNetworkPathwayDetail;
  metacyc?: FlBioNetworkPathwayDetail;
}

export const flBioNetworkPathwayIdSeparator: string = '; ';

export interface FlBioNetworkPathwayDetail {
  // list of ids of the pathways separated by the separator
  id: string;
  // list of names of the pathways separated by the separator
  name: string;
}

// TODO to improve when the cluster will be fully activated
export interface FlBioNetworkClusterSelection {
  id: string;
  name: string;
  selected: boolean;
  highlighted: boolean;
  color: string;
}

export interface FlBioNetworkClusterGroupSelection {
  name: string;
  children: FlBioNetworkClusterSelection2[];
}

export interface FlBioNetworkClusterSelection2 {
  name: string;
}

export interface FlBioNetworkReactionData {
  simulations?: Record<string, FlBioNetworkReactionDataFlux>;
}

export interface FlBioNetworkReactionDataFlux {
  value: number;
  lower_bound: number;
  upper_bound: number;
  // labels?: [];
}

export const flDefaultPathwayReactionValue: FlBioNetworkReactionData = {
  simulations: {'default': {value: 1, lower_bound: 1, upper_bound: 1}}
};

export const flDefaultPathway: FlBioNetworkPathwayDetail = {
  id: 'Default',
  name: 'Default'
};

