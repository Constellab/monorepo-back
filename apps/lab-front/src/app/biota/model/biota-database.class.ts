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
      type: 'biota.db.go.GO'
    },
    {
      name: 'biota.sbo',
      type: 'biota.db.sbo.SBO'
    },
    {
      name: 'biota.eco',
      type: 'biota.db.eco.ECO'
    },
    {
      name: 'biota.bto',
      type: 'biota.db.bto.BTO'
    },
    {
      name: 'biota.taxonomy',
      type: 'biota.db.taxonomy.Taxonomy'
    },
    // {
    //   name: 'biota.pwo',
    //   type: 'biota.db.pwo.PWO'
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
      type: 'biota.db.compound.Compound'
    },
    {
      name: 'biota.enzyme',
      type: 'biota.db.enzyme.Enzyme'
    },
    {
      name: 'biota.enzo',
      type: 'biota.db.enzyme.Enzo'
    },
    {
      name: 'biota.reaction',
      type: 'biota.db.reaction.Reaction'
    },
    {
      name: 'biota.protein',
      type: 'biota.db.protein.Protein'
    },
  ]
};

export const biotaDatabaseGroups: BiotaDatabaseGroup[] = [biotaOntologyDbGroup, biotaMolecularDbGroup];
