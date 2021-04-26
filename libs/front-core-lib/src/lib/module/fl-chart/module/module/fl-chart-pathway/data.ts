import {FlPathway} from './model/fl-pathway.class';

export const pathwayData = {
  nodes: [
    {id: 'Myriel', group: 1}, {id: 'Napoleon', group: 1}, {id: 'Mlle.Baptistine', group: 1}, {
      id: 'Mme.Magloire',
      group: 1
    }, {id: 'CountessdeLo', group: 1}, {id: 'Geborand', group: 1}, {id: 'Champtercier', group: 1}, {
      id: 'Cravatte',
      group: 1
    }, {id: 'Count', group: 1}, {id: 'OldMan', group: 1}, {id: 'Labarre', group: 2}, {
      id: 'Valjean',
      group: 2
    }, {id: 'Marguerite', group: 3}, {id: 'Mme.deR', group: 2}, {id: 'Isabeau', group: 2}, {
      id: 'Gervais',
      group: 2
    }, {id: 'Tholomyes', group: 3}, {id: 'Listolier', group: 3}, {id: 'Fameuil', group: 3}, {
      id: 'Blacheville',
      group: 3
    }, {id: 'Favourite', group: 3}, {id: 'Dahlia', group: 3}, {id: 'Zephine', group: 3}, {
      id: 'Fantine',
      group: 3
    }, {id: 'Mme.Thenardier', group: 4}, {id: 'Thenardier', group: 4}, {id: 'Cosette', group: 5}, {
      id: 'Javert',
      group: 4
    }, {id: 'Fauchelevent', group: 0}, {id: 'Bamatabois', group: 2}, {id: 'Perpetue', group: 3}, {
      id: 'Simplice',
      group: 2
    }, {id: 'Scaufflaire', group: 2}, {id: 'Woman1', group: 2}, {id: 'Judge', group: 2}, {
      id: 'Champmathieu',
      group: 2
    }, {id: 'Brevet', group: 2}, {id: 'Chenildieu', group: 2}, {id: 'Cochepaille', group: 2}, {
      id: 'Pontmercy',
      group: 4
    }, {id: 'Boulatruelle', group: 6}, {id: 'Eponine', group: 4}, {id: 'Anzelma', group: 4}, {
      id: 'Woman2',
      group: 5
    }, {id: 'MotherInnocent', group: 0}, {id: 'Gribier', group: 0}, {id: 'Jondrette', group: 7}, {
      id: 'Mme.Burgon',
      group: 7
    }, {id: 'Gavroche', group: 8}, {id: 'Gillenormand', group: 5}, {id: 'Magnon', group: 5}, {
      id: 'Mlle.Gillenormand',
      group: 5
    }, {id: 'Mme.Pontmercy', group: 5}, {id: 'Mlle.Vaubois', group: 5}, {id: 'Lt.Gillenormand', group: 5}, {
      id: 'Marius',
      group: 8
    }, {id: 'BaronessT', group: 5}, {id: 'Mabeuf', group: 8}, {id: 'Enjolras', group: 8}, {
      id: 'Combeferre',
      group: 8
    }, {id: 'Prouvaire', group: 8}, {id: 'Feuilly', group: 8}, {id: 'Courfeyrac', group: 8}, {
      id: 'Bahorel',
      group: 8
    }, {id: 'Bossuet', group: 8}, {id: 'Joly', group: 8}, {id: 'Grantaire', group: 8}, {
      id: 'MotherPlutarch',
      group: 9
    }, {id: 'Gueulemer', group: 4}, {id: 'Babet', group: 4}, {id: 'Claquesous', group: 4}, {
      id: 'Montparnasse',
      group: 4
    }, {id: 'Toussaint', group: 5}, {id: 'Child1', group: 10}, {id: 'Child2', group: 10}, {
      id: 'Brujon',
      group: 4
    }, {id: 'Mme.Hucheloup', group: 8}],
  links: [
    {source: 'Napoleon', target: 'Myriel', value: 1}, {
      source: 'Mlle.Baptistine',
      target: 'Myriel',
      value: 8
    }, {source: 'Mme.Magloire', target: 'Myriel', value: 10}, {
      source: 'Mme.Magloire',
      target: 'Mlle.Baptistine',
      value: 6
    }, {source: 'CountessdeLo', target: 'Myriel', value: 1}, {
      source: 'Geborand',
      target: 'Myriel',
      value: 1
    }, {source: 'Champtercier', target: 'Myriel', value: 1}, {source: 'Cravatte', target: 'Myriel', value: 1}, {
      source: 'Count',
      target: 'Myriel',
      value: 2
    }, {source: 'OldMan', target: 'Myriel', value: 1}, {source: 'Valjean', target: 'Labarre', value: 1}, {
      source: 'Valjean',
      target: 'Mme.Magloire',
      value: 3
    }, {source: 'Valjean', target: 'Mlle.Baptistine', value: 3}, {
      source: 'Valjean',
      target: 'Myriel',
      value: 5
    }, {source: 'Marguerite', target: 'Valjean', value: 1}, {
      source: 'Mme.deR',
      target: 'Valjean',
      value: 1
    }, {source: 'Isabeau', target: 'Valjean', value: 1}, {source: 'Gervais', target: 'Valjean', value: 1}, {
      source: 'Listolier',
      target: 'Tholomyes',
      value: 4
    }, {source: 'Fameuil', target: 'Tholomyes', value: 4}, {
      source: 'Fameuil',
      target: 'Listolier',
      value: 4
    }, {source: 'Blacheville', target: 'Tholomyes', value: 4}, {
      source: 'Blacheville',
      target: 'Listolier',
      value: 4
    }, {source: 'Blacheville', target: 'Fameuil', value: 4}, {
      source: 'Favourite',
      target: 'Tholomyes',
      value: 3
    }, {source: 'Favourite', target: 'Listolier', value: 3}, {
      source: 'Favourite',
      target: 'Fameuil',
      value: 3
    }, {source: 'Favourite', target: 'Blacheville', value: 4}, {
      source: 'Dahlia',
      target: 'Tholomyes',
      value: 3
    }, {source: 'Dahlia', target: 'Listolier', value: 3}, {source: 'Dahlia', target: 'Fameuil', value: 3}, {
      source: 'Dahlia',
      target: 'Blacheville',
      value: 3
    }, {source: 'Dahlia', target: 'Favourite', value: 5}, {
      source: 'Zephine',
      target: 'Tholomyes',
      value: 3
    }, {source: 'Zephine', target: 'Listolier', value: 3}, {source: 'Zephine', target: 'Fameuil', value: 3}, {
      source: 'Zephine',
      target: 'Blacheville',
      value: 3
    }, {source: 'Zephine', target: 'Favourite', value: 4}, {source: 'Zephine', target: 'Dahlia', value: 4}, {
      source: 'Fantine',
      target: 'Tholomyes',
      value: 3
    }, {source: 'Fantine', target: 'Listolier', value: 3}, {source: 'Fantine', target: 'Fameuil', value: 3}, {
      source: 'Fantine',
      target: 'Blacheville',
      value: 3
    }, {source: 'Fantine', target: 'Favourite', value: 4}, {source: 'Fantine', target: 'Dahlia', value: 4}, {
      source: 'Fantine',
      target: 'Zephine',
      value: 4
    }, {source: 'Fantine', target: 'Marguerite', value: 2}, {
      source: 'Fantine',
      target: 'Valjean',
      value: 9
    }, {source: 'Mme.Thenardier', target: 'Fantine', value: 2}, {
      source: 'Mme.Thenardier',
      target: 'Valjean',
      value: 7
    }, {source: 'Thenardier', target: 'Mme.Thenardier', value: 13}, {
      source: 'Thenardier',
      target: 'Fantine',
      value: 1
    }, {source: 'Thenardier', target: 'Valjean', value: 12}, {
      source: 'Cosette',
      target: 'Mme.Thenardier',
      value: 4
    }, {source: 'Cosette', target: 'Valjean', value: 31}, {
      source: 'Cosette',
      target: 'Tholomyes',
      value: 1
    }, {source: 'Cosette', target: 'Thenardier', value: 1}, {source: 'Javert', target: 'Valjean', value: 17}, {
      source: 'Javert',
      target: 'Fantine',
      value: 5
    }, {source: 'Javert', target: 'Thenardier', value: 5}, {
      source: 'Javert',
      target: 'Mme.Thenardier',
      value: 1
    }, {source: 'Javert', target: 'Cosette', value: 1}, {
      source: 'Fauchelevent',
      target: 'Valjean',
      value: 8
    }, {source: 'Fauchelevent', target: 'Javert', value: 1}, {
      source: 'Bamatabois',
      target: 'Fantine',
      value: 1
    }, {source: 'Bamatabois', target: 'Javert', value: 1}, {
      source: 'Bamatabois',
      target: 'Valjean',
      value: 2
    }, {source: 'Perpetue', target: 'Fantine', value: 1}, {
      source: 'Simplice',
      target: 'Perpetue',
      value: 2
    }, {source: 'Simplice', target: 'Valjean', value: 3}, {
      source: 'Simplice',
      target: 'Fantine',
      value: 2
    }, {source: 'Simplice', target: 'Javert', value: 1}, {
      source: 'Scaufflaire',
      target: 'Valjean',
      value: 1
    }, {source: 'Woman1', target: 'Valjean', value: 2}, {source: 'Woman1', target: 'Javert', value: 1}, {
      source: 'Judge',
      target: 'Valjean',
      value: 3
    }, {source: 'Judge', target: 'Bamatabois', value: 2}, {
      source: 'Champmathieu',
      target: 'Valjean',
      value: 3
    }, {source: 'Champmathieu', target: 'Judge', value: 3}, {
      source: 'Champmathieu',
      target: 'Bamatabois',
      value: 2
    }, {source: 'Brevet', target: 'Judge', value: 2}, {source: 'Brevet', target: 'Champmathieu', value: 2}, {
      source: 'Brevet',
      target: 'Valjean',
      value: 2
    }, {source: 'Brevet', target: 'Bamatabois', value: 1}, {
      source: 'Chenildieu',
      target: 'Judge',
      value: 2
    }, {source: 'Chenildieu', target: 'Champmathieu', value: 2}, {
      source: 'Chenildieu',
      target: 'Brevet',
      value: 2
    }, {source: 'Chenildieu', target: 'Valjean', value: 2}, {
      source: 'Chenildieu',
      target: 'Bamatabois',
      value: 1
    }, {source: 'Cochepaille', target: 'Judge', value: 2}, {
      source: 'Cochepaille',
      target: 'Champmathieu',
      value: 2
    }, {source: 'Cochepaille', target: 'Brevet', value: 2}, {
      source: 'Cochepaille',
      target: 'Chenildieu',
      value: 2
    }, {source: 'Cochepaille', target: 'Valjean', value: 2}, {
      source: 'Cochepaille',
      target: 'Bamatabois',
      value: 1
    }, {source: 'Pontmercy', target: 'Thenardier', value: 1}, {
      source: 'Boulatruelle',
      target: 'Thenardier',
      value: 1
    }, {source: 'Eponine', target: 'Mme.Thenardier', value: 2}, {
      source: 'Eponine',
      target: 'Thenardier',
      value: 3
    }, {source: 'Anzelma', target: 'Eponine', value: 2}, {
      source: 'Anzelma',
      target: 'Thenardier',
      value: 2
    }, {source: 'Anzelma', target: 'Mme.Thenardier', value: 1}, {
      source: 'Woman2',
      target: 'Valjean',
      value: 3
    }, {source: 'Woman2', target: 'Cosette', value: 1}, {
      source: 'Woman2',
      target: 'Javert',
      value: 1
    }, {source: 'MotherInnocent', target: 'Fauchelevent', value: 3}, {
      source: 'MotherInnocent',
      target: 'Valjean',
      value: 1
    }, {source: 'Gribier', target: 'Fauchelevent', value: 2}, {
      source: 'Mme.Burgon',
      target: 'Jondrette',
      value: 1
    }, {source: 'Gavroche', target: 'Mme.Burgon', value: 2}, {
      source: 'Gavroche',
      target: 'Thenardier',
      value: 1
    }, {source: 'Gavroche', target: 'Javert', value: 1}, {
      source: 'Gavroche',
      target: 'Valjean',
      value: 1
    }, {source: 'Gillenormand', target: 'Cosette', value: 3}, {
      source: 'Gillenormand',
      target: 'Valjean',
      value: 2
    }, {source: 'Magnon', target: 'Gillenormand', value: 1}, {
      source: 'Magnon',
      target: 'Mme.Thenardier',
      value: 1
    }, {source: 'Mlle.Gillenormand', target: 'Gillenormand', value: 9}, {
      source: 'Mlle.Gillenormand',
      target: 'Cosette',
      value: 2
    }, {source: 'Mlle.Gillenormand', target: 'Valjean', value: 2}, {
      source: 'Mme.Pontmercy',
      target: 'Mlle.Gillenormand',
      value: 1
    }, {source: 'Mme.Pontmercy', target: 'Pontmercy', value: 1}, {
      source: 'Mlle.Vaubois',
      target: 'Mlle.Gillenormand',
      value: 1
    }, {source: 'Lt.Gillenormand', target: 'Mlle.Gillenormand', value: 2}, {
      source: 'Lt.Gillenormand',
      target: 'Gillenormand',
      value: 1
    }, {source: 'Lt.Gillenormand', target: 'Cosette', value: 1}, {
      source: 'Marius',
      target: 'Mlle.Gillenormand',
      value: 6
    }, {source: 'Marius', target: 'Gillenormand', value: 12}, {
      source: 'Marius',
      target: 'Pontmercy',
      value: 1
    }, {source: 'Marius', target: 'Lt.Gillenormand', value: 1}, {
      source: 'Marius',
      target: 'Cosette',
      value: 21
    }, {source: 'Marius', target: 'Valjean', value: 19}, {source: 'Marius', target: 'Tholomyes', value: 1}, {
      source: 'Marius',
      target: 'Thenardier',
      value: 2
    }, {source: 'Marius', target: 'Eponine', value: 5}, {source: 'Marius', target: 'Gavroche', value: 4}, {
      source: 'BaronessT',
      target: 'Gillenormand',
      value: 1
    }, {source: 'BaronessT', target: 'Marius', value: 1}, {source: 'Mabeuf', target: 'Marius', value: 1}, {
      source: 'Mabeuf',
      target: 'Eponine',
      value: 1
    }, {source: 'Mabeuf', target: 'Gavroche', value: 1}, {source: 'Enjolras', target: 'Marius', value: 7}, {
      source: 'Enjolras',
      target: 'Gavroche',
      value: 7
    }, {source: 'Enjolras', target: 'Javert', value: 6}, {source: 'Enjolras', target: 'Mabeuf', value: 1}, {
      source: 'Enjolras',
      target: 'Valjean',
      value: 4
    }, {source: 'Combeferre', target: 'Enjolras', value: 15}, {
      source: 'Combeferre',
      target: 'Marius',
      value: 5
    }, {source: 'Combeferre', target: 'Gavroche', value: 6}, {
      source: 'Combeferre',
      target: 'Mabeuf',
      value: 2
    }, {source: 'Prouvaire', target: 'Gavroche', value: 1}, {
      source: 'Prouvaire',
      target: 'Enjolras',
      value: 4
    }, {source: 'Prouvaire', target: 'Combeferre', value: 2}, {
      source: 'Feuilly',
      target: 'Gavroche',
      value: 2
    }, {source: 'Feuilly', target: 'Enjolras', value: 6}, {
      source: 'Feuilly',
      target: 'Prouvaire',
      value: 2
    }, {source: 'Feuilly', target: 'Combeferre', value: 5}, {source: 'Feuilly', target: 'Mabeuf', value: 1}, {
      source: 'Feuilly',
      target: 'Marius',
      value: 1
    }, {source: 'Courfeyrac', target: 'Marius', value: 9}, {
      source: 'Courfeyrac',
      target: 'Enjolras',
      value: 17
    }, {source: 'Courfeyrac', target: 'Combeferre', value: 13}, {
      source: 'Courfeyrac',
      target: 'Gavroche',
      value: 7
    }, {source: 'Courfeyrac', target: 'Mabeuf', value: 2}, {
      source: 'Courfeyrac',
      target: 'Eponine',
      value: 1
    }, {source: 'Courfeyrac', target: 'Feuilly', value: 6}, {
      source: 'Courfeyrac',
      target: 'Prouvaire',
      value: 3
    }, {source: 'Bahorel', target: 'Combeferre', value: 5}, {
      source: 'Bahorel',
      target: 'Gavroche',
      value: 5
    }, {source: 'Bahorel', target: 'Courfeyrac', value: 6}, {source: 'Bahorel', target: 'Mabeuf', value: 2}, {
      source: 'Bahorel',
      target: 'Enjolras',
      value: 4
    }, {source: 'Bahorel', target: 'Feuilly', value: 3}, {source: 'Bahorel', target: 'Prouvaire', value: 2}, {
      source: 'Bahorel',
      target: 'Marius',
      value: 1
    }, {source: 'Bossuet', target: 'Marius', value: 5}, {
      source: 'Bossuet',
      target: 'Courfeyrac',
      value: 12
    }, {source: 'Bossuet', target: 'Gavroche', value: 5}, {source: 'Bossuet', target: 'Bahorel', value: 4}, {
      source: 'Bossuet',
      target: 'Enjolras',
      value: 10
    }, {source: 'Bossuet', target: 'Feuilly', value: 6}, {source: 'Bossuet', target: 'Prouvaire', value: 2}, {
      source: 'Bossuet',
      target: 'Combeferre',
      value: 9
    }, {source: 'Bossuet', target: 'Mabeuf', value: 1}, {source: 'Bossuet', target: 'Valjean', value: 1}, {
      source: 'Joly',
      target: 'Bahorel',
      value: 5
    }, {source: 'Joly', target: 'Bossuet', value: 7}, {source: 'Joly', target: 'Gavroche', value: 3}, {
      source: 'Joly',
      target: 'Courfeyrac',
      value: 5
    }, {source: 'Joly', target: 'Enjolras', value: 5}, {source: 'Joly', target: 'Feuilly', value: 5}, {
      source: 'Joly',
      target: 'Prouvaire',
      value: 2
    }, {source: 'Joly', target: 'Combeferre', value: 5}, {source: 'Joly', target: 'Mabeuf', value: 1}, {
      source: 'Joly',
      target: 'Marius',
      value: 2
    }, {source: 'Grantaire', target: 'Bossuet', value: 3}, {
      source: 'Grantaire',
      target: 'Enjolras',
      value: 3
    }, {source: 'Grantaire', target: 'Combeferre', value: 1}, {
      source: 'Grantaire',
      target: 'Courfeyrac',
      value: 2
    }, {source: 'Grantaire', target: 'Joly', value: 2}, {
      source: 'Grantaire',
      target: 'Gavroche',
      value: 1
    }, {source: 'Grantaire', target: 'Bahorel', value: 1}, {
      source: 'Grantaire',
      target: 'Feuilly',
      value: 1
    }, {source: 'Grantaire', target: 'Prouvaire', value: 1}, {
      source: 'MotherPlutarch',
      target: 'Mabeuf',
      value: 3
    }, {source: 'Gueulemer', target: 'Thenardier', value: 5}, {
      source: 'Gueulemer',
      target: 'Valjean',
      value: 1
    }, {source: 'Gueulemer', target: 'Mme.Thenardier', value: 1}, {
      source: 'Gueulemer',
      target: 'Javert',
      value: 1
    }, {source: 'Gueulemer', target: 'Gavroche', value: 1}, {
      source: 'Gueulemer',
      target: 'Eponine',
      value: 1
    }, {source: 'Babet', target: 'Thenardier', value: 6}, {source: 'Babet', target: 'Gueulemer', value: 6}, {
      source: 'Babet',
      target: 'Valjean',
      value: 1
    }, {source: 'Babet', target: 'Mme.Thenardier', value: 1}, {source: 'Babet', target: 'Javert', value: 2}, {
      source: 'Babet',
      target: 'Gavroche',
      value: 1
    }, {source: 'Babet', target: 'Eponine', value: 1}, {
      source: 'Claquesous',
      target: 'Thenardier',
      value: 4
    }, {source: 'Claquesous', target: 'Babet', value: 4}, {
      source: 'Claquesous',
      target: 'Gueulemer',
      value: 4
    }, {source: 'Claquesous', target: 'Valjean', value: 1}, {
      source: 'Claquesous',
      target: 'Mme.Thenardier',
      value: 1
    }, {source: 'Claquesous', target: 'Javert', value: 1}, {
      source: 'Claquesous',
      target: 'Eponine',
      value: 1
    }, {source: 'Claquesous', target: 'Enjolras', value: 1}, {
      source: 'Montparnasse',
      target: 'Javert',
      value: 1
    }, {source: 'Montparnasse', target: 'Babet', value: 2}, {
      source: 'Montparnasse',
      target: 'Gueulemer',
      value: 2
    }, {source: 'Montparnasse', target: 'Claquesous', value: 2}, {
      source: 'Montparnasse',
      target: 'Valjean',
      value: 1
    }, {source: 'Montparnasse', target: 'Gavroche', value: 1}, {
      source: 'Montparnasse',
      target: 'Eponine',
      value: 1
    }, {source: 'Montparnasse', target: 'Thenardier', value: 1}, {
      source: 'Toussaint',
      target: 'Cosette',
      value: 2
    }, {source: 'Toussaint', target: 'Javert', value: 1}, {source: 'Toussaint', target: 'Valjean', value: 1}, {
      source: 'Child1',
      target: 'Gavroche',
      value: 2
    }, {source: 'Child2', target: 'Gavroche', value: 2}, {source: 'Child2', target: 'Child1', value: 3}, {
      source: 'Brujon',
      target: 'Babet',
      value: 3
    }, {source: 'Brujon', target: 'Gueulemer', value: 3}, {source: 'Brujon', target: 'Thenardier', value: 3}, {
      source: 'Brujon',
      target: 'Gavroche',
      value: 1
    }, {source: 'Brujon', target: 'Eponine', value: 1}, {source: 'Brujon', target: 'Claquesous', value: 1}, {
      source: 'Brujon',
      target: 'Montparnasse',
      value: 1
    }, {source: 'Mme.Hucheloup', target: 'Bossuet', value: 1}, {
      source: 'Mme.Hucheloup',
      target: 'Joly',
      value: 1
    }, {source: 'Mme.Hucheloup', target: 'Grantaire', value: 1}, {
      source: 'Mme.Hucheloup',
      target: 'Bahorel',
      value: 1
    }, {source: 'Mme.Hucheloup', target: 'Courfeyrac', value: 1}, {
      source: 'Mme.Hucheloup',
      target: 'Gavroche',
      value: 1
    }, {source: 'Mme.Hucheloup', target: 'Enjolras', value: 1}]
};


