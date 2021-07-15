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
    select_node_help_text: 'Sélectionner un node pour voir le détail ici'
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
    select_node_help_text: 'Select a node to view detail here'
  }
};

export const flBioNetworkI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flBioNetworkI18nEn,
  [ClSupportedLanguage.fr]: flBioNetworkI18nFr
};
