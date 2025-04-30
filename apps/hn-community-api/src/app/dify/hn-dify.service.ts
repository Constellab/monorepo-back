import { Injectable } from '@nestjs/common';
import { HnDocumentationService } from '../brick-aggregate/documentation/hn-documentation.service';
import { HnDifyCreateDocumentDto, HnDifyCreateDocumentOptionsDto, HnDifyDocument } from './hn-dify.dto';
import { HnAgentService } from '../agent-aggregate/agent/hn-agent.service';
import { HnStoryService } from '../story/hn-story.service';
import { HnEntityType } from '../core/model/entities/hn-entity-type.enum';
import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';
import { HnCoreConfigService } from '../core/modules/core-config/hn-core-config.service';
import { BlBadRequestException, BlExternalApiService } from '@monorepo/back-core-lib';
import { lastValueFrom } from 'rxjs';
import { HnFrontService } from '../core/service/hn-front.service';
import * as FormData from 'form-data';
import { Readable } from 'stream';
import { HttpService } from '@nestjs/axios';

import { HnBrickMajorVersionService } from '../brick-aggregate/brick-major-version/hn-brick-major-version.service';
import { ClStringHelper } from '@monorepo/core-lib';
import { AxiosError } from 'axios';

@Injectable()
export class HnDifyService {
  difyApiUrl = 'https://api.dify.ai/v1/datasets';

  constructor(
    private readonly documentationService: HnDocumentationService,
    private readonly brickMajorService: HnBrickMajorVersionService,
    private readonly agentService: HnAgentService,
    private readonly storyService: HnStoryService,
    private readonly coreConfigService: HnCoreConfigService,
    private readonly externalApiService: BlExternalApiService,
    private readonly frontService: HnFrontService,
    private readonly httpService: HttpService
  ) {}

  async getKnowledgeBaseList(): Promise<any> {
    return await lastValueFrom(
      this.externalApiService.get(this.difyApiUrl, null, {
        headers: this.getDifyHeaders(),
      })
    ).catch((error) => {
      throw new BlBadRequestException('Error while getting knowledge base list');
    });
  }

  async createDocuments(
    knowledgeBaseId: string,
    entityType: HnEntityType,
    entityId: string = null,
    options: HnDifyCreateDocumentOptionsDto = null
  ): Promise<boolean> {
    if (entityType === HnEntityType.BRICK && entityId)
      return await this.createBricksDocDocuments(knowledgeBaseId, entityId, options);
    else if (entityType == HnEntityType.STORY)
      return await this.createStoriesDocuments(knowledgeBaseId, options);
    return false;
  }

  async createStoriesDocuments(
    knowledgeBaseId: string,
    options: HnDifyCreateDocumentOptionsDto = null
  ): Promise<boolean> {
    const stories = await this.storyService.findAllPublished();
    for (const story of stories) {
      const document = await this.createStoryDocument({
        entityType: HnEntityType.STORY,
        entityId: story.id,
        knowledgeBaseId: knowledgeBaseId,
        options: options,
      });
      await this.sendDocumentToDify(document, knowledgeBaseId);
    }
    return true;
  }

  async createBricksDocDocuments(
    knowledgeBaseId: string,
    brickId: string,
    options: HnDifyCreateDocumentOptionsDto = null
  ): Promise<boolean> {
    const brickMajorVersion = await this.brickMajorService.getLatestBrickMajorVersion(brickId);
    const docs = await this.documentationService.getDocsByBrickVersion(brickMajorVersion.id);
    for (const doc of docs) {
      const document = await this.createDocumentationDocument({
        entityType: HnEntityType.DOC,
        entityId: doc.id,
        knowledgeBaseId: knowledgeBaseId,
        options: options,
      });
      await this.sendDocumentToDify(document, knowledgeBaseId);
    }
    return true;
  }

