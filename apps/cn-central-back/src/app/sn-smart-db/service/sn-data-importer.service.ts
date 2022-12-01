import {Injectable, Logger} from '@nestjs/common';
import {
  SnDocument,
  SnDocumentSentence,
  SnEffect,
  SnFileImportContent,
  SnSmartDbExport,
  SnSmartDbScriptDoc,
  SnSmartDbScriptResult
} from '../model/sn-document.class';
import {BlBadRequestException, BlFile} from '@monorepo/back-core-lib';

@Injectable()
export class SnDataImporterService {

  private readonly logger = new Logger(SnDataImporterService.name);


  constructor() {
  }

  public importDataFromFile(file: BlFile): SnDocument[] {
    const data: SnFileImportContent = this.readDataFromJsonFile(file);

    let documents: SnDocument[];

    // if this is a database export, the format of document is already ok
    if (data.type === 'export') {
      documents = data.fileContent.documents;
    } else {
      // if the data comes from the python script, convert the data to document before
      documents = this.convertDataToDocument(data.fileContent.data);
    }

    return documents;
  }

  public readDataFromJsonFile(file: BlFile): SnFileImportContent {
    if (file.mimetype !== 'application/json') {
      throw new BlBadRequestException('Only supporting json files');
    }

    const content = file.buffer.toString('utf-8');
    const json: any = JSON.parse(content);

    // quickly check if the json is SnFileImportContent
    if (json.version != null) {
      const data: SnSmartDbExport = json;
      if (typeof data.version !== 'number' || !Array.isArray(data.documents)) {
        throw new BlBadRequestException('Wrong json format');
      }
      return {
        type: 'export', fileContent: data
      };
    } else {
      const data: SnSmartDbScriptResult = json;
      if (!Array.isArray(data.data)) {
        throw new BlBadRequestException('Wrong json format');
      }

      return {
        type: 'script', fileContent: data
      };
    }
  }


  private convertDataToDocument(data: SnSmartDbScriptDoc[]): SnDocument[] {
    // list of the document with key = url_path
    const documents: Record<string, SnDocument> = {};

    for (let i = 0; i < data.length; i++) {
      const d = data[i];

      // create the document if it doesn't exist
      if (documents[d.url_path] == null) {
        documents[d.url_path] = {
          id: undefined,
          title: d.title,
          source: d.source,
          authors: d.authors?.split(', ') ?? [],
          doi: d.doi,
          date: d.date,
          content: d.text,
          urlPath: d.url_path,
          sentences: []
        };
      }

      const doc: SnDocument = documents[d.url_path];

      if (d.object.length === 0) {
        this.logger.warn(`The sentences '${d.original_sentence}', of doc '${d.title}' has an empty object`);
        continue;
      }
      // create and add the sentence
      const sentence: SnDocumentSentence = {
        sentence: d.original_sentence,
        context: d.context,
        parts: []
      };
      doc.sentences.push(sentence);


      for (let i = 0; i < d.object.length; i++) {
        sentence.parts.push({
          subject: d.subject,
          verb: d.verb,
          object: d.object[i],
          type: d.type[i] as SnEffect,
          humanValidated: false,
        });
      }
    }

    return Object.values(documents);
  }
}
