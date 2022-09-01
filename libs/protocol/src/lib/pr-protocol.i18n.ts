import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';
import {ClSupportedLanguage} from '@monorepo/core-lib';
/* eslint-disable max-len */

/**
 * Translation file for the Spreadsheet module
 */
const prProtocolI18nFr: FlLangTranslation = {
  pr: {
    type_unavailable_detail: 'Le type \'<strong>{typingName}</strong>\' de l\'objet n\'est pas disponible. Veuillez vérifiez que la brique \'<strong>{brickName}</strong>\' est correctement installé.',
    adding_process: 'Ajout de \'{{name}}\'',
    adding_source: 'Ajout de \'{{name}}\'',
    adding_output: 'Ajout d\'un output',
    open_node_detail: 'Détail'
  }
};

const prProtocolI18nEn: FlLangTranslation = {
  pr: {
    type_unavailable_detail: 'The type \'<strong>{{typingName}}</strong>\' of the object is not available. Please check if the brick \'<strong>{{brickName}}</strong>\' is correctly installed.',
    adding_process: 'Adding \'{{name}}\'',
    adding_source: 'Adding \'{{name}}\'',
    adding_output: 'Adding output',
    open_node_detail: 'Detail'
  }
};

export const prProtocolI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: prProtocolI18nEn,
  [ClSupportedLanguage.fr]: prProtocolI18nFr
};
