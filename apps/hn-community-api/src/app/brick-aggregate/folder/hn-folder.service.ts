import { BlBadRequestException } from '@monorepo/back-core-lib';
import { ClStringHelper } from '@monorepo/core-lib';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository, TreeRepository } from 'typeorm';

import { HnErrorText } from '../../core/model/config/hn-error-text.class';
import { HnBrickMajorVersion } from '../brick-major-version/hn-brick-major-version.entity';
import { HnDocumentation, HnDocumentationSearchDTO } from '../documentation/hn-documentation.entity';
import { HnNode, HnNodeDTO } from './hn-folder.dto';
import { HnFolder } from './hn-folder.entity';

@Injectable()
export class HnFolderService {
  constructor(
    @InjectRepository(HnFolder)
    private foldersRepository: Repository<HnFolder>,
    @InjectRepository(HnFolder)
    private foldersTreeRepository: TreeRepository<HnFolder>
  ) {}

  /**
   * Canonical url segment of a title. This is what actually ends up in the complete path:
   * accents and special characters are stripped, so 'Test' and 'Testé' both give 'test'.
   */
  private static slugify(title: string | null): string {
    return ClStringHelper.generateUrlPathFromString(title ?? '').replace(/[^a-zA-Z0-9-_]/g, '');
  }

  /**
   * Title used to detect strictly identical siblings. Trimmed, spaces collapsed and lower cased
   * so 'Test' and 'test ' are considered the same title, but 'Test' and 'Testé' are not.
   */
  private static normalizedTitle(title: string | null): string {
    return (ClStringHelper.trimAndRemoveDuplicateSpaces(title ?? '') ?? '').toLowerCase();
  }

  /**
   * Compute the path and complete path of a node about to be created, renamed or moved into a
   * parent folder, guaranteeing a unique complete path among its siblings.
   *
   * - A sibling (doc OR folder) with the exact same title is rejected (they would be
   *   indistinguishable in the tree).
   * - Two different titles that collapse to the same slug are allowed: the slug is suffixed with
   *   an incrementing number, so 'Test'/'Testé' give paths 'test'/'test1'. The suffix is checked
   *   against the real complete paths of the siblings, so it never collides with an existing one.
   *
   * @param parentFolder parent folder, with its documentations and folders relations loaded
   * @param excludedNodeId id of the node being renamed or moved, to not compare it with itself
   */
  static resolveNodePath(
    parentFolder: HnFolder,
    title: string | null,
    excludedNodeId?: string
  ): { path: string; completePath: string } {
    const siblings = [...(parentFolder.documentations ?? []), ...(parentFolder.folders ?? [])].filter(
      (node) => node.id !== excludedNodeId
    );

    const normalizedTitle = HnFolderService.normalizedTitle(title);
    if (siblings.some((s) => HnFolderService.normalizedTitle(s.title) === normalizedTitle)) {
      throw new BlBadRequestException(HnErrorText.NODE_TITLE_ALREADY_EXISTS, {
        detailArgs: { title: title ?? '' },
      });
    }

    const parentCompletePath = parentFolder.completePath ?? '';
    const usedCompletePaths = new Set(siblings.map((s) => s.completePath));
    const base = HnFolderService.slugify(title);

    let segment = base;
    let suffix = 1;
    while (usedCompletePaths.has(parentCompletePath + segment + '/')) {
      segment = base + suffix;
      suffix++;
    }

    return { path: segment, completePath: parentCompletePath + segment + '/' };
  }

  /**
   * Same as resolveNodePath but loads the parent folder from its id.
   */
  async resolveNodePathInFolderId(
    parentFolderId: string,
    title: string | null,
    excludedNodeId?: string
  ): Promise<{ path: string; completePath: string }> {
    const parentFolder = await this.findById(parentFolderId);
    if (parentFolder == null) {
      throw new BlBadRequestException('Folder not found', { detailArgs: { id: parentFolderId } });
    }
    return HnFolderService.resolveNodePath(parentFolder, title, excludedNodeId);
  }

