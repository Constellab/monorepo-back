import {Logger} from '@nestjs/common';
import {BlRichTextI} from '../models/bl-rich-text.class';
import {BlRichTextContent} from '../models/bl-new-rich-text.class';


export class BlQuillMigrator {
  private readonly logger = new Logger(BlQuillMigrator.name);

  private editorJsContent: any;


  constructor(private richText: BlRichTextI) {

    this.editorJsContent = {
      time: new Date().getTime(),
      blocks: [],
      version: '2.28.2'
    };
  }

  public static migrateOptional(richText: any): BlRichTextContent {
    if (richText && richText.ops) {
      return new BlQuillMigrator(richText).migrate();
    }
    return richText;
  }

  public migrate(): any {


    for (let i = 0; i < this.richText.ops.length; i++) {

      try {
        const result = this.getBlockText(i);
        let currentText = result.text;
        i = result.index;


        const paragraphs = currentText.split('\n');
        if (paragraphs.length > 1) {
          // add the first paragraphs
          for (let j = 0; j < paragraphs.length - 1; j++) {
            this.addBlock('paragraph', {
              text: paragraphs[j],
            });
          }

          // the text of the last paragraph is the current text
          currentText = paragraphs[paragraphs.length - 1];
        }

        if (i >= this.richText.ops.length) {
          if (currentText.length > 0)
            this.addBlock('paragraph', {
              text: currentText,
            });
          break;
        }

        const op = this.richText.ops[i];
        // if a text was saved before
        if (currentText.length > 0) {
          // handle header
          if (op.attributes.header) {
            this.addBlock('header', {
              text: currentText,
              level: op.attributes.header.level
            });
          } else if (op.attributes.blockquote) {
            this.addBlock('quote', {
              text: currentText,
              caption: '',
              alignment: 'left'
            });
          } else if (op.attributes.hint) {
            this.addBlock('hint', {
              hintType: op.attributes.hint,
              content: currentText
            });
            // specific case for old hint warning
          } else if (op.attributes.background === '#eec0d6') {
            this.addBlock('hint', {
              hintType: 'warnings',
              content: currentText
            });
          } else if (op.attributes['code-block']) {
            i = this.handleCodeBlock(i, currentText);
          } else if (op.attributes.list) {
            i = this.handleList(i, currentText);
          } else {
            this.addBlock('paragraph', {
              text: currentText,
            });
          }
        }
        if (op.insert.figure) {
          this.addBlock('figure', op.insert.figure);
        } else if (op.insert.video) {
          this.addBlock('video', op.insert.video);
        } else if (op.insert.customFormula) {
          this.addBlock('formula', op.insert.customFormula);
        } else if (op.insert.resource_view) {
          this.addBlock('resourceView', op.insert.resource_view);
        }
      } catch (e) {
        this.logger.error(`Error while migrating quill to editorJs for index ${i}, error : ${e}`);

        throw e;
      }
    }

    return this.editorJsContent;
  }

  private getBlockText(index: number): { text: string, index: number } {
    let text = '';
    while (index < this.richText.ops.length) {
      const op = this.richText.ops[index];

      if (typeof op.insert !== 'string') {
        break;
      }
      // if the op doesn't not have attributes, it is a text and the attributes is
      // set in the next op
      if (!op.attributes) {
        text += op.insert;
        index++;
        continue;
      }

      // special case for inline tools
      if (op.attributes.code) {
        text += `<code>${op.insert}</code>`;
      } else if (op.attributes.bold) {
        text += `<b>${op.insert}</b>`;
      } else if (op.attributes.italic) {
        text += `<i>${op.insert}</i>`;
      } else if (op.attributes.underline) {
        text += `<u>${op.insert}</u>`;
      } else if (op.attributes.strike) {
        text += `<s>${op.insert}</s>`;
      } else if (op.attributes.link) {
        text += `<a href="${op.attributes.link}">${op.insert}</a>`;
      } else if (op.attributes.background) {
        text += op.insert;
      } else {
        break;
      }
      index++;
    }
    return {text: text, index: index};
  }

  private handleCodeBlock(index: number, currentText: string): number {
    while (index < this.richText.ops.length) {

      const op = this.richText.ops[index];
      if (op.attributes && op.attributes['code-block']) {
        currentText += '\n';
      } else {
        if (index + 1 >= this.richText.ops.length) {
          break;
        }

        // if the next op is not code block, this means that the code block is finished
        const nextOp = this.richText.ops[index + 1];
        if (nextOp && (!nextOp.attributes || !nextOp.attributes['code-block'])) {
          break;
        }

        currentText += op.insert;
      }
      index++;

    }

    this.addBlock('code', {
      code: currentText,
      language: 'python'
    });
    return index - 1;
  }

  private handleList(index: number, currentText: string): number {
    const listType = this.richText.ops[index].attributes.list;

    const data: any = {
      style: listType === 'bullet' ? 'unordered' : 'ordered',
      items: [{
        content: currentText,
        items: []
      }]
    };

    index++;

    while (index < this.richText.ops.length) {

      const result = this.getBlockText(index);
      const currentText = result.text;

      const nextOp = this.richText.ops[result.index];
      // if the list is finished
      if (!nextOp || !nextOp.attributes || !nextOp.attributes.list || nextOp.attributes.list !== listType) {
        break;
      }

      index = result.index;
      const currentLevel = nextOp.attributes.indent || 0;

      let levelIndex = 0;
      let items = data.items;
      while (levelIndex < currentLevel) {
        items = items[items.length - 1].items;
        levelIndex++;
      }
      items.push({
        content: currentText,
        items: []
      });

      index++;
    }

    this.addBlock('list', data);
    return index - 1;
  }

  private addBlock(type: string, data: any): void {
    this.editorJsContent.blocks.push({
      id: this.editorJsContent.blocks.length.toString(),
      type: type,
      data: data
    });
  }
}