export const realPathwayData: FlPathway = {
  metabolites: [
    {
      id: 'glc_D_e',
      name: 'D-Glucose',
      compartment: 'e'
    },
    {
      id: 'gln_L_c',
      name: 'L-Glutamine',
      compartment: 'c'
    },
    {
      id: 'gln_L_e',
      name: 'L-Glutamine',
      compartment: 'e'
    },
    {
      id: 'atp_c',
      name: 'ATP C10H12N5O13P3',
      compartment: 'c'
    },
    {
      id: 'adp_c',
      name: 'ADP C10H12N5O10P2',
      compartment: 'c'
    }
  ],
  reactions: [
    {
      id: 'EX_glc_D_e',
      name: 'D-Glucose exchange',
      metabolites: {
        glc_D_e: -1.0
      },
      lower_bound: -10.0,
      upper_bound: 1000.0
    },
    {
      id: 'GLNabc',
      name: 'L-glutamine transport via ABC system',
      metabolites: {
        adp_c: 1.0,
        atp_c: -1.0,
        gln_L_c: 1.0,
        gln_L_e: -1.0
      },
      lower_bound: 0.0,
      upper_bound: 1000.0
    }
  ],
  compartments: {
    c: 'cytosol',
    e: 'extracellular',
    n: 'nucleus'
  }
};