  async createDocument(dto: HnDifyCreateDocumentDto): Promise<any> {
    let document: HnDifyDocument;
    switch (dto.entityType) {
      case HnEntityType.AGENT:
        document = await this.createAgentDocument(dto);
        break;
      case HnEntityType.APP:
        document = await this.createAppDocument(dto);
        break;
      case HnEntityType.DOC:
        document = await this.createDocumentationDocument(dto);
        break;
      case HnEntityType.STORY:
        document = await this.createStoryDocument(dto);
        break;
      default:
        throw new Error('Invalid entity type');
    }
    return this.sendDocumentToDify(document, dto.knowledgeBaseId);
  }

  async createAgentDocument(dto: HnDifyCreateDocumentDto): Promise<HnDifyDocument> {
    return null;
  }

  async createAppDocument(dto: HnDifyCreateDocumentDto): Promise<HnDifyDocument> {
    return null;
  }

  async createDocumentationDocument(dto: HnDifyCreateDocumentDto): Promise<HnDifyDocument> {
    const documentation = await this.documentationService.findById(dto.entityId);
    const brickMajorVersion = documentation.folder.brickMajorVersion;
    const brick = documentation.folder.brickMajorVersion.brick;
    if (!documentation) {
      throw new Error('Documentation not found');
    }
    const title = `${documentation.title} - ${brick.name}`;
    const docUrl = this.frontService.getBrickDocUrl(
      brick.name,
      brickMajorVersion.getStrVersion(),
      documentation.id,
      documentation.completePath
    );
    const text = this.getDocumentationDocumentText(documentation, docUrl);
    return this.createDifyDocument(title, docUrl, text, dto.options);
  }

  async createStoryDocument(dto: HnDifyCreateDocumentDto): Promise<HnDifyDocument> {
    const story = await this.storyService.findById(dto.entityId);
    if (!story) {
      throw new Error('Story not found');
    }
    const title = `${story.title}`;
    const storyUrl = this.frontService.getStoryUrl(story.id, ClStringHelper.getCleanUrlPath(story.title));
    const markdown = this.storyService.getStoryMarkdown(story, storyUrl);
    return this.createDifyDocument(title, storyUrl, markdown, dto.options);
  }

  private getDocumentationDocumentText(documentation: HnDocumentation, docUrl: string): string {
    const text = documentation
      .getRichText()
      .toMarkdown(`${this.coreConfigService.getApiUrl()}documentation/${documentation.id}/image`, docUrl);

    return `# ${documentation.title}\n\n${text}`;
  }

  private createDifyDocument(
    title: string,
    url: string,
    content: string,
    options: HnDifyCreateDocumentOptionsDto
  ): HnDifyDocument {
    return {
      data: {
        indexing_technique: options?.indexingTechnique ?? 'high_quality',
        doc_form: 'text_model',
        doc_type: 'web_page',
        doc_metadata: {
          url: url,
          title: title,
          language: 'English',
        },
        doc_language: 'English',
        process_rule: {
          mode: 'automatic',
          rules: {
            pre_processing_rules: [
              { id: 'remove_extra_spaces', enabled: false },
              { id: 'remove_urls_emails', enabled: false },
            ],
            segmentation: {
              separator: options?.separator ?? '\n\n',
              max_tokens: options?.maxTokens ?? 500,
            },
          },
        },
      },
      file_string: content,
    } as HnDifyDocument;
  }

  private async sendDocumentToDify(document: HnDifyDocument, datasetId: string): Promise<any> {
    const markdownBuffer = Buffer.from(document.file_string, 'utf-8');
    const stream = Readable.from(markdownBuffer);

    const formData = new FormData();
    formData.append('file', stream, {
      filename: document.data.doc_metadata.title + '.md',
      contentType: 'text/md',
    });
    formData.append('data', JSON.stringify(document.data));
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.difyApiUrl}/${datasetId}/document/create-by-file`,
        formData,
        {
          headers: this.getDifyHeaders(formData.getHeaders()),
        }
      );
      return response.data;
    } catch (e: AxiosError | any) {
      const error: string = ((e as AxiosError).response?.data as any)?.message ?? e.message;
      throw new Error(`Error while sending document '${document.data.doc_metadata.title}' to Dify: ${error}`);
    }
  }

  private getDifyHeaders(headers: FormData.Headers = null): any {
    return {
      ...headers,
      Authorization: `Bearer ${this.coreConfigService.getDifyApiKey()}`,
    };
  }
}
