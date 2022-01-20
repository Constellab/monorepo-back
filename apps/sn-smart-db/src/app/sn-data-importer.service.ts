import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import {SnCsvImporter, SnDocument} from './model/sn-document.class';
import {SnAppService} from './sn-app.service';

@Injectable()
export class SnDataImporterService {

  private readonly logger = new Logger(SnDataImporterService.name);

  private readonly SEPARATOR = ';';

  constructor(private appService: SnAppService) {
  }

  public async uploadDataFromFile(file: any): Promise<SnDocument[]> {
    const data: SnCsvImporter[] = this.readDataFromCsv(file);

    const documents: SnDocument[] = this.convertDataToDocument(data);

    for (const document of documents) {
      await this.appService.createDocument(document);
    }

    return documents;
  }

  public readDataFromCsv(file: any): SnCsvImporter[] {
    if (file.mimetype !== 'text/csv') {
      throw new BadRequestException('Only supporting csv files');
    }

    const content = file.buffer.toString();

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
          title: d.title,
          source: d.source,
          authors: d.authors,
          doi: d.doi,
          date: d.date,
          content: d.sentence,
          urlPath: d.urlPath,
          sentences: []
        };
      }

      const doc: SnDocument = documents[d.doi];

      doc.sentences.push({
        subject: this.convertColumnToArray(d.subject, 'subject', i),
        verb: d.verb,
        object: this.convertColumnToArray(d.object, 'object', i),
        context: this.convertColumnToArray(d.context, 'context', i),
        type: this.convertColumnToArray(d.type, 'type', i) as any,
        sentence: d.sentence,
        humanValidated: false
      });

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
