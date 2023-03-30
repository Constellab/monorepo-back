import BlockBlot from 'parchment/dist/src/blot/block';
import EmbedBlot from 'parchment/dist/src/blot/embed';

/**
 * File to export different quill objects
 */
// export const Parchment = Quill.import('parchment');
// export const ParchmentClass = Parchment.Attributor.Class as typeof ClassAttributor;
// export const ParchmentAttribute = Parchment.Attributor.Attribute;
export const FlQuillBlock = null as typeof BlockBlot; //Quill.import('blots/block') as typeof BlockBlot;
// export const FlQuillBlock: Promise<typeof BlockBlot> = import('quill').then((quillImport) => {
//   return quillImport.default.import('blots/block') as typeof BlockBlot;
// });

// export const Container = Quill.import('blots/container') as typeof ContainerBlot;
export const FlQuillEmbed = null as typeof EmbedBlot;
//export const FlQuillEmbed = Quill.import('blots/block/embed') as typeof EmbedBlot;
export const FlQuillHeader = null as typeof BlockBlot; //Quill.import('formats/header') as typeof BlockBlot;
export const FlQuillLink = null as typeof BlockBlot; //Quill.import('formats/link') as typeof BlockBlot;
// export const Break = Quill.import('blots/break') as typeof Parchment.Container;
// export const Cursor = Quill.import('blots/cursor') as typeof Parchment.Container;
// export const CodeBlock = Quill.import('formats/code-block') as typeof BlockBlot;
// export const TextBlot = Quill.import('blots/text') as typeof Parchment.Container;