export const bigPathwayData: FlPathway = {
  metabolites: [
    {
      id: 'water_c',
      name: 'water',
      charge: 0.0,
      mass: 18.0153,
      formula: 'H2O',
      compartment: 'c',
      chebi_id: 'CHEBI:15377'
    },
    {
      id: 'L_glutamate_1_c',
      name: 'L-glutamate(1-)',
      charge: -1.0,
      mass: 146.12136,
      formula: 'C5H8NO4',
      compartment: 'c',
      chebi_id: 'CHEBI:29985'
    },
    {
      id: 'NAD_1_c',
      name: 'NAD(1-)',
      charge: -1.0,
      mass: 662.4172,
      formula: 'C21H26N7O14P2',
      compartment: 'c',
      chebi_id: 'CHEBI:57540'
    },
    {
      id: '2_oxoglutarate_2_c',
      name: '2-oxoglutarate(2-)',
      charge: -2.0,
      mass: 144.08226,
      formula: 'C5H4O5',
      compartment: 'c',
      chebi_id: 'CHEBI:16810'
    },
    {
      id: 'hydron_c',
      name: 'hydron',
      charge: 1.0,
      mass: 1.00794,
      formula: 'H',
      compartment: 'c',
      chebi_id: 'CHEBI:15378'
    },
    {
      id: 'NADH_2_c',
      name: 'NADH(2-)',
      charge: -2.0,
      mass: 663.4251,
      formula: 'C21H27N7O14P2',
      compartment: 'c',
      chebi_id: 'CHEBI:57945'
    },
    {
      id: 'ammonium_c',
      name: 'ammonium',
      charge: 1.0,
      mass: 18.0385,
      formula: 'H4N',
      compartment: 'c',
      chebi_id: 'CHEBI:28938'
    },
    {
      id: 'ATP_4_c',
      name: 'ATP(4-)',
      charge: -4.0,
      mass: 503.14946,
      formula: 'C10H12N5O13P3',
      compartment: 'c',
      chebi_id: 'CHEBI:30616'
    },
    {
      id: 'ADP_3_c',
      name: 'ADP(3-)',
      charge: -3.0,
      mass: 424.1773,
      formula: 'C10H12N5O10P2',
      compartment: 'c',
      chebi_id: 'CHEBI:456216'
    },
    {
      id: 'L_glutamine_zwitterion_c',
      name: 'L-glutamine zwitterion',
      charge: 0.0,
      mass: 146.1445,
      formula: 'C5H10N2O3',
      compartment: 'c',
      chebi_id: 'CHEBI:58359'
    },
    {
      id: 'hydrogenphosphate_c',
      name: 'hydrogenphosphate',
      charge: -2.0,
      mass: 95.9793,
      formula: 'HO4P',
      compartment: 'c',
      chebi_id: 'CHEBI:43474'
    },
    {
      id: '7_phospho_2_dehydro_3_deoxy_D_arabino_heptonate_c',
      name: '7-phospho-2-dehydro-3-deoxy-D-arabino-heptonate',
      charge: -3.0,
      mass: 285.1221,
      formula: 'C7H10O10P',
      compartment: 'c',
      chebi_id: 'CHEBI:58394'
    },
    {
      id: '3_dehydroquinate_c',
      name: '3-dehydroquinate',
      charge: -1.0,
      mass: 189.14276,
      formula: 'C7H9O6',
      compartment: 'c',
      chebi_id: 'CHEBI:32364'
    },
    {
      id: '3_dehydroshikimate_c',
      name: '3-dehydroshikimate',
      charge: -1.0,
      mass: 171.12748,
      formula: 'C7H7O5',
      compartment: 'c',
      chebi_id: 'CHEBI:16630'
    },
    {
      id: 'NADP_3_c',
      name: 'NADP(3-)',
      charge: -3.0,
      mass: 740.3812,
      formula: 'C21H25N7O17P3',
      compartment: 'c',
      chebi_id: 'CHEBI:58349'
    },
    {
      id: 'shikimate_c',
      name: 'shikimate',
      charge: -1.0,
      mass: 173.14336,
      formula: 'C7H9O5',
      compartment: 'c',
      chebi_id: 'CHEBI:36208'
    },
    {
      id: 'NADPH_4_c',
      name: 'NADPH(4-)',
      charge: -4.0,
      mass: 741.3891,
      formula: 'C21H26N7O17P3',
      compartment: 'c',
      chebi_id: 'CHEBI:57783'
    },
    {
      id: '3_phosphonatoshikimate_3_c',
      name: '3-phosphonatoshikimate(3-)',
      charge: -3.0,
      mass: 251.1074,
      formula: 'C7H8O8P',
      compartment: 'c',
      chebi_id: 'CHEBI:145989'
    },
    {
      id: 'phosphonatoenolpyruvate_c',
      name: 'phosphonatoenolpyruvate',
      charge: -3.0,
      mass: 165.0181,
      formula: 'C3H2O6P',
      compartment: 'c',
      chebi_id: 'CHEBI:58702'
    },
    {
      id: '5_O_1_carboxylatovinyl_3_phosphonatoshikimate_c',
      name: '5-O-(1-carboxylatovinyl)-3-phosphonatoshikimate',
      charge: -4.0,
      mass: 320.1462,
      formula: 'C10H9O10P',
      compartment: 'c',
      chebi_id: 'CHEBI:57701'
    },
    {
      id: 'chorismate_2_c',
      name: 'chorismate(2-)',
      charge: -2.0,
      mass: 224.16692,
      formula: 'C10H8O6',
      compartment: 'c',
      chebi_id: 'CHEBI:29748'
    },
    {
      id: '6S_5_6_7_8_tetrahydrofolate_2_c',
      name: '(6S)-5,6,7,8-tetrahydrofolate(2-)',
      charge: -2.0,
      mass: 443.4133,
      formula: 'C19H21N7O6',
      compartment: 'c',
      chebi_id: 'CHEBI:57453'
    },
    {
      id: 'N_6_R_S_8_ammoniomethyldihydrolipoyl_L_lysine_1_residue_c',
      name: 'N(6)-[(R)-S(8)-ammoniomethyldihydrolipoyl]-L-lysine(1+) residue',
      charge: 1.0,
      mass: 348.547,
      formula: 'C15H30N3O2S2',
      compartment: 'c',
      chebi_id: 'CHEBI:83143'
    },
    {
      id: '6R_5_10_methylenetetrahydrofolate_2_c',
      name: '(6R)-5,10-methylenetetrahydrofolate(2-)',
      charge: -2.0,
      mass: 455.42432,
      formula: 'C20H21N7O6',
      compartment: 'c',
      chebi_id: 'CHEBI:15636'
    },
    {
      id: 'N_6_R_dihydrolipoyl_L_lysine_residue_c',
      name: 'N(6)-[(R)-dihydrolipoyl]-L-lysine residue',
      charge: 0.0,
      mass: 318.498,
      formula: 'C14H26N2O2S2',
      compartment: 'c',
      chebi_id: 'CHEBI:83100'
    },
    {
      id: 'glycine_zwitterion_c',
      name: 'glycine zwitterion',
      charge: 0.0,
      mass: 75.0666,
      formula: 'C2H5NO2',
      compartment: 'c',
      chebi_id: 'CHEBI:57305'
    },
    {
      id: 'N_6_R_lipoyl_L_lysine_residue_c',
      name: 'N(6)-[(R)-lipoyl]-L-lysine residue',
      charge: 0.0,
      mass: 316.483,
      formula: 'C14H24N2O2S2',
      compartment: 'c',
      chebi_id: 'CHEBI:83099'
    },
    {
      id: 'carbon_dioxide_c',
      name: 'carbon dioxide',
      charge: 0.0,
      mass: 44.01,
      formula: 'CO2',
      compartment: 'c',
      chebi_id: 'CHEBI:16526'
    },
    {
      id: 'R_dihydrolipoamide_c',
      name: '(R)-dihydrolipoamide',
      charge: 0.0,
      mass: 207.35872,
      formula: 'C8H17NOS2',
      compartment: 'c',
      chebi_id: 'CHEBI:43711'
    },
    {
      id: 'R_lipoamide_c',
      name: '(R)-lipoamide',
      charge: 0.0,
      mass: 205.341,
      formula: 'C8H15NOS2',
      compartment: 'c',
      chebi_id: 'CHEBI:83094'
    },
    {
      id: 'L_serine_zwitterion_c',
      name: 'L-serine zwitterion',
      charge: 0.0,
      mass: 105.09262,
      formula: 'C3H7NO3',
      compartment: 'c',
      chebi_id: 'CHEBI:33384'
    },
    {
      id: 'L_aspartate_1_c',
      name: 'L-aspartate(1-)',
      charge: -1.0,
      mass: 132.09478,
      formula: 'C4H6NO4',
      compartment: 'c',
      chebi_id: 'CHEBI:29991'
    },
    {
      id: 'oxaloacetate_2_c',
      name: 'oxaloacetate(2-)',
      charge: -2.0,
      mass: 130.05568,
      formula: 'C4H2O5',
      compartment: 'c',
      chebi_id: 'CHEBI:16452'
    },
    {
      id: 'hydrogencarbonate_c',
      name: 'hydrogencarbonate',
      charge: -1.0,
      mass: 61.01684,
      formula: 'CHO3',
      compartment: 'c',
      chebi_id: 'CHEBI:17544'
    },
    {
      id: 'pyruvate_c',
      name: 'pyruvate',
      charge: -1.0,
      mass: 87.05412,
      formula: 'C3H3O3',
      compartment: 'c',
      chebi_id: 'CHEBI:15361'
    },
    {
      id: 'adenosine_3_5_bismonophosphate_4_c',
      name: 'adenosine 3\',5\'-bismonophosphate(4-)',
      charge: -4.0,
      mass: 423.1694,
      formula: 'C10H11N5O10P2',
      compartment: 'c',
      chebi_id: 'CHEBI:58343'
    },
    {
      id: 'adenosine_5_monophosphate_2_c',
      name: 'adenosine 5\'-monophosphate(2-)',
      charge: -2.0,
      mass: 345.2053,
      formula: 'C10H12N5O7P',
      compartment: 'c',
      chebi_id: 'CHEBI:456215'
    },
    {
      id: '2S_3S_2_3_dihydroxy_2_3_dihydrobenzoate_c',
      name: '(2S,3S)-2,3-dihydroxy-2,3-dihydrobenzoate',
      charge: -1.0,
      mass: 155.1281,
      formula: 'C7H7O4',
      compartment: 'c',
      chebi_id: 'CHEBI:58764'
    },
    {
      id: '2_3_dihydroxybenzoate_c',
      name: '2,3-dihydroxybenzoate',
      charge: -1.0,
      mass: 153.1122,
      formula: 'C7H5O4',
      compartment: 'c',
      chebi_id: 'CHEBI:36654'
    },
    {
      id: 'L_cysteine_residue_c',
      name: 'L-cysteine residue',
      charge: 0.0,
      mass: 103.14394,
      formula: 'C3H5NOS',
      compartment: 'c',
      chebi_id: 'CHEBI:29950'
    },
    {
      id: 'peroxol_c',
      name: 'peroxol',
      charge: 0.0,
      mass: 33.0067,
      formula: 'HO2R',
      compartment: 'c',
      chebi_id: 'CHEBI:35924'
    },
    {
      id: 'L_cystine_residue_c',
      name: 'L-cystine residue',
      charge: 0.0,
      mass: 204.272,
      formula: 'C6H8N2O2S2',
      compartment: 'c',
      chebi_id: 'CHEBI:50058'
    },
    {
      id: 'alcohol_c',
      name: 'alcohol',
      charge: 0.0,
      mass: 17.007,
      formula: 'HOR',
      compartment: 'c',
      chebi_id: 'CHEBI:30879'
    },
    {
      id: 'glutathionate_1_c',
      name: 'glutathionate(1-)',
      charge: -1.0,
      mass: 306.31,
      formula: 'C10H16N3O6S',
      compartment: 'c',
      chebi_id: 'CHEBI:57925'
    },
    {
      id: 'glutathione_disulfide_2_c',
      name: 'glutathione disulfide(2-)',
      charge: -2.0,
      mass: 610.615,
      formula: 'C20H30N6O12S2',
      compartment: 'c',
      chebi_id: 'CHEBI:58297'
    },
    {
      id: 'Protein_c',
      name: 'Protein',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'DNA_c',
      name: 'DNA',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'RNA_c',
      name: 'RNA',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'Cofactors_c',
      name: 'Cofactors',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'Phospholipids_c',
      name: 'Phospholipids',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'Carbohydrates_c',
      name: 'Carbohydrates',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'Cell_wall_c',
      name: 'Cell wall',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'L_alanine_zwitterion_c',
      name: 'L-alanine zwitterion',
      charge: 0.0,
      mass: 89.0932,
      formula: 'C3H7NO2',
      compartment: 'c',
      chebi_id: 'CHEBI:57972'
    },
    {
      id: 'L_argininium_1_c',
      name: 'L-argininium(1+)',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'L_asparagine_zwitterion_c',
      name: 'L-asparagine zwitterion',
      charge: 0.0,
      mass: 132.1179,
      formula: 'C4H8N2O3',
      compartment: 'c',
      chebi_id: 'CHEBI:58048'
    },
    {
      id: 'L_cysteine_zwitterion_c',
      name: 'L-cysteine zwitterion',
      charge: 0.0,
      mass: 121.15922,
      formula: 'C3H7NO2S',
      compartment: 'c',
      chebi_id: 'CHEBI:35235'
    },
    {
      id: 'L_histidine_zwitterion_c',
      name: 'L-histidine zwitterion',
      charge: 0.0,
      mass: 155.1546,
      formula: 'C6H9N3O2',
      compartment: 'c',
      chebi_id: 'CHEBI:57595'
    },
    {
      id: 'L_isoleucine_zwitterion_c',
      name: 'L-isoleucine zwitterion',
      charge: 0.0,
      mass: 131.1729,
      formula: 'C6H13NO2',
      compartment: 'c',
      chebi_id: 'CHEBI:58045'
    },
    {
      id: 'L_leucine_zwitterion_c',
      name: 'L-leucine zwitterion',
      charge: 0.0,
      mass: 131.1729,
      formula: 'C6H13NO2',
      compartment: 'c',
      chebi_id: 'CHEBI:57427'
    },
    {
      id: 'L_lysinium_1_c',
      name: 'L-lysinium(1+)',
      charge: 1.0,
      mass: 147.19558,
      formula: 'C6H15N2O2',
      compartment: 'c',
      chebi_id: 'CHEBI:32551'
    },
    {
      id: 'L_methionine_zwitterion_c',
      name: 'L-methionine zwitterion',
      charge: 0.0,
      mass: 149.211,
      formula: 'C5H11NO2S',
      compartment: 'c',
      chebi_id: 'CHEBI:57844'
    },
    {
      id: 'L_phenylalanine_zwitterion_c',
      name: 'L-phenylalanine zwitterion',
      charge: 0.0,
      mass: 165.1891,
      formula: 'C9H11NO2',
      compartment: 'c',
      chebi_id: 'CHEBI:58095'
    },
    {
      id: 'L_proline_zwitterion_c',
      name: 'L-proline zwitterion',
      charge: 0.0,
      mass: 115.1305,
      formula: 'C5H9NO2',
      compartment: 'c',
      chebi_id: 'CHEBI:60039'
    },
    {
      id: 'L_threonine_zwitterion_c',
      name: 'L-threonine zwitterion',
      charge: 0.0,
      mass: 119.1192,
      formula: 'C4H9NO3',
      compartment: 'c',
      chebi_id: 'CHEBI:57926'
    },
    {
      id: 'L_tryptophan_zwitterion_c',
      name: 'L-tryptophan zwitterion',
      charge: 0.0,
      mass: 204.2252,
      formula: 'C11H12N2O2',
      compartment: 'c',
      chebi_id: 'CHEBI:57912'
    },
    {
      id: 'L_tyrosine_zwitterion_c',
      name: 'L-tyrosine zwitterion',
      charge: 0.0,
      mass: 181.1885,
      formula: 'C9H11NO3',
      compartment: 'c',
      chebi_id: 'CHEBI:58315'
    },
    {
      id: 'L_valine_zwitterion_c',
      name: 'L-valine zwitterion',
      charge: 0.0,
      mass: 117.1463,
      formula: 'C5H11NO2',
      compartment: 'c',
      chebi_id: 'CHEBI:57762'
    },
    {
      id: '2_deoxyadenosine_5_monophosphate_c',
      name: '2\'-deoxyadenosine 5\'-monophosphate',
      charge: 0.0,
      mass: 331.22202,
      formula: 'C10H14N5O6P',
      compartment: 'c',
      chebi_id: 'CHEBI:17713'
    },
    {
      id: '2_deoxycytosine_5_monophosphate_2_c',
      name: '2\'-deoxycytosine 5\'-monophosphate(2-)',
      charge: -2.0,
      mass: 305.1812,
      formula: 'C9H12N3O7P',
      compartment: 'c',
      chebi_id: 'CHEBI:57566'
    },
    {
      id: 'dTMP_2_c',
      name: 'dTMP(2-)',
      charge: -2.0,
      mass: 320.1926,
      formula: 'C10H13N2O8P',
      compartment: 'c',
      chebi_id: 'CHEBI:63528'
    },
    {
      id: '2_deoxyguanosine_5_monophosphate_c',
      name: '2\'-deoxyguanosine 5\'-monophosphate',
      charge: 0.0,
      mass: 347.22142,
      formula: 'C10H14N5O7P',
      compartment: 'c',
      chebi_id: 'CHEBI:16192'
    },
    {
      id: 'guanosine_5_monophosphate_2_c',
      name: 'guanosine 5\'-monophosphate(2-)',
      charge: -2.0,
      mass: 361.2047,
      formula: 'C10H12N5O8P',
      compartment: 'c',
      chebi_id: 'CHEBI:58115'
    },
    {
      id: 'cytidine_5_monophosphate_2_c',
      name: 'cytidine 5\'-monophosphate(2-)',
      charge: -2.0,
      mass: 321.1806,
      formula: 'C9H12N3O8P',
      compartment: 'c',
      chebi_id: 'CHEBI:60377'
    },
    {
      id: 'uridine_5_monophosphate_2_c',
      name: 'uridine 5\'-monophosphate(2-)',
      charge: -2.0,
      mass: 322.1654,
      formula: 'C9H11N2O9P',
      compartment: 'c',
      chebi_id: 'CHEBI:57865'
    },
    {
      id: 'Biomass_b',
      name: 'Biomass',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'b',
      chebi_id: ''
    },
    {
      id: '2_oxoglutarate_e',
      name: '2-oxoglutarate',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'e',
      chebi_id: ''
    },
    {
      id: '2_oxoglutarate_c',
      name: '2-oxoglutarate',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'L_glutamate_1_e',
      name: 'L-glutamate(1-)',
      charge: -1.0,
      mass: 146.12136,
      formula: 'C5H8NO4',
      compartment: 'e',
      chebi_id: 'CHEBI:29985'
    },
    {
      id: 'water_e',
      name: 'water',
      charge: 0.0,
      mass: 18.0153,
      formula: 'H2O',
      compartment: 'e',
      chebi_id: 'CHEBI:15377'
    },
    {
      id: 'my_compound2_e',
      name: 'my_compound2',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'e',
      chebi_id: ''
    },
    {
      id: 'my_compound2_c',
      name: 'my_compound2',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'pyruvate_e',
      name: 'pyruvate',
      charge: -1.0,
      mass: 87.05412,
      formula: 'C3H3O3',
      compartment: 'e',
      chebi_id: 'CHEBI:15361'
    },
    {
      id: 'palmitate_16_0_e',
      name: 'palmitate (16:0)',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'e',
      chebi_id: ''
    },
    {
      id: 'palmitate_16_0_c',
      name: 'palmitate (16:0)',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    },
    {
      id: 'cholesterol_e',
      name: 'cholesterol',
      charge: 0.0,
      mass: 386.655,
      formula: 'C27H46O',
      compartment: 'e',
      chebi_id: 'CHEBI:16113'
    },
    {
      id: 'cholesterol_c',
      name: 'cholesterol',
      charge: 0.0,
      mass: 386.655,
      formula: 'C27H46O',
      compartment: 'c',
      chebi_id: 'CHEBI:16113'
    },
    {
      id: 'my_compound_e',
      name: 'my_compound',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'e',
      chebi_id: ''
    },
    {
      id: 'my_compound_c',
      name: 'my_compound',
      charge: '',
      mass: '',
      formula: '',
      compartment: 'c',
      chebi_id: ''
    }
  ],
  reactions: [
    {
      id: 'RHEA_15133_1_4_1_2',
      name: 'RHEA:15133_1.4.1.2',
      enzyme: {
        title: 'glutamate dehydrogenase',
        ec_number: '1.4.1.2',
        tax: {
          species: {
            tax_id: '3885',
            title: 'Phaseolus vulgaris'
          },
          genus: {
            tax_id: '3883',
            title: 'Phaseolus'
          },
          tribe: {
            tax_id: '163735',
            title: 'Phaseoleae'
          },
          clade: {
            tax_id: '3193',
            title: 'Embryophyta'
          },
          subfamily: {
            tax_id: '3814',
            title: 'Papilionoideae'
          },
          family: {
            tax_id: '3803',
            title: 'Fabaceae'
          },
          order: {
            tax_id: '72025',
            title: 'Fabales'
          },
          class: {
            tax_id: '3398',
            title: 'Magnoliopsida'
          },
          subphylum: {
            tax_id: '131221',
            title: 'Streptophytina'
          },
          phylum: {
            tax_id: '35493',
            title: 'Streptophyta'
          },
          kingdom: {
            tax_id: '33090',
            title: 'Viridiplantae'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'glutamate and glutamine metabolism'
          },
          kegg: {
            id: 'rn00290; rn01110',
            name: 'Valine, leucine and isoleucine biosynthesis; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'ARGININE-SYN4-PWY; GLUDEG-I-PWY; GLUTAMATE-SYN2-PWY; PWY-5766; GLUTSYN-PWY; PWY-5675; PWY490-3; GLUTSYNIII-PWY',
            name: 'L-ornithine biosynthesis II; GABA shunt; L-glutamate biosynthesis II; L-glutamate degradation X; L-glutamate biosynthesis I; nitrate reduction V (assimilatory); nitrate reduction VI (assimilatory); L-glutamate biosynthesis III'
          }
        }
      },
      metabolites: {
        water_c: -1.0,
        L_glutamate_1_c: -1.0,
        NAD_1_c: -1.0,
        '2_oxoglutarate_2_c': 1.0,
        hydron_c: 1.0,
        NADH_2_c: 1.0,
        ammonium_c: 1.0
      }
    },
    {
      id: 'RHEA_16169_6_3_1_2',
      name: 'RHEA:16169_6.3.1.2',
      enzyme: {
        title: 'glutamine synthetase',
        ec_number: '6.3.1.2',
        tax: {
          species: {
            tax_id: '3055',
            title: 'Chlamydomonas reinhardtii'
          },
          genus: {
            tax_id: '3052',
            title: 'Chlamydomonas'
          },
          family: {
            tax_id: '3051',
            title: 'Chlamydomonadaceae'
          },
          order: {
            tax_id: '3042',
            title: 'Chlamydomonadales'
          },
          clade: {
            tax_id: '2692248',
            title: 'core chlorophytes'
          },
          class: {
            tax_id: '3166',
            title: 'Chlorophyceae'
          },
          phylum: {
            tax_id: '3041',
            title: 'Chlorophyta'
          },
          kingdom: {
            tax_id: '33090',
            title: 'Viridiplantae'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          metacyc: {
            id: 'PWY-6965',
            name: 'methylamine degradation II'
          }
        }
      },
      metabolites: {
        ATP_4_c: -1.0,
        L_glutamate_1_c: -1.0,
        ammonium_c: -1.0,
        ADP_3_c: 1.0,
        hydron_c: 1.0,
        L_glutamine_zwitterion_c: 1.0,
        hydrogenphosphate_c: 1.0
      }
    },
    {
      id: 'RHEA_21968_4_2_3_4',
      name: 'RHEA:21968_4.2.3.4',
      enzyme: {
        title: '3-dehydroquinate synthase',
        ec_number: '4.2.3.4',
        tax: {
          species: {
            tax_id: '4929',
            title: 'Meyerozyma guilliermondii'
          },
          genus: {
            tax_id: '766728',
            title: 'Meyerozyma'
          },
          family: {
            tax_id: '766764',
            title: 'Debaryomycetaceae'
          },
          order: {
            tax_id: '4892',
            title: 'Saccharomycetales'
          },
          class: {
            tax_id: '4891',
            title: 'Saccharomycetes'
          },
          subphylum: {
            tax_id: '147537',
            title: 'Saccharomycotina'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          phylum: {
            tax_id: '4890',
            title: 'Ascomycota'
          },
          subkingdom: {
            tax_id: '451864',
            title: 'Dikarya'
          },
          kingdom: {
            tax_id: '4751',
            title: 'Fungi'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'chorismate metabolism'
          },
          kegg: {
            id: 'rn00400; rn01110',
            name: 'Phenylalanine, tyrosine and tryptophan biosynthesis; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'PWY-6164',
            name: '3-dehydroquinate biosynthesis I'
          }
        }
      },
      metabolites: {
        '7_phospho_2_dehydro_3_deoxy_D_arabino_heptonate_c': -1.0,
        '3_dehydroquinate_c': 1.0,
        hydrogenphosphate_c: 1.0
      }
    },
    {
      id: 'RHEA_21096_4_2_1_10',
      name: 'RHEA:21096_4.2.1.10',
      enzyme: {
        title: '3-dehydroquinate dehydratase',
        ec_number: '4.2.1.10',
        tax: {
          species: {
            tax_id: '3888',
            title: 'Pisum sativum'
          },
          genus: {
            tax_id: '3887',
            title: 'Pisum'
          },
          tribe: {
            tax_id: '163743',
            title: 'Fabeae'
          },
          clade: {
            tax_id: '3193',
            title: 'Embryophyta'
          },
          subfamily: {
            tax_id: '3814',
            title: 'Papilionoideae'
          },
          family: {
            tax_id: '3803',
            title: 'Fabaceae'
          },
          order: {
            tax_id: '72025',
            title: 'Fabales'
          },
          class: {
            tax_id: '3398',
            title: 'Magnoliopsida'
          },
          subphylum: {
            tax_id: '131221',
            title: 'Streptophytina'
          },
          phylum: {
            tax_id: '35493',
            title: 'Streptophyta'
          },
          kingdom: {
            tax_id: '33090',
            title: 'Viridiplantae'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'chorismate metabolism'
          },
          kegg: {
            id: 'rn00400; rn01110',
            name: 'Phenylalanine, tyrosine and tryptophan biosynthesis; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'PWY-6707; PWY-6163; PWY-6416; QUINATEDEG-PWY',
            name: 'gallate biosynthesis; chorismate biosynthesis from 3-dehydroquinate; quinate degradation II; quinate degradation I'
          }
        }
      },
      metabolites: {
        '3_dehydroquinate_c': -1.0,
        '3_dehydroshikimate_c': 1.0,
        water_c: 1.0
      }
    },
    {
      id: 'RHEA_17737_1_1_1_25',
      name: 'RHEA:17737_1.1.1.25',
      enzyme: {
        title: 'shikimate dehydrogenase',
        ec_number: '1.1.1.25',
        tax: {
          species: {
            tax_id: '4081',
            title: 'Solanum lycopersicum'
          },
          subgenus: {
            tax_id: '49274',
            title: 'Solanum subgen. Lycopersicon'
          },
          genus: {
            tax_id: '4107',
            title: 'Solanum'
          },
          tribe: {
            tax_id: '424574',
            title: 'Solaneae'
          },
          subfamily: {
            tax_id: '424551',
            title: 'Solanoideae'
          },
          family: {
            tax_id: '4070',
            title: 'Solanaceae'
          },
          order: {
            tax_id: '4069',
            title: 'Solanales'
          },
          clade: {
            tax_id: '3193',
            title: 'Embryophyta'
          },
          class: {
            tax_id: '3398',
            title: 'Magnoliopsida'
          },
          subphylum: {
            tax_id: '131221',
            title: 'Streptophytina'
          },
          phylum: {
            tax_id: '35493',
            title: 'Streptophyta'
          },
          kingdom: {
            tax_id: '33090',
            title: 'Viridiplantae'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'chorismate metabolism'
          },
          kegg: {
            id: 'rn00400; rn01110',
            name: 'Phenylalanine, tyrosine and tryptophan biosynthesis; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'PWY-6419',
            name: 'shikimate degradation II'
          }
        }
      },
      metabolites: {
        NADP_3_c: -1.0,
        shikimate_c: -1.0,
        '3_dehydroshikimate_c': 1.0,
        hydron_c: 1.0,
        NADPH_4_c: 1.0
      }
    },
    {
      id: 'RHEA_13121_2_7_1_71',
      name: 'RHEA:13121_2.7.1.71',
      enzyme: {
        title: 'shikimate kinase',
        ec_number: '2.7.1.71',
        tax: {
          species: {
            tax_id: '4929',
            title: 'Meyerozyma guilliermondii'
          },
          genus: {
            tax_id: '766728',
            title: 'Meyerozyma'
          },
          family: {
            tax_id: '766764',
            title: 'Debaryomycetaceae'
          },
          order: {
            tax_id: '4892',
            title: 'Saccharomycetales'
          },
          class: {
            tax_id: '4891',
            title: 'Saccharomycetes'
          },
          subphylum: {
            tax_id: '147537',
            title: 'Saccharomycotina'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          phylum: {
            tax_id: '4890',
            title: 'Ascomycota'
          },
          subkingdom: {
            tax_id: '451864',
            title: 'Dikarya'
          },
          kingdom: {
            tax_id: '4751',
            title: 'Fungi'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'chorismate metabolism'
          },
          kegg: {
            id: 'rn00400; rn01110',
            name: 'Phenylalanine, tyrosine and tryptophan biosynthesis; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'PWY-6163',
            name: 'chorismate biosynthesis from 3-dehydroquinate'
          }
        }
      },
      metabolites: {
        ATP_4_c: -1.0,
        shikimate_c: -1.0,
        '3_phosphonatoshikimate_3_c': 1.0,
        ADP_3_c: 1.0,
        hydron_c: 1.0
      }
    },
    {
      id: 'RHEA_21256_2_5_1_19',
      name: 'RHEA:21256_2.5.1.19',
      enzyme: {
        title: '3-phosphoshikimate 1-carboxyvinyltransferase',
        ec_number: '2.5.1.19',
        tax: {
          species: {
            tax_id: '5141',
            title: 'Neurospora crassa'
          },
          genus: {
            tax_id: '5140',
            title: 'Neurospora'
          },
          family: {
            tax_id: '5148',
            title: 'Sordariaceae'
          },
          order: {
            tax_id: '5139',
            title: 'Sordariales'
          },
          subclass: {
            tax_id: '222544',
            title: 'Sordariomycetidae'
          },
          class: {
            tax_id: '147550',
            title: 'Sordariomycetes'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          subphylum: {
            tax_id: '147538',
            title: 'Pezizomycotina'
          },
          phylum: {
            tax_id: '4890',
            title: 'Ascomycota'
          },
          subkingdom: {
            tax_id: '451864',
            title: 'Dikarya'
          },
          kingdom: {
            tax_id: '4751',
            title: 'Fungi'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'chorismate metabolism'
          },
          kegg: {
            id: 'rn00400; rn01110',
            name: 'Phenylalanine, tyrosine and tryptophan biosynthesis; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'PWY-6163',
            name: 'chorismate biosynthesis from 3-dehydroquinate'
          }
        }
      },
      metabolites: {
        '3_phosphonatoshikimate_3_c': -1.0,
        phosphonatoenolpyruvate_c: -1.0,
        '5_O_1_carboxylatovinyl_3_phosphonatoshikimate_c': 1.0,
        hydrogenphosphate_c: 1.0
      }
    },
    {
      id: 'RHEA_21020_4_2_3_5',
      name: 'RHEA:21020_4.2.3.5',
      enzyme: {
        title: 'chorismate synthase',
        ec_number: '4.2.3.5',
        tax: {
          species: {
            tax_id: '4081',
            title: 'Solanum lycopersicum'
          },
          subgenus: {
            tax_id: '49274',
            title: 'Solanum subgen. Lycopersicon'
          },
          genus: {
            tax_id: '4107',
            title: 'Solanum'
          },
          tribe: {
            tax_id: '424574',
            title: 'Solaneae'
          },
          subfamily: {
            tax_id: '424551',
            title: 'Solanoideae'
          },
          family: {
            tax_id: '4070',
            title: 'Solanaceae'
          },
          order: {
            tax_id: '4069',
            title: 'Solanales'
          },
          clade: {
            tax_id: '3193',
            title: 'Embryophyta'
          },
          class: {
            tax_id: '3398',
            title: 'Magnoliopsida'
          },
          subphylum: {
            tax_id: '131221',
            title: 'Streptophytina'
          },
          phylum: {
            tax_id: '35493',
            title: 'Streptophyta'
          },
          kingdom: {
            tax_id: '33090',
            title: 'Viridiplantae'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'chorismate metabolism'
          },
          kegg: {
            id: 'rn00400; rn01110',
            name: 'Phenylalanine, tyrosine and tryptophan biosynthesis; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'PWY-6163',
            name: 'chorismate biosynthesis from 3-dehydroquinate'
          }
        }
      },
      metabolites: {
        '5_O_1_carboxylatovinyl_3_phosphonatoshikimate_c': -1.0,
        chorismate_2_c: 1.0,
        hydrogenphosphate_c: 1.0
      }
    },
    {
      id: 'RHEA_16945_2_1_2_10',
      name: 'RHEA:16945_2.1.2.10',
      enzyme: {
        title: 'aminomethyltransferase',
        ec_number: '2.1.2.10',
        tax: {
          species: {
            tax_id: '9031',
            title: 'Gallus gallus'
          },
          genus: {
            tax_id: '9030',
            title: 'Gallus'
          },
          subfamily: {
            tax_id: '9072',
            title: 'Phasianinae'
          },
          family: {
            tax_id: '9005',
            title: 'Phasianidae'
          },
          order: {
            tax_id: '8976',
            title: 'Galliformes'
          },
          superorder: {
            tax_id: '1549675',
            title: 'Galloanserae'
          },
          infraclass: {
            tax_id: '8825',
            title: 'Neognathae'
          },
          class: {
            tax_id: '8782',
            title: 'Aves'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          superclass: {
            tax_id: '8287',
            title: 'Sarcopterygii'
          },
          subphylum: {
            tax_id: '89593',
            title: 'Craniata'
          },
          phylum: {
            tax_id: '7711',
            title: 'Chordata'
          },
          kingdom: {
            tax_id: '33208',
            title: 'Metazoa'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          kegg: {
            id: 'rn00630; rn01110',
            name: 'Glyoxylate and dicarboxylate metabolism; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'GLYCINE-SYN2-PWY; GLYCLEAV-PWY',
            name: 'glycine biosynthesis II; glycine cleavage'
          }
        }
      },
      metabolites: {
        '6S_5_6_7_8_tetrahydrofolate_2_c': -1.0,
        N_6_R_S_8_ammoniomethyldihydrolipoyl_L_lysine_1_residue_c: -1.0,
        '6R_5_10_methylenetetrahydrofolate_2_c': 1.0,
        N_6_R_dihydrolipoyl_L_lysine_residue_c: 1.0,
        ammonium_c: 1.0
      }
    },
    {
      id: 'RHEA_24304_1_4_4_2',
      name: 'RHEA:24304_1.4.4.2',
      enzyme: {
        title: 'glycine dehydrogenase (aminomethyl-transferring)',
        ec_number: '1.4.4.2',
        tax: {
          species: {
            tax_id: '9031',
            title: 'Gallus gallus'
          },
          genus: {
            tax_id: '9030',
            title: 'Gallus'
          },
          subfamily: {
            tax_id: '9072',
            title: 'Phasianinae'
          },
          family: {
            tax_id: '9005',
            title: 'Phasianidae'
          },
          order: {
            tax_id: '8976',
            title: 'Galliformes'
          },
          superorder: {
            tax_id: '1549675',
            title: 'Galloanserae'
          },
          infraclass: {
            tax_id: '8825',
            title: 'Neognathae'
          },
          class: {
            tax_id: '8782',
            title: 'Aves'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          superclass: {
            tax_id: '8287',
            title: 'Sarcopterygii'
          },
          subphylum: {
            tax_id: '89593',
            title: 'Craniata'
          },
          phylum: {
            tax_id: '7711',
            title: 'Chordata'
          },
          kingdom: {
            tax_id: '33208',
            title: 'Metazoa'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          kegg: {
            id: 'rn00630; rn01110',
            name: 'Glyoxylate and dicarboxylate metabolism; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'GLYCINE-SYN2-PWY; GLYCLEAV-PWY',
            name: 'glycine biosynthesis II; glycine cleavage'
          }
        }
      },
      metabolites: {
        glycine_zwitterion_c: -1.0,
        hydron_c: -1.0,
        N_6_R_lipoyl_L_lysine_residue_c: -1.0,
        N_6_R_S_8_ammoniomethyldihydrolipoyl_L_lysine_1_residue_c: 1.0,
        carbon_dioxide_c: 1.0
      }
    },
    {
      id: 'RHEA_15045_1_8_1_4',
      name: 'RHEA:15045_1.8.1.4',
      enzyme: {
        title: 'dihydrolipoyl dehydrogenase',
        ec_number: '1.8.1.4',
        tax: {
          species: {
            tax_id: '4932',
            title: 'Saccharomyces cerevisiae'
          },
          genus: {
            tax_id: '4930',
            title: 'Saccharomyces'
          },
          family: {
            tax_id: '4893',
            title: 'Saccharomycetaceae'
          },
          order: {
            tax_id: '4892',
            title: 'Saccharomycetales'
          },
          class: {
            tax_id: '4891',
            title: 'Saccharomycetes'
          },
          subphylum: {
            tax_id: '147537',
            title: 'Saccharomycotina'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          phylum: {
            tax_id: '4890',
            title: 'Ascomycota'
          },
          subkingdom: {
            tax_id: '451864',
            title: 'Dikarya'
          },
          kingdom: {
            tax_id: '4751',
            title: 'Fungi'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          kegg: {
            id: 'rn00630; rn01110',
            name: 'Glyoxylate and dicarboxylate metabolism; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'PYRUVDEHYD-PWY',
            name: 'pyruvate decarboxylation to acetyl CoA I'
          },
          brenda: {
            id: '',
            name: 'non-pathway related'
          }
        }
      },
      metabolites: {
        N_6_R_dihydrolipoyl_L_lysine_residue_c: -1.0,
        NAD_1_c: -1.0,
        N_6_R_lipoyl_L_lysine_residue_c: 1.0,
        hydron_c: 1.0,
        NADH_2_c: 1.0
      }
    },
    {
      id: 'RHEA_33059_1_8_1_4',
      name: 'RHEA:33059_1.8.1.4',
      enzyme: {
        title: 'dihydrolipoyl dehydrogenase',
        ec_number: '1.8.1.4',
        tax: {
          species: {
            tax_id: '4932',
            title: 'Saccharomyces cerevisiae'
          },
          genus: {
            tax_id: '4930',
            title: 'Saccharomyces'
          },
          family: {
            tax_id: '4893',
            title: 'Saccharomycetaceae'
          },
          order: {
            tax_id: '4892',
            title: 'Saccharomycetales'
          },
          class: {
            tax_id: '4891',
            title: 'Saccharomycetes'
          },
          subphylum: {
            tax_id: '147537',
            title: 'Saccharomycotina'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          phylum: {
            tax_id: '4890',
            title: 'Ascomycota'
          },
          subkingdom: {
            tax_id: '451864',
            title: 'Dikarya'
          },
          kingdom: {
            tax_id: '4751',
            title: 'Fungi'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          kegg: {
            id: 'rn00630; rn01110',
            name: 'Glyoxylate and dicarboxylate metabolism; Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'PYRUVDEHYD-PWY',
            name: 'pyruvate decarboxylation to acetyl CoA I'
          },
          brenda: {
            id: '',
            name: 'non-pathway related'
          }
        }
      },
      metabolites: {
        R_dihydrolipoamide_c: -1.0,
        NAD_1_c: -1.0,
        R_lipoamide_c: 1.0,
        hydron_c: 1.0,
        NADH_2_c: 1.0
      }
    },
    {
      id: 'RHEA_15481_2_1_2_1',
      name: 'RHEA:15481_2.1.2.1',
      enzyme: {
        title: 'glycine hydroxymethyltransferase',
        ec_number: '2.1.2.1',
        tax: {
          species: {
            tax_id: '7091',
            title: 'Bombyx mori'
          },
          genus: {
            tax_id: '7090',
            title: 'Bombyx'
          },
          subfamily: {
            tax_id: '475327',
            title: 'Bombycinae'
          },
          family: {
            tax_id: '7089',
            title: 'Bombycidae'
          },
          superfamily: {
            tax_id: '37569',
            title: 'Bombycoidea'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          parvorder: {
            tax_id: '41197',
            title: 'Heteroneura'
          },
          infraorder: {
            tax_id: '41196',
            title: 'Neolepidoptera'
          },
          suborder: {
            tax_id: '41191',
            title: 'Glossata'
          },
          order: {
            tax_id: '7088',
            title: 'Lepidoptera'
          },
          superorder: {
            tax_id: '85604',
            title: 'Amphiesmenoptera'
          },
          cohort: {
            tax_id: '33392',
            title: 'Endopterygota'
          },
          infraclass: {
            tax_id: '33340',
            title: 'Neoptera'
          },
          subclass: {
            tax_id: '7496',
            title: 'Pterygota'
          },
          class: {
            tax_id: '50557',
            title: 'Insecta'
          },
          subphylum: {
            tax_id: '6960',
            title: 'Hexapoda'
          },
          phylum: {
            tax_id: '6656',
            title: 'Arthropoda'
          },
          kingdom: {
            tax_id: '33208',
            title: 'Metazoa'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          kegg: {
            id: 'rn00680; rn01120',
            name: 'Methane metabolism; Microbial metabolism in diverse environments'
          }
        }
      },
      metabolites: {
        '6R_5_10_methylenetetrahydrofolate_2_c': -1.0,
        glycine_zwitterion_c: -1.0,
        water_c: -1.0,
        '6S_5_6_7_8_tetrahydrofolate_2_c': 1.0,
        L_serine_zwitterion_c: 1.0
      }
    },
    {
      id: 'RHEA_21824_2_6_1_1',
      name: 'RHEA:21824_2.6.1.1',
      enzyme: {
        title: 'aspartate transaminase',
        ec_number: '2.6.1.1',
        tax: {
          species: {
            tax_id: '9031',
            title: 'Gallus gallus'
          },
          genus: {
            tax_id: '9030',
            title: 'Gallus'
          },
          subfamily: {
            tax_id: '9072',
            title: 'Phasianinae'
          },
          family: {
            tax_id: '9005',
            title: 'Phasianidae'
          },
          order: {
            tax_id: '8976',
            title: 'Galliformes'
          },
          superorder: {
            tax_id: '1549675',
            title: 'Galloanserae'
          },
          infraclass: {
            tax_id: '8825',
            title: 'Neognathae'
          },
          class: {
            tax_id: '8782',
            title: 'Aves'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          superclass: {
            tax_id: '8287',
            title: 'Sarcopterygii'
          },
          subphylum: {
            tax_id: '89593',
            title: 'Craniata'
          },
          phylum: {
            tax_id: '7711',
            title: 'Chordata'
          },
          kingdom: {
            tax_id: '33208',
            title: 'Metazoa'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'coenzyme M biosynthesis'
          },
          kegg: {
            id: 'rn00250',
            name: 'Alanine, aspartate and glutamate metabolism'
          },
          metacyc: {
            id: 'PWY-6638; PWY-6642; PWY-6643',
            name: 'sulfolactate degradation III; (R)-cysteate degradation; coenzyme M biosynthesis II'
          }
        }
      },
      metabolites: {
        '2_oxoglutarate_2_c': -1.0,
        L_aspartate_1_c: -1.0,
        L_glutamate_1_c: 1.0,
        oxaloacetate_2_c: 1.0
      }
    },
    {
      id: 'RHEA_20844_6_4_1_1',
      name: 'RHEA:20844_6.4.1.1',
      enzyme: {
        title: 'pyruvate carboxylase',
        ec_number: '6.4.1.1',
        tax: {
          species: {
            tax_id: '9031',
            title: 'Gallus gallus'
          },
          genus: {
            tax_id: '9030',
            title: 'Gallus'
          },
          subfamily: {
            tax_id: '9072',
            title: 'Phasianinae'
          },
          family: {
            tax_id: '9005',
            title: 'Phasianidae'
          },
          order: {
            tax_id: '8976',
            title: 'Galliformes'
          },
          superorder: {
            tax_id: '1549675',
            title: 'Galloanserae'
          },
          infraclass: {
            tax_id: '8825',
            title: 'Neognathae'
          },
          class: {
            tax_id: '8782',
            title: 'Aves'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          superclass: {
            tax_id: '8287',
            title: 'Sarcopterygii'
          },
          subphylum: {
            tax_id: '89593',
            title: 'Craniata'
          },
          phylum: {
            tax_id: '7711',
            title: 'Chordata'
          },
          kingdom: {
            tax_id: '33208',
            title: 'Metazoa'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'biotin biosynthesis'
          },
          kegg: {
            id: 'rn00620; rn01120',
            name: 'Pyruvate metabolism; Microbial metabolism in diverse environments'
          },
          metacyc: {
            id: 'PWY-8086; PWY-6142; P42-PWY; PWY66-399; PWY-6146',
            name: '(S)-lactate fermentation to propanoate, acetate and hydrogen; gluconeogenesis II (Methanobacterium thermoautotrophicum); incomplete reductive TCA cycle; gluconeogenesis III; Methanobacterium thermoautotrophicum biosynthetic metabolism'
          }
        }
      },
      metabolites: {
        ATP_4_c: -1.0,
        hydrogencarbonate_c: -1.0,
        pyruvate_c: -1.0,
        ADP_3_c: 1.0,
        hydron_c: 1.0,
        oxaloacetate_2_c: 1.0,
        hydrogenphosphate_c: 1.0
      }
    },
    {
      id: 'RHEA_10040_3_1_3_7',
      name: 'RHEA:10040_3.1.3.7',
      enzyme: {
        title: '3\'(2\'),5\'-bisphosphate nucleotidase',
        ec_number: '3.1.3.7',
        tax: {
          species: {
            tax_id: '4959',
            title: 'Debaryomyces hansenii'
          },
          genus: {
            tax_id: '4958',
            title: 'Debaryomyces'
          },
          family: {
            tax_id: '766764',
            title: 'Debaryomycetaceae'
          },
          order: {
            tax_id: '4892',
            title: 'Saccharomycetales'
          },
          class: {
            tax_id: '4891',
            title: 'Saccharomycetes'
          },
          subphylum: {
            tax_id: '147537',
            title: 'Saccharomycotina'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          phylum: {
            tax_id: '4890',
            title: 'Ascomycota'
          },
          subkingdom: {
            tax_id: '451864',
            title: 'Dikarya'
          },
          kingdom: {
            tax_id: '4751',
            title: 'Fungi'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        pathway: {
          brenda: {
            id: '',
            name: 'photosynthesis; glycolysis'
          },
          kegg: {
            id: 'rn00920; rn01120',
            name: 'Sulfur metabolism; Microbial metabolism in diverse environments'
          },
          metacyc: {
            id: 'PWY-6363',
            name: 'D-myo-inositol (1,4,5)-trisphosphate degradation'
          }
        }
      },
      metabolites: {
        adenosine_3_5_bismonophosphate_4_c: -1.0,
        water_c: -1.0,
        adenosine_5_monophosphate_2_c: 1.0,
        hydrogenphosphate_c: 1.0
      }
    },
    {
      id: 'RHEA_23824_1_3_1_28',
      name: 'RHEA:23824_1.3.1.28',
      enzyme: {
        title: '2,3-dihydro-2,3-dihydroxybenzoate dehydrogenase',
        ec_number: '1.3.1.28',
        tax: {
          species: {
            tax_id: '562',
            title: 'Escherichia coli'
          },
          genus: {
            tax_id: '561',
            title: 'Escherichia'
          },
          family: {
            tax_id: '543',
            title: 'Enterobacteriaceae'
          },
          order: {
            tax_id: '91347',
            title: 'Enterobacterales'
          },
          class: {
            tax_id: '1236',
            title: 'Gammaproteobacteria'
          },
          phylum: {
            tax_id: '1224',
            title: 'Proteobacteria'
          },
          superkingdom: {
            tax_id: '2',
            title: 'Bacteria'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        related_deprecated_enzyme: {
          ec_number: '1.1.1.109',
          reason: 'transferred'
        },
        pathway: {
          brenda: {
            id: '',
            name: 'enterobactin biosynthesis'
          },
          kegg: {
            id: 'rn01110',
            name: 'Biosynthesis of secondary metabolites'
          },
          metacyc: {
            id: 'PWY-5901',
            name: '2,3-dihydroxybenzoate biosynthesis'
          }
        }
      },
      metabolites: {
        '2S_3S_2_3_dihydroxy_2_3_dihydrobenzoate_c': -1.0,
        NAD_1_c: -1.0,
        '2_3_dihydroxybenzoate_c': 1.0,
        hydron_c: 1.0,
        NADH_2_c: 1.0
      }
    },
    {
      id: 'RHEA_62620_1_11_1_24',
      name: 'RHEA:62620_1.11.1.24',
      enzyme: {
        title: 'thioredoxin-dependent peroxiredoxin',
        ec_number: '1.11.1.24',
        tax: {
          species: {
            tax_id: '10090',
            title: 'Mus musculus'
          },
          subgenus: {
            tax_id: '862507',
            title: 'Mus'
          },
          genus: {
            tax_id: '10088',
            title: 'Mus'
          },
          subfamily: {
            tax_id: '39107',
            title: 'Murinae'
          },
          family: {
            tax_id: '10066',
            title: 'Muridae'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          suborder: {
            tax_id: '1963758',
            title: 'Myomorpha'
          },
          order: {
            tax_id: '9989',
            title: 'Rodentia'
          },
          superorder: {
            tax_id: '314146',
            title: 'Euarchontoglires'
          },
          class: {
            tax_id: '40674',
            title: 'Mammalia'
          },
          superclass: {
            tax_id: '8287',
            title: 'Sarcopterygii'
          },
          subphylum: {
            tax_id: '89593',
            title: 'Craniata'
          },
          phylum: {
            tax_id: '7711',
            title: 'Chordata'
          },
          kingdom: {
            tax_id: '33208',
            title: 'Metazoa'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        related_deprecated_enzyme: {
          ec_number: '1.11.1.15',
          reason: 'deleted'
        },
        pathway: {
          brenda: {
            id: '',
            name: 'non-pathway related'
          }
        }
      },
      metabolites: {
        L_cysteine_residue_c: -1.0,
        peroxol_c: -1.0,
        L_cystine_residue_c: 1.0,
        alcohol_c: 1.0,
        water_c: 1.0
      }
    },
    {
      id: 'RHEA_62624_1_11_1_25',
      name: 'RHEA:62624_1.11.1.25',
      enzyme: {
        title: 'glutaredoxin-dependent peroxiredoxin',
        ec_number: '1.11.1.25',
        tax: {
          species: {
            tax_id: '3694',
            title: 'Populus trichocarpa'
          },
          genus: {
            tax_id: '3689',
            title: 'Populus'
          },
          tribe: {
            tax_id: '238069',
            title: 'Saliceae'
          },
          family: {
            tax_id: '3688',
            title: 'Salicaceae'
          },
          order: {
            tax_id: '3646',
            title: 'Malpighiales'
          },
          clade: {
            tax_id: '3193',
            title: 'Embryophyta'
          },
          class: {
            tax_id: '3398',
            title: 'Magnoliopsida'
          },
          subphylum: {
            tax_id: '131221',
            title: 'Streptophytina'
          },
          phylum: {
            tax_id: '35493',
            title: 'Streptophyta'
          },
          kingdom: {
            tax_id: '33090',
            title: 'Viridiplantae'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        related_deprecated_enzyme: {
          ec_number: '1.11.1.15',
          reason: 'deleted'
        },
        pathway: {
          brenda: {
            id: '',
            name: 'non-pathway related'
          }
        }
      },
      metabolites: {
        L_cysteine_residue_c: -1.0,
        peroxol_c: -1.0,
        L_cystine_residue_c: 1.0,
        alcohol_c: 1.0,
        water_c: 1.0
      }
    },
    {
      id: 'RHEA_62632_1_11_1_27',
      name: 'RHEA:62632_1.11.1.27',
      enzyme: {
        title: 'glutathione-dependent peroxiredoxin',
        ec_number: '1.11.1.27',
        tax: {
          species: {
            tax_id: '10090',
            title: 'Mus musculus'
          },
          subgenus: {
            tax_id: '862507',
            title: 'Mus'
          },
          genus: {
            tax_id: '10088',
            title: 'Mus'
          },
          subfamily: {
            tax_id: '39107',
            title: 'Murinae'
          },
          family: {
            tax_id: '10066',
            title: 'Muridae'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          suborder: {
            tax_id: '1963758',
            title: 'Myomorpha'
          },
          order: {
            tax_id: '9989',
            title: 'Rodentia'
          },
          superorder: {
            tax_id: '314146',
            title: 'Euarchontoglires'
          },
          class: {
            tax_id: '40674',
            title: 'Mammalia'
          },
          superclass: {
            tax_id: '8287',
            title: 'Sarcopterygii'
          },
          subphylum: {
            tax_id: '89593',
            title: 'Craniata'
          },
          phylum: {
            tax_id: '7711',
            title: 'Chordata'
          },
          kingdom: {
            tax_id: '33208',
            title: 'Metazoa'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        related_deprecated_enzyme: {
          ec_number: '1.11.1.15',
          reason: 'deleted'
        },
        pathway: {}
      },
      metabolites: {
        peroxol_c: -1.0,
        glutathionate_1_c: -2.0,
        alcohol_c: 1.0,
        glutathione_disulfide_2_c: 1.0,
        water_c: 1.0
      }
    },
    {
      id: 'RHEA_62636_1_11_1_28',
      name: 'RHEA:62636_1.11.1.28',
      enzyme: {
        title: 'lipoyl-dependent peroxiredoxin',
        ec_number: '1.11.1.28',
        tax: {
          species: {
            tax_id: '1873960',
            title: 'Pseudocercospora fijiensis'
          },
          genus: {
            tax_id: '131324',
            title: 'Pseudocercospora'
          },
          family: {
            tax_id: '93133',
            title: 'Mycosphaerellaceae'
          },
          order: {
            tax_id: '2726947',
            title: 'Mycosphaerellales'
          },
          subclass: {
            tax_id: '451867',
            title: 'Dothideomycetidae'
          },
          class: {
            tax_id: '147541',
            title: 'Dothideomycetes'
          },
          clade: {
            tax_id: '33154',
            title: 'Opisthokonta'
          },
          subphylum: {
            tax_id: '147538',
            title: 'Pezizomycotina'
          },
          phylum: {
            tax_id: '4890',
            title: 'Ascomycota'
          },
          subkingdom: {
            tax_id: '451864',
            title: 'Dikarya'
          },
          kingdom: {
            tax_id: '4751',
            title: 'Fungi'
          },
          superkingdom: {
            tax_id: '2759',
            title: 'Eukaryota'
          },
          'no rank': {
            tax_id: '1',
            title: 'root'
          }
        },
        related_deprecated_enzyme: {
          ec_number: '1.11.1.15',
          reason: 'deleted'
        },
        pathway: {}
      },
      metabolites: {
        N_6_R_dihydrolipoyl_L_lysine_residue_c: -1.0,
        peroxol_c: -1.0,
        N_6_R_lipoyl_L_lysine_residue_c: 1.0,
        alcohol_c: 1.0,
        water_c: 1.0
      }
    },
    {
      id: 'Biomass',
      name: '',
      enzyme: {},
      metabolites: {
        Protein_c: -0.317663551,
        DNA_c: -0.050537383,
        RNA_c: -0.025990654,
        Cofactors_c: -0.021658879,
        Phospholipids_c: -0.154266667,
        Carbohydrates_c: -0.202149533,
        Cell_wall_c: -0.115,
        Biomass_b: 1.0
      }
    },
    {
      id: 'Protein',
      name: '',
      enzyme: {},
      metabolites: {
        L_alanine_zwitterion_c: -0.587530055,
        L_argininium_1_c: -0.104025999,
        L_asparagine_zwitterion_c: -0.47552295,
        L_aspartate_1_c: -0.610918536,
        L_cysteine_zwitterion_c: -0.475540207,
        L_glutamine_zwitterion_c: -0.332833349,
        L_glutamate_1_c: -0.166907054,
        glycine_zwitterion_c: -1.517272544,
        L_histidine_zwitterion_c: -0.623494829,
        L_isoleucine_zwitterion_c: -0.87550672,
        L_leucine_zwitterion_c: -0.183363222,
        L_lysinium_1_c: -0.487365325,
        L_methionine_zwitterion_c: -0.276665758,
        L_phenylalanine_zwitterion_c: -0.244286816,
        L_proline_zwitterion_c: -0.454954293,
        L_serine_zwitterion_c: -1.000212965,
        L_threonine_zwitterion_c: -0.499161506,
        L_tryptophan_zwitterion_c: -0.254378061,
        L_tyrosine_zwitterion_c: -0.06526649,
        L_valine_zwitterion_c: -0.381473698,
        Protein_c: 1.0
      }
    },
    {
      id: 'DNA',
      name: '',
      enzyme: {},
      metabolites: {
        '2_deoxyadenosine_5_monophosphate_c': -1.167724079,
        '2_deoxycytosine_5_monophosphate_2_c': -0.465255786,
        dTMP_2_c: -1.198713221,
        '2_deoxyguanosine_5_monophosphate_c': -0.410310717,
        DNA_c: 1.0
      }
    },
    {
      id: 'RNA',
      name: '',
      enzyme: {},
      metabolites: {
        adenosine_5_monophosphate_2_c: -0.88,
        guanosine_5_monophosphate_2_c: -0.723,
        cytidine_5_monophosphate_2_c: -0.637,
        uridine_5_monophosphate_2_c: -0.869,
        RNA_c: 1.0
      }
    },
    {
      id: '2_oxoglutarate_ex',
      name: '',
      enzyme: {},
      metabolites: {
        '2_oxoglutarate_e': -1.0,
        '2_oxoglutarate_c': 1.0
      }
    },
    {
      id: 'L_glutamate_1_ex',
      name: '',
      enzyme: {},
      metabolites: {
        L_glutamate_1_e: -1.0,
        L_glutamate_1_c: 1.0
      }
    },
    {
      id: 'water_ex',
      name: '',
      enzyme: {},
      metabolites: {
        water_e: -1.0,
        water_c: 1.0
      }
    },
    {
      id: 'my_compound2_ex',
      name: '',
      enzyme: {},
      metabolites: {
        my_compound2_e: -1.0,
        my_compound2_c: 1.0
      }
    },
    {
      id: 'pyruvate_ex',
      name: '',
      enzyme: {},
      metabolites: {
        pyruvate_e: -1.0,
        pyruvate_c: 1.0
      }
    },
    {
      id: 'palmitate_16_0_ex',
      name: '',
      enzyme: {},
      metabolites: {
        palmitate_16_0_e: -1.0,
        palmitate_16_0_c: 1.0
      }
    },
    {
      id: 'cholesterol_ex',
      name: '',
      enzyme: {},
      metabolites: {
        cholesterol_e: -1.0,
        cholesterol_c: 1.0
      }
    },
    {
      id: 'my_compound_ex',
      name: '',
      enzyme: {},
      metabolites: {
        my_compound_e: -1.0,
        my_compound_c: 1.0
      }
    }
  ],
  compartments: {
    e: 'extracellular',
    c: 'cytosol',
    n: 'nucleus',
    b: 'biomass'
  }
};
