import { BlBadRequestException } from '@monorepo/back-core-lib';

import { HnErrorText } from '../../core/model/config/hn-error-text.class';
import { HnDocumentation } from '../documentation/hn-documentation.entity';
import { HnFolder } from './hn-folder.entity';
import { HnFolderService } from './hn-folder.service';

/**
 * Unit test of the sibling path resolution. It is a static method with no dependency,
 * so no NestJS module and no DB are needed.
 */
describe('HnFolderService.resolveNodePath', () => {
  /**
   * Build a parent folder holding the given sibling docs and sub folders.
   * Only id, title and completePath are set: those are the only fields the resolution reads.
   * Each sibling completePath is the parent completePath followed by the given segment, matching
   * what the service persists. Ids are predictable ('doc-0', 'folder-0', ...) so a test can
   * exclude a sibling (rename case).
   */
  function buildParent(
    parentCompletePath: string | null,
    docs: { title: string; segment: string }[],
    folders: { title: string; segment: string }[] = []
  ): HnFolder {
    const parent = new HnFolder();
    parent.completePath = parentCompletePath;
    parent.documentations = docs.map((d, i) => {
      const doc = new HnDocumentation();
      doc.id = `doc-${i}`;
      doc.title = d.title;
      doc.completePath = (parentCompletePath ?? '') + d.segment + '/';
      return doc;
    });
    parent.folders = folders.map((f, i) => {
      const folder = new HnFolder();
      folder.id = `folder-${i}`;
      folder.title = f.title;
      folder.completePath = (parentCompletePath ?? '') + f.segment + '/';
      return folder;
    });
    return parent;
  }

  /**
   * Assert the title is refused in this parent folder, with the exact translated exception
   * the front relies on to display the message (and not just any error).
   */
  function expectRejected(parent: HnFolder, title: string, excludedNodeId?: string): void {
    expect(() => HnFolderService.resolveNodePath(parent, title, excludedNodeId)).toThrow(
      new BlBadRequestException(HnErrorText.NODE_TITLE_ALREADY_EXISTS, { detailArgs: { title } })
    );
  }

  it('returns the base slug when no sibling uses it', () => {
    const parent = buildParent(null, [{ title: 'Getting Started', segment: 'getting-started' }]);
    expect(HnFolderService.resolveNodePath(parent, 'Installation')).toEqual({
      path: 'installation',
      completePath: 'installation/',
    });
  });

  it('rejects a strictly identical title (same doc)', () => {
    expectRejected(buildParent(null, [{ title: 'Installation', segment: 'installation' }]), 'Installation');
  });

  it('rejects a strictly identical title (sibling folder)', () => {
    expectRejected(
      buildParent(null, [], [{ title: 'Installation', segment: 'installation' }]),
      'Installation'
    );
  });

  it('rejects titles that only differ by case or spacing', () => {
    const parent = buildParent(null, [{ title: 'Getting Started', segment: 'getting-started' }]);
    expectRejected(parent, 'getting started');
    expectRejected(parent, '  Getting   Started  ');
  });

  it('suffixes the path when two different titles collapse to the same slug', () => {
    // 'Test' already exists, 'Testé' is a different title but its slug also strips to 'test'
    const parent = buildParent(null, [{ title: 'Test', segment: 'test' }]);
    expect(HnFolderService.resolveNodePath(parent, 'Testé')).toEqual({
      path: 'test1',
      completePath: 'test1/',
    });
  });

  it('increments the suffix until the path is free', () => {
    const parent = buildParent(null, [
      { title: 'Test', segment: 'test' },
      { title: 'Testè', segment: 'test1' },
    ]);
    expect(HnFolderService.resolveNodePath(parent, 'Testé')).toEqual({
      path: 'test2',
      completePath: 'test2/',
    });
  });

  it('also avoids collision with a sibling folder slug', () => {
    const parent = buildParent(null, [], [{ title: 'Test', segment: 'test' }]);
    expect(HnFolderService.resolveNodePath(parent, 'Testé').path).toBe('test1');
  });

  it('keeps the parent complete path as a prefix', () => {
    const parent = buildParent('guide/', [{ title: 'Test', segment: 'test' }]);
    expect(HnFolderService.resolveNodePath(parent, 'Testé')).toEqual({
      path: 'test1',
      completePath: 'guide/test1/',
    });
  });

  it('ignores the renamed node itself', () => {
    const parent = buildParent(null, [{ title: 'Installation', segment: 'installation' }]);
    expect(HnFolderService.resolveNodePath(parent, 'Installation', 'doc-0')).toEqual({
      path: 'installation',
      completePath: 'installation/',
    });
  });

  it('supports a parent whose relations are not loaded', () => {
    expect(HnFolderService.resolveNodePath(new HnFolder(), 'Installation')).toEqual({
      path: 'installation',
      completePath: 'installation/',
    });
  });
});
