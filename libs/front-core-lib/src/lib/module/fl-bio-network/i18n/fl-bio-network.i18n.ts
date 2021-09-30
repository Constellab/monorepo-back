import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flBioNetworkI18nFr: FlLangTranslation = {
  flBioNetwork: {
    links: 'Lien externes',
    link_value_help: 'Slider pour cacher les lien d\'une valeur inférieur à',
    link_color_normal: 'Couleurs linéaires',
    link_color_log: 'Couleurs logarithmes',
    select_sub_pathway: 'Sélectionner un pathway',
    open_config: 'Ouvrir les paramètres',
    config: 'Config',
    node: 'Node',
    select_db: 'Sélectionner une base de données',
    select_network: 'Sélectionner un réseau',
    network: 'Réseau',
    select_node_help_text: 'Sélectionner un node pour voir le détail ici',
    compartments: 'Compartiments',
    pin_drawer: 'Épingler',
    unpin_drawer: 'Désépingler',
    metabolites_count : '{{count}} métabolites',
    cofactors_count : '{{count}} cofacteurs',
    reactions_count : '{{count}} réactions',
    links_count : '{{count}} liens',
    export_position_to_json: 'Exporter les positions',
    select_all_pathway: 'Tout sélectionner',
    highlight_pathway: 'Coloriser le pathway',
    highlight_all_pathway: 'Coloriser tous les pathways sélectionnés'
  }
};

const flBioNetworkI18nEn: FlLangTranslation = {
  flBioNetwork: {
    links: 'External links',
    link_value_help: 'Slide to hide link with a value lower than',
    link_color_normal: 'Linears colors',
    link_color_log: 'Logarithm colors',
    select_sub_pathway: 'Select a pathway',
    config: 'Config',
    node: 'Node',
    open_config: 'Open config',
    select_db: 'Select a database',
    select_network: 'Select a network',
    network: 'Network',
    select_node_help_text: 'Select a node to view detail here',
    compartments: 'Compartments',
    pin_drawer: 'Pin',
    unpin_drawer: 'Unpin',
    metabolites_count : '{{count}} metabolites',
    cofactors_count : '{{count}} cofactors',
    reactions_count : '{{count}} reactions',
    links_count : '{{count}} links',
    export_position_to_json: 'Export positions',
    select_all_pathway: 'Select all',
    highlight_pathway: 'Colorize pathway',
    highlight_all_pathway: 'Colorize all selected pathways'
  }
};

export const flBioNetworkI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flBioNetworkI18nEn,
  [ClSupportedLanguage.fr]: flBioNetworkI18nFr
};
