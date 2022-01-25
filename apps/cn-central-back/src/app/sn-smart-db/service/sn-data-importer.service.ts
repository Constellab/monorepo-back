import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {SnCsvImporter, SnDocument, SnDocumentSentence, SnEffect} from '../model/sn-document.class';
import {SnDocElasticsearchService} from './sn-doc-elasticsearch.service';

@Injectable()
export class SnDataImporterService {

  private readonly logger = new Logger(SnDataImporterService.name);

  private readonly SEPARATOR = ';';

  constructor(private docElasticsearchService: SnDocElasticsearchService) {
  }

  public async importDataFromFile(file: any): Promise<SnDocument[]> {
    const data: SnCsvImporter[] = this.readDataFromCsv(file);

    const documents: SnDocument[] = this.convertDataToDocument(data);

    for (const document of documents) {
      await this.docElasticsearchService.createDocument(document);
    }

    return documents;
  }

  public readDataFromCsv(file: any): SnCsvImporter[] {
    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException('Only supporting csv files');
    }

    const content = file.buffer.toString('utf-8');

    const rows: string[] = content.split('\r\n');
    rows.shift(); // remove the first line with false column name
    const headers = rows.shift().split(this.SEPARATOR);

    const convertedElements: SnCsvImporter[] = [];

    for (const row of rows) {
      const columns = row.split(this.SEPARATOR);
      const obj: any = {};

      // loop through header to build object column by column
      for (let i = 0; i < headers.length; i++) {
        obj[headers[i]] = columns[i];
      }

      convertedElements.push(obj);
    }

    return convertedElements;
  }


  private convertDataToDocument(data: SnCsvImporter[]): SnDocument[] {
    // list of the document with key = doi
    const documents: Record<string, SnDocument> = {};

    for (let i = 0; i < data.length; i++) {
      const d = data[i];

      // create the document if it doesn't exist
      if (documents[d.doi] == null) {
        documents[d.doi] = {
          id: null,
          title: d.title,
          source: d.source,
          authors: d.authors,
          doi: d.doi,
          date: d.date,
          content: d.sentence,
          urlPath: d.url_path,
          sentences: []
        };
      }

      const doc: SnDocument = documents[d.doi];

      // create and add the sentence
      const sentence: SnDocumentSentence = {
        sentence: d.sentence,
        context: this.convertColumnToArray(d.context, 'context', i),
        parts: []
      };
      doc.sentences.push(sentence);

      // create and add the sentences parts
      const objects: string[] = this.convertColumnToArray(d.object, 'object', i);

      if (objects.length === 0) {
        this.logger.warn(`Warning while parsing the column 'object' of row ${i + 3}, empty object`);
      }

      const subjects: string[] = this.convertColumnToArray(d.subject, 'subject', i);
      const type: SnEffect[] = this.convertColumnToArray(d.type, 'type', i) as any;


      for (let i = 0; i < objects.length; i++) {
        sentence.parts.push({
          subject: subjects,
          verb: d.verb,
          object: objects[i],
          type: type[i],
          humanValidated: false,
        });
      }
    }

    return Object.values(documents);
  }

  private convertColumnToArray(columnValue: string, columnName: string, index: number): string[] {
    try {
      if (!columnValue) return [];
      return JSON.parse(columnValue.replace(/'/g, '"'));
    } catch (e) {
      const error = `Error while parsing the column '${columnName}' of row ${index + 3}, value: '${columnValue}'`;
      this.logger.error(error);
      this.logger.error(e.stack);
      throw new BadRequestException(error);
    }

  }
}
