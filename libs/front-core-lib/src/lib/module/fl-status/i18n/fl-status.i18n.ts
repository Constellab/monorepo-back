import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';

/**
 * Translation file for the status module
 */
const flStatusFr: FlLangTranslation = {
  flStatus: {
    success: 'Succès',
    error: 'Erreur',
    warning: 'Warning',
    info: 'Info',
    running: 'En cours',
    archived: 'Archivé',
    draft: 'Brouillon',
    stopped: 'Arrêté',
    critical: 'Critique',
    debug: 'Debug'
  }
};

const flStatusEn: FlLangTranslation = {
  flStatus: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    running: 'Running',
    archived: 'Archived',
    draft: 'Draft',
    stopped: 'Stopped',
    critical: 'Critical',
    debug: 'Debug'
  }
};

export const flStatusI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flStatusEn,
  [ClSupportedLanguage.fr]: flStatusFr
};
