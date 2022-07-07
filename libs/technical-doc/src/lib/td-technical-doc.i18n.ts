import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';
import {ClSupportedLanguage} from '@monorepo/core-lib';

/**
 * Translation file for the Spreadsheet module
 */
const tdTechnicalDocI18nFr: FlLangTranslation = {
  td: {
    input: 'Entrée',
    output: 'Sortie',
    configuration: 'Configuration',
    type: 'Type',
    allowed_values: 'Valeurs autorisées',
    default_value: 'Valeur par défaut',
    parent: 'Parent',
    status: 'Etat',
    supported_extensions: 'Extensions supportées',
    param_set: 'Liste',
    max_occurrence_number: 'Nombre maximum d\'occurrences',
    deprecated: 'Obsolète',
    deprecated_since: 'Obsolète depuis la version',
    skippable: 'Ignorable',
    optional: 'Optionnel',
    constant: 'Constant',
    optional_tooltip: 'La tâche sera exécutée même si cette entrée n\'est pas connectée',
    skippable_tooltip: 'La tâche sera exécutée même si cette entrée a été connectée et que la valeur n\'a pas encore été fournie',
    constant_tooltip: 'Cette sortie ne créera pas de nouvelle ressource mais fera référence à une ressource existante',
    advanced_parameter: 'Parametre avancé'
  }
};

const tdTechnicalDocI18nEn: FlLangTranslation = {
  td: {
    input: 'Input',
    output: 'Output',
    configuration: 'Configuration',
    type: 'Type',
    allowed_values: 'Allowed values',
    default_value: 'Default value',
    parent: 'Parent',
    status: 'Status',
    supported_extensions: 'Supported Extentions',
    param_set: 'List',
    max_occurrence_number: 'Maximum occurrences number',
    deprecated: 'Deprecated',
    deprecated_since: 'Deprecated since the version',
    skippable: 'Skippable',
    optional: 'Optional',
    constant: 'Constant',
    optional_tooltip: 'The task will be runned even if this input is not connected',
    skippable_tooltip: 'The task will be runned even if this input was connected and the value not provided yet',
    constant_tooltip: 'This output will not create a new resource but reference an existing resource',
    advanced_parameter: 'Advanced parameter'
  }
};

export const tdTechnicalDocI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: tdTechnicalDocI18nEn,
  [ClSupportedLanguage.fr]: tdTechnicalDocI18nFr
};
