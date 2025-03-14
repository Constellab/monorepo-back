import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';

export class HnDifyCreateDocumentDto {
  entityType: HnEntityType;
  entityId: string;
  knowledgeBaseId: string;
  options: HnDifyCreateDocumentOptionsDto;
}

export interface HnDifyCreateDocumentOptionsDto {
  separator: string;
  maxTokens: number;
}

export interface HnDifyDocument {
  data: HnDifyDocumentData;
  file_string: string;
}

export interface HnDifyDocumentData {
  indexing_technique: 'high_quality' | 'economy';
  doc_form: 'text_model' | 'hierarchical_model' | 'qa_model';
  doc_type: string;
  doc_metadata: Record<string, string>;
  doc_language: string;
  process_rule: any;
}