  async create(
    createFolderRes: HnNodeDTO,
    entityManager?: EntityManager,
    brickMajorVersion?: HnBrickMajorVersion
  ): Promise<HnFolder> {
    let folder: HnFolder | null = null;
    if (createFolderRes.folderId) {
      folder = await this.foldersRepository.findOne({
        where: { id: createFolderRes.folderId },
        relations: { documentations: true, folders: true },
      });
    }

    const createFolder: HnFolder = new HnFolder();
    createFolder.title = createFolderRes.title;
    createFolder.folder = folder ? folder : null;
    if (folder) {
      const { path, completePath } = HnFolderService.resolveNodePath(folder, createFolderRes.title);
      createFolder.path = path;
      createFolder.completePath = completePath;
    } else {
      // root (main) folder: no parent, no siblings, no path
      createFolder.path = ClStringHelper.generateUrlPathFromString(createFolderRes.title ?? '');
      createFolder.completePath = null;
    }
    if (brickMajorVersion) {
      createFolder.brickMajorVersion = brickMajorVersion;
    } else {
      if (folder == null) {
        throw new BlBadRequestException('Cannot create a folder without a parent or a brick major version');
      }
      createFolder.brickMajorVersion = folder.brickMajorVersion;
    }
    createFolder.order =
      createFolderRes.order != null ? createFolderRes.order : folder ? folder.nextOrder() : 0;

    return entityManager
      ? await entityManager.save(createFolder)
      : await this.foldersRepository.save(createFolder);
  }

  async createMainFolders(
    brickMajorVersion: HnBrickMajorVersion,
    entityManager: EntityManager
  ): Promise<HnFolder> {
    const createMainFolder: HnNodeDTO = new HnNodeDTO();
    createMainFolder.isFolder = true;
    createMainFolder.path = null;
    createMainFolder.title = null;
    createMainFolder.order = 0;
    return await this.create(createMainFolder, entityManager, brickMajorVersion);
  }

  async findAll(): Promise<HnFolder[]> {
    const tree = await this.foldersTreeRepository.findTrees();
    return this.treeToArray(tree[0]);
  }

  async findFolderByBrickMajorVersion(brickMajorVersion: HnBrickMajorVersion): Promise<HnFolder | null> {
    return this.foldersRepository.findOne({
      where: { brickMajorVersion: { id: brickMajorVersion.id }, completePath: IsNull() },
      relations: { documentations: true },
    });
  }

  async findBrickDocsNodesTree(mainFolder: HnFolder): Promise<HnNode> {
    const brickDocs: HnFolder = await this.foldersTreeRepository.findDescendantsTree(mainFolder, {
      relations: ['documentations', 'folders', 'folder'],
    });
    return this.createTree(brickDocs);
  }

  async findAllDocsByBrick(mainFolder: HnFolder): Promise<HnDocumentation[]> {
    const brickDocs: HnFolder = await this.foldersTreeRepository.findDescendantsTree(mainFolder, {
      relations: ['documentations', 'folders', 'folder'],
    });
    return this.collectDocsFromFolder(brickDocs);
  }

  private static readonly MAX_RECURSION_DEPTH = 50;

  private collectDocsFromFolder(folder: HnFolder, depth: number = 0): HnDocumentation[] {
    if (depth > HnFolderService.MAX_RECURSION_DEPTH) return [];
    let docs: HnDocumentation[] = [];
    docs = docs.concat(folder.documentations);
    for (const f of folder.folders) {
      docs = docs.concat(this.collectDocsFromFolder(f, depth + 1));
    }
    return docs;
  }

  async findFirstDocNode(brickMajorVersion: HnBrickMajorVersion): Promise<HnNode | null> {
    const mainFolder = await this.findFolderByBrickMajorVersion(brickMajorVersion);
    if (mainFolder == null) {
      throw new BlBadRequestException('Main folder not found');
    }
    const tree: HnNode = await this.findBrickDocsNodesTree(mainFolder);
    return this.findFirstDocNodeInTree(tree);
  }

  private findFirstDocNodeInTree(tree: HnNode, depth: number = 0): HnNode | null {
    if (depth > HnFolderService.MAX_RECURSION_DEPTH) return null;
    let node: HnNode | null = null;
    for (const c of tree.children ?? []) {
      if (c.children) {
        node = this.findFirstDocNodeInTree(c, depth + 1);
        if (node) break;
      } else {
        node = c;
        break;
      }
    }
    return node;
  }

