import { TeMarkdown } from '@monorepo/te-text-editor';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { HnDocumentation } from '../brick-aggregate/documentation/hn-documentation.entity';

export interface HnMcpDocSummary {
  id: string;
  title: string;
  completePath: string;
  brickName: string | null;
  version: string | null;
  snippet?: string;
}

export interface HnMcpDocContent extends HnMcpDocSummary {
  markdown: string;
}

/**
 * Read-only access to the community documentation for the MCP server.
 *
 * The doc body is stored as a `TeRichText` JSON blob in the `documentation.content`
 * column; every method here converts it to markdown via {@link TeMarkdown} so the
 * output is directly consumable by an LLM.
 */
@Injectable()
export class HnMcpDocService {
  private static readonly SNIPPET_RADIUS = 160;

  constructor(
    @InjectRepository(HnDocumentation)
    private readonly documentationsRepository: Repository<HnDocumentation>
  ) {}

  /**
   * Full-text-ish search over doc title and content.
   *
   * NOTE: the content match runs a `LIKE` on the raw `TeRichText` JSON, so it also
   * matches HTML markup/keys — good enough for v1 recall; the returned snippet is
   * extracted from the markdown-rendered body, not the raw JSON.
   */
  async search(query: string, limit = 10): Promise<HnMcpDocSummary[]> {
    const like = `%${query}%`;
    const docs = await this.baseQuery()
      .where('doc.title LIKE :like', { like })
      .orWhere('doc.content LIKE :like', { like })
      .take(limit)
      .getMany();

    return docs.map((doc) => ({
      ...this.toSummary(doc),
      snippet: this.buildSnippet(doc, query),
    }));
  }

  /**
   * List docs, optionally filtered by (case-insensitive substring of) brick name.
   */
  async list(brickName?: string, limit = 50): Promise<HnMcpDocSummary[]> {
    const qb = this.baseQuery().orderBy('doc.completePath', 'ASC').take(limit);
    if (brickName) {
      qb.where('brick.name LIKE :name', { name: `%${brickName}%` });
    }
    const docs = await qb.getMany();
    return docs.map((doc) => this.toSummary(doc));
  }

  /**
   * Read a single doc rendered as markdown.
   */
  async read(id: string): Promise<HnMcpDocContent | null> {
    const doc = await this.baseQuery().where('doc.id = :id', { id }).getOne();
    if (doc == null) {
      return null;
    }
    return {
      ...this.toSummary(doc),
      markdown: TeMarkdown.fromRichText(doc.getRichText()),
    };
  }

  private baseQuery(): SelectQueryBuilder<HnDocumentation> {
    return this.documentationsRepository
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.folder', 'folder')
      .leftJoinAndSelect('folder.brickMajorVersion', 'brickMajorVersion')
      .leftJoinAndSelect('brickMajorVersion.brick', 'brick');
  }

  private toSummary(doc: HnDocumentation): HnMcpDocSummary {
    const brickMajorVersion = doc.folder?.brickMajorVersion;
    return {
      id: doc.id,
      title: doc.title,
      completePath: doc.completePath,
      brickName: brickMajorVersion?.brick?.name ?? null,
      version: brickMajorVersion?.getStrVersion() ?? null,
    };
  }

  private buildSnippet(doc: HnDocumentation, query: string): string {
    const markdown = TeMarkdown.fromRichText(doc.getRichText());
    const plain = markdown.replace(/\s+/g, ' ').trim();
    const matchIndex = plain.toLowerCase().indexOf(query.toLowerCase());
    if (matchIndex === -1) {
      return plain.slice(0, HnMcpDocService.SNIPPET_RADIUS * 2);
    }
    const start = Math.max(0, matchIndex - HnMcpDocService.SNIPPET_RADIUS);
    const end = Math.min(plain.length, matchIndex + query.length + HnMcpDocService.SNIPPET_RADIUS);
    return `${start > 0 ? '…' : ''}${plain.slice(start, end)}${end < plain.length ? '…' : ''}`;
  }
}
