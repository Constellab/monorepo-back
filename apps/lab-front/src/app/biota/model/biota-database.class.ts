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
  type: string;
}

// List of Ontology databases
const biotaOntologyDbGroup: BiotaDatabaseGroup = {
  name: 'biota.ontology_base',
  icon: 'ontology',
  databases: [
    {
      name: 'biota.go',
      type: 'biota.go.GO'
    },
    {
      name: 'biota.sbo',
      type: 'biota.sbo.SBO'
    },
    {
      name: 'biota.eco',
      type: 'biota.eco.ECO'
    },
    {
      name: 'biota.bto',
      type: 'biota.bto.BTO'
    },
    {
      name: 'biota.taxonomy',
      type: 'biota.taxonomy.Taxonomy'
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
      type: 'biota.compound.Compound'
    },
    {
      name: 'biota.enzyme',
      type: 'biota.enzyme.Enzyme'
    },
    {
      name: 'biota.enzo',
      type: 'biota.enzyme.Enzo'
    },
    {
      name: 'biota.reaction',
      type: 'biota.reaction.Reaction'
    },
    {
      name: 'biota.protein',
      type: 'biota.protein.Protein'
    },
  ]
};

export const biotaDatabaseGroups: BiotaDatabaseGroup[] = [biotaOntologyDbGroup, biotaMolecularDbGroup];
