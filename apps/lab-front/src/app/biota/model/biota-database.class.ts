/**
 * Group of biota database
 */
export interface BiotaDatabaseGroup {
  name: string;
  databases: BiotaDatabase[];
  icon: string;
}

/**
 * Information about a database information
 */
export interface BiotaDatabase {
  name: string;
  typingName: string;
}

const base_type: string = 'MODEL.gws_biota';

// List of Ontology databases
const biotaOntologyDbGroup: BiotaDatabaseGroup = {
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
const biotaMolecularDbGroup: BiotaDatabaseGroup = {
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
      name: 'biota.enzo',
      typingName: base_type + '.Enzo'
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

export const biotaDatabaseGroups: BiotaDatabaseGroup[] = [biotaOntologyDbGroup, biotaMolecularDbGroup];
