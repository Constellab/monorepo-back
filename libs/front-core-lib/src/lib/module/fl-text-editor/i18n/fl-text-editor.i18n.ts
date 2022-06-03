import {ClSupportedLanguage} from '@monorepo/core-lib';
import {FlLangTranslation, FlTranslateObject} from '@monorepo/front-core-lib';


/**
 * Translation file for the Spreadsheet module
 */
const flTextEditorI18nFr: FlLangTranslation = {
  flTextEditor: {
    title: 'Titre',
    caption: 'Légende',
    ok: 'Ok',
    hint_classic: 'Aide',
    hint_warning: 'Warning',
    hint_scientific: 'Info scientifique',
    move_block: 'Glisser pour déplacer',
    url: 'Url',
    add_a_video: 'Ajouter une vidéo youtube',
    video_url_error: 'L\'url de la vidéo youtube est invalide',
    not_youtube_link_error: 'Ce n\'est pas un lien de vidéo youtube',
  }
};

const flTextEditorI18nEn: FlLangTranslation = {
  flTextEditor: {
    title: 'Title',
    caption: 'Caption',
    ok: 'Ok',
    hint_classic: 'Hint',
    hint_warning: 'Warning',
    hint_scientific: 'Scientific info',
    move_block: 'Drag to move',
    url: 'Url',
    add_a_video: 'Add a youtube video',
    video_url_error: 'Invalid youtube video url',
    not_youtube_link_error: 'This is not a youtube video url',

  }
};

export const flTextEditorI18n: FlTranslateObject = {
  [ClSupportedLanguage.en]: flTextEditorI18nEn,
  [ClSupportedLanguage.fr]: flTextEditorI18nFr
};