  private createTree(folder: HnFolder, depth: number = 0): HnNode {
    const currentChild: HnNode[] = [];

    const currentParent: HnNode = new HnNode(
      folder.id,
      folder.title ?? '',
      folder.path ?? '',
      folder.completePath ?? '',
      folder.order,
      folder.folder ? folder.folder.id : undefined,
      []
    );

    if (depth > HnFolderService.MAX_RECURSION_DEPTH) return currentParent;

    if (folder.documentations != null) {
      folder.documentations.forEach((doc) => {
        currentChild.push(
          new HnNode(doc.id, doc.title, doc.path, doc.completePath, doc.order, folder ? folder.id : undefined)
        );
      });
    }

    if (folder.folders != null) {
      folder.folders.forEach((f) => {
        currentChild.push(this.createTree(f, depth + 1));
      });
    }

    currentParent.children = currentChild;
    currentParent.children.sort((a, b) => a.order - b.order);

    return currentParent;
  }

  private treeToArray(folder: HnFolder, depth: number = 0): HnFolder[] {
    if (depth > HnFolderService.MAX_RECURSION_DEPTH) return [folder];
    let array: HnFolder[] = [folder];
    let arrayChildFolder: HnFolder[] = [];

    folder.folders.sort((a, b) => a.order - b.order);
    folder.folders.forEach((f) => {
      arrayChildFolder = arrayChildFolder.concat(this.treeToArray(f, depth + 1));
    });
    array = array.concat(arrayChildFolder);
    return array;
  }

  findById(id: string): Promise<HnFolder | null> {
    return this.foldersRepository.findOne({
      where: { id: id },
      relations: { documentations: true, folders: true },
    });
  }

  async findFoldersByParentId(id: string): Promise<HnFolder[]> {
    const parent = await this.findById(id);
    if (parent == null) {
      throw new BlBadRequestException('Folder not found');
    }

    return parent.folders;
  }

  async findDocsByParentId(id: string): Promise<HnDocumentation[]> {
    const parent = await this.findById(id);
    if (parent == null) {
      throw new BlBadRequestException('Folder not found');
    }

    return parent.documentations;
  }

  async save(folder: HnFolder): Promise<HnFolder> {
    return this.foldersRepository.save(folder);
  }

  async findWithRelationById(id: string): Promise<HnFolder | null> {
    return this.foldersRepository.findOne({
      where: { id: id },
      relations: { folder: true, folders: true, documentations: true },
    });
  }

  async remove(id: string): Promise<void> {
    const folderToDelete = await this.foldersRepository.findOne({
      where: { id: id },
      relations: {
        documentations: true,
        folders: true,
      },
    });
    if (folderToDelete == null) {
      throw new BlBadRequestException('Folder not found');
    }
    if (folderToDelete.documentations.length <= 0 && folderToDelete.folders.length <= 0) {
      await this.foldersRepository.delete(id);
    } else {
      throw new BlBadRequestException("Folders with children can't be deleted.");
    }
  }

  async getDocsByBrickNameMajor(
    brickMajorVersion: HnBrickMajorVersion,
    major: string,
    brickName: string
  ): Promise<HnDocumentationSearchDTO[]> {
    const mainFolder = await this.findFolderByBrickMajorVersion(brickMajorVersion);
    if (mainFolder == null) {
      throw new BlBadRequestException('Main folder not found');
    }
    const brickDocs: HnFolder = await this.foldersTreeRepository.findDescendantsTree(mainFolder, {
      relations: ['documentations', 'folders', 'folder'],
    });

    return this.getDocsByFolder(brickDocs, major, brickName);
  }

  private getDocsByFolder(
    folder: HnFolder,
    major: string,
    brickName: string,
    depth: number = 0
  ): HnDocumentationSearchDTO[] {
    if (depth > HnFolderService.MAX_RECURSION_DEPTH) return [];
    const documentations: HnDocumentationSearchDTO[] = [];

    for (const doc of folder.documentations) {
      documentations.push({
        name: doc.title,
        id: doc.id,
        completePath: doc.completePath,
        major: major,
        brickName: brickName,
        isTechnical: false,
      });
    }

    if (folder.folders) {
      for (const fol of folder.folders) {
        this.getDocsByFolder(fol, major, brickName, depth + 1).forEach((d) => {
          documentations.push(d);
        });
      }
    }
    return documentations;
  }
}
