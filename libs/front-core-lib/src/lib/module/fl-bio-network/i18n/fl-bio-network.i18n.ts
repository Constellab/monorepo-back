import {ClSupportedLanguage} from '@monorepo/core-lib';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flBioNetworkI18nFr: FlLangTranslation = {
  flBioNetwork: {
    links: 'Lien externes',
    flux_threshold: 'Seuil du flux',
    link_colors: 'Couleur des liens',
    link_color_linear: 'Linéaires',
    link_color_log_2: 'Log 2',
    link_color_log_10: 'Log 10',
    link_color_threshold_75: 'Seuil Q=75',
    link_color_threshold_95: 'Seuil Q=95',
    select_clusters: 'Sélectionner des clusters',
    open_config: 'Ouvrir les paramètres',
    config: 'Config',
    node: 'Node',
    select_db: 'Sélectionner une base de données',
    select_network: 'Sélectionner un réseau',
    network: 'Réseau',
    select_node_help_text: 'Sélectionner un node pour voir le détail ici',
    compartments: 'Compartiments',
    metabolites_count : '{{count}} métabolites',
    cofactors_count : '{{count}} cofacteurs',
    reactions_count : '{{count}} réactions',
    links_count : '{{count}} liens',
    export_position_to_json: 'Exporter les positions',
    select_all_pathway: 'Tout sélectionner',
    highlight_pathway: 'Coloriser le pathway',
    highlight_all_pathway: 'Coloriser tous les pathways sélectionnés',
    search_node: 'Rechercher un metabolite',
    toggle_show_cofactor: 'Afficher les cofacteurs',
    toggle_show_texts: 'Afficher les textes',
    toggle_show_minor: 'Afficher les mineurs',
    id: 'Id',
    name: 'Nom',
    details: 'Détails',
    enzyme_name: 'Nom de l\'enzyme',
    enzyme_ec_number: 'EC number de l\'enzyme',
    flux_value: 'Valeur',
    flux_estimate: 'Estimation du flux',
    flux_interval: 'Intervalle',
    flux_constraints: 'Contraintes de flux',
    pathways: 'Pathways',
  }
};

const flBioNetworkI18nEn: FlLangTranslation = {
  flBioNetwork: {
    links: 'External links',
    flux_threshold: 'Flux threshold',
    link_colors: 'Link colors',
    link_color_linear: 'Linear',
    link_color_log_2: 'Log 2',
    link_color_log_10: 'Log 10',
    link_color_threshold_75: 'Threshold Q=75',
    link_color_threshold_95: 'Threshold Q=95',
    select_clusters: 'Select clusters',
    config: 'Config',
    node: 'Node',
    open_config: 'Open config',
    select_db: 'Select a database',
    select_network: 'Select a network',
    network: 'Network',
    select_node_help_text: 'Select a node to view detail here',
    compartments: 'Compartments',
    metabolites_count : '{{count}} metabolites',
    cofactors_count : '{{count}} cofactors',
    reactions_count : '{{count}} reactions',
    links_count : '{{count}} links',
    export_position_to_json: 'Export positions',
    select_all_pathway: 'Select all',
    highlight_pathway: 'Colorize pathway',
    highlight_all_pathway: 'Colorize all selected pathways',
    search_node: 'Search metabolite',
    toggle_show_cofactor: 'Show cofactors',
    toggle_show_texts: 'Show texts',
    toggle_show_minor: 'Show minors',
    id: 'Id',
    name: 'Name',
    details: 'Details',
    enzyme_name: 'Enzyme name',
    enzyme_ec_number: 'Enzyme EC number',
    flux_value: 'Value',
    flux_estimate: 'Flux estimate',
    flux_interval: 'Interval',
    flux_constraints: 'Flux constraints',
    pathways: 'Pathways',
  }
};

export const flBioNetworkI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flBioNetworkI18nEn,
  [ClSupportedLanguage.fr]: flBioNetworkI18nFr
};
