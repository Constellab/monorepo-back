import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';
import {ClSupportedLanguage} from '@monorepo/core-lib';
/* eslint-disable max-len */

/**
 * Translation file for the Spreadsheet module
 */
const prProtocolI18nFr: FlLangTranslation = {
  pr: {
    type_unavailable_detail: 'Le type \'<strong>{typingName}</strong>\' de l\'objet n\'est pas disponible. Veuillez vérifiez que la brique \'<strong>{brickName}</strong>\' est correctement installé.',
    adding_process: 'Ajout de \'{{processName}}\'',
    adding_source: 'Ajout de \'{{resourceName}}\'',
    adding_output: 'Ajout d\'un output',
    adding_viewer: 'Ajout d\'un viewer',
    open_node_detail: 'Détail',
    viewer_not_configured: 'Le viewer n\'est pas encore configuré',
    show_view: 'Afficher la vue',
    error: 'Erreur',
    delete_link_interface_error: 'Impossible de supprimer une connexion liée à une interface ou une outerface, veuillez supprimer directement l\'interface ou l\'outerface',
    deleting_process: "Suppression '{{processName}}'",
    deleting_interface: "Suppression de l'interface '{{name}}'",
    deleting_outerface: "Suppression de l'outerface '{{name}}'",
    adding_connection: "Ajout de la connexion",
    deleting_connection: "Suppression de la connexion",
  }
};

const prProtocolI18nEn: FlLangTranslation = {
  pr: {
    type_unavailable_detail: 'The type \'<strong>{{typingName}}</strong>\' of the object is not available. Please check if the brick \'<strong>{{brickName}}</strong>\' is correctly installed.',
    adding_process: 'Adding \'{{processName}}\'',
    adding_source: 'Adding \'{{resourceName}}\'',
    adding_output: 'Adding output',
    adding_viewer: 'Adding viewer',
    open_node_detail: 'Detail',
    viewer_not_configured: 'The viewer is not configured yet',
    show_view: 'Show view',
    error: 'Error',
    delete_link_interface_error: 'Can\'t delete a connection linked to an interface or an outerface, please delete directly the interface or outerface',
    deleting_process: "Deleting '{{processName}}'",
    deleting_interface: "Deleting interface '{{name}}'",
    deleting_outerface: "Deleting outerface '{{name}}'",
    adding_connection: "Adding connection",
    deleting_connection: "Deleting connection",
  }
};

export const prProtocolI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: prProtocolI18nEn,
  [ClSupportedLanguage.fr]: prProtocolI18nFr
};
