/**
 * Group of biota database
 */
export interface LabBiotaDatabaseGroup {
  name: string;
  databases: LabBiotaDatabase[];
  icon: string;
}

/**
 * Information about a database information
 */
export interface LabBiotaDatabase {
  name: string;
  typingName: string;
}

const base_type: string = 'MODEL.gws_biota';

// List of Ontology databases
const biotaOntologyDbGroup: LabBiotaDatabaseGroup = {
  name: 'biota.ontology_base',
  icon: 'ontology',
  databases: [
    {
      name: 'biota.go',
      typingName: base_type + '.GO'
    },
    {
      name: 'biota.sbo',
      typingName: base_type + '.SBO'
    },
    {
      name: 'biota.eco',
      typingName: base_type + '.ECO'
    },
    {
      name: 'biota.bto',
      typingName: base_type + '.BTO'
    },
    {
      name: 'biota.taxonomy',
      typingName: base_type + '.Taxonomy'
    },
    {
      name: 'biota.pathway',
      typingName: base_type + '.Pathway'
    },
    // {
    //   name: 'biota.pwo',
    //   type: 'biota.pwo.PWO'
    // }
  ]
};

// list of molecular database
const biotaMolecularDbGroup: LabBiotaDatabaseGroup = {
  name: 'biota.molecular_base',
  icon: 'dna',
  databases: [
    {
      name: 'biota.compound',
      typingName: base_type + '.Compound'
    },
    {
      name: 'biota.enzyme',
      typingName: base_type + '.Enzyme'
    },
    {
      name: 'biota.enzyme_class',
      typingName: base_type + '.EnzymeClass '
    },
    {
      name: 'biota.enzyme_ortholog',
      typingName: base_type + '.EnzymeOrtholog'
    },
    {
      name: 'biota.reaction',
      typingName: base_type + '.Reaction'
    },
    {
      name: 'biota.protein',
      typingName: base_type + '.Protein'
    },
  ]
};

export const labBiotaDatabaseGroups: LabBiotaDatabaseGroup[] = [biotaOntologyDbGroup, biotaMolecularDbGroup];

export interface LabBiotaDatabaseSearch {
  typingName: string;
  searchText: string;
}
