import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, Repository, TreeRepository} from 'typeorm';
import {HnFolder} from './hn-folder.entity';
import {HnDocumentation} from '../documentation/hn-documentation.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnUser} from '../users/hn-user.entity';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';
import {HnBrickMajorVersion} from '../brick-major-version/hn-brick-major-version.entity';
import {HnNode, HnNodeDTO} from './hn-folder.dto';

@Injectable()
export class HnFolderService {
  constructor(
    @InjectRepository(HnFolder)
    private foldersRepository: Repository<HnFolder>,
    @InjectRepository(HnFolder)
    private foldersTreeRepository: TreeRepository<HnFolder>,
    private documentationService: HnDocumentationService,
  ) {
  }

  private static generatePathWithTitle(title: string): string {
    if (title != null) {
      const path: string = title.toLowerCase().trim();
      const re = / /gi;
      return path.replace(re, "-");
    }
    return title;
  }

  async create(createFolderRes: HnNodeDTO, entityManager?: EntityManager, brickMajorVersion?: HnBrickMajorVersion): Promise<HnFolder> {

    createFolderRes.path = HnFolderService.generatePathWithTitle(createFolderRes.title);

    let folder: HnFolder;
    if (createFolderRes.folderId) {
      folder = await this.foldersRepository.findOne(createFolderRes.folderId, {relations: ['documentations', 'folders']});
    }
    const createFolder: HnFolder = new HnFolder();
    createFolder.title = createFolderRes.title;
    createFolder.folder = folder ? folder : null;
    createFolder.path = createFolderRes.path;
    createFolder.completePath = folder ? (folder.completePath ? folder.completePath : '') + createFolderRes.path + '/' : null;
    createFolder.brickMajorVersion = brickMajorVersion ? brickMajorVersion : folder.brickMajorVersion;
    createFolder.order = createFolderRes.order != null ? createFolderRes.order : folder.nextOrder();

    return entityManager ? await entityManager.save(createFolder) : await this.foldersRepository.save(createFolder);
  }

  async createMainFolders(brickMajorVersion: HnBrickMajorVersion, entityManager: EntityManager): Promise<void> {

    const createMainFolder: HnNodeDTO = new HnNodeDTO();
    createMainFolder.isFolder = true;
    createMainFolder.path = null;
    createMainFolder.title = null;
    createMainFolder.order = 0;

    const mainFolder = await this.create(createMainFolder, entityManager, brickMajorVersion);

    const gettingStartedDoc: HnNodeDTO = new HnNodeDTO();
    gettingStartedDoc.folder = mainFolder;
    gettingStartedDoc.path = 'getting-started';
    gettingStartedDoc.title = 'Getting Started';
    gettingStartedDoc.isFolder = false;
    await this.createDoc(gettingStartedDoc, entityManager);
  }

  async createDoc(createDocumentationRes: HnNodeDTO, entityManager?: EntityManager): Promise<HnDocumentation> {

    if (createDocumentationRes.folder == null) {
      createDocumentationRes.folder =
        await this.foldersRepository.findOne(createDocumentationRes.folder ?
          createDocumentationRes.folder.id : createDocumentationRes.folderId, {relations: ['documentations', 'folders']});
    }

    createDocumentationRes.path = HnFolderService.generatePathWithTitle(createDocumentationRes.title);

    const createDocumentation = new HnDocumentation();

    createDocumentation.title = createDocumentationRes.title;
    createDocumentation.path = createDocumentationRes.path;
    createDocumentation.completePath = createDocumentationRes.folder.completePath != null ?
      createDocumentationRes.folder.completePath + createDocumentationRes.path + '/' : createDocumentationRes.path + '/';
    createDocumentation.folder = createDocumentationRes.folder;
    createDocumentation.order = createDocumentationRes.folder.nextOrder();

    return await this.documentationService.create(createDocumentation, entityManager);
  }

  async findAll(): Promise<HnFolder[]> {
    const tree = await this.foldersTreeRepository.findTrees();
    return this.TreeToArray(tree[0]);
  }

  async findFolderByBrickMajorVersion(brickMajorVersion: HnBrickMajorVersion): Promise<HnFolder> {
    return this.foldersRepository.findOne({
      where: {brickMajorVersion: brickMajorVersion, completePath: null},
      relations: ['documentations']
    });
  }

  async findBrickDocsTree(mainFolder: HnFolder): Promise<HnNode> {
    const brickDocs: HnFolder =
      await this.foldersTreeRepository.findDescendantsTree(mainFolder, {relations: ['documentations', 'folders', 'folder']});
    return this.createTree(brickDocs);
  }

  async findFirstDoc(brickMajorVersion: HnBrickMajorVersion): Promise<HnDocumentation> {
    const mainFolder: HnFolder = await this.findFolderByBrickMajorVersion(brickMajorVersion);
    const tree: HnNode = await this.findBrickDocsTree(mainFolder);
    const firstDocNode = this.findFirstDocNodeInTree(tree);
    return this.documentationService.findOne(firstDocNode.id);
  }

  private findFirstDocNodeInTree(tree: HnNode): HnNode {
    let node: HnNode = null;
    for (const c of tree.children) {
      if (c.children) {
        node = this.findFirstDocNodeInTree(c);
        if (node) break;
      } else {
        node = c;
        break;
      }
    }
    return node;
  }

  private createTree(folder: HnFolder): HnNode {

    const currentChild: HnNode[] = [];

    const currentParent: HnNode =
      new HnNode(folder.id, folder.title, folder.path, folder.completePath, folder.order, folder.folder ? folder.folder.id : null, []);

    if (folder.documentations != null) {
      folder.documentations.forEach(doc => {
        currentChild.push(new HnNode(doc.id, doc.title, doc.path, doc.completePath, doc.order, folder ? folder.id : null));
      });
    }

    if (folder.folders != null) {
      folder.folders.forEach(f => {
        currentChild.push(this.createTree(f));
      })
    }

    currentParent.children = currentChild;
    currentParent.children.sort((a, b) => a.order - b.order);

    return currentParent;
  }

  private TreeToArray(folder: HnFolder): HnFolder[] {
    let array: HnFolder[] = [folder];
    let arrayChildFolder: HnFolder[] = [];

    folder.folders.sort((a, b) => a.order - b.order);
    folder.folders.forEach(f => {
      arrayChildFolder = arrayChildFolder.concat(this.TreeToArray(f));
    });
    array = array.concat(arrayChildFolder);
    return array;
  }

  findOne(id: string): Promise<HnFolder> {
    return this.foldersRepository.findOne({where: {id: id}, relations: ['documentations', 'folders']});
  }

  async findFoldersByParentId(id: string): Promise<HnFolder[]> {
    const parent: HnFolder = await this.findOne(id);

    return parent.folders;
  }

  async findDocsByParentId(id: string): Promise<HnDocumentation[]> {
    const parent: HnFolder = await this.findOne(id);

    return parent.documentations;
  }

  async update(updatedFolder: HnNodeDTO): Promise<HnFolder> {
    const folder: HnFolder = await this.foldersRepository.findOne(updatedFolder.id, {relations: ['folder']});

    folder.path = updatedFolder.path;
    folder.title = updatedFolder.title;
    folder.completePath = folder.folder.completePath + updatedFolder.path + '/';
    return await this.foldersRepository.save(folder);
  }

  async updateTree(updatedTree: HnNode[]): Promise<HnNode[]> {
    const currentUser: HnUser = HnCurrentUserHelper.getCurrentUser();
    if (!currentUser.category.includes('ADMIN')) {
      throw new UnauthorizedException();
    }
    for (const node of updatedTree) {
      let isUpdated = false;
      if (node.children) {
        const f: HnFolder = await this.foldersRepository.findOne(node.id, {relations: ['folder']});
        if (f.order != node.order || f.folder.id != node.parentId) {
          isUpdated = true;
          f.order = node.order;
          f.folder.id = node.parentId;
        }
        if (isUpdated) {
          await this.foldersRepository.save(f);
        }
        await this.updateTree(node.children);
      } else {
        const d: HnDocumentation = await this.documentationService.findOne(node.id);
        if (d.order != node.order || d.folder.id != node.parentId) {
          isUpdated = true;
          d.order = node.order;
          d.folder.id = node.parentId;
        }
        if (isUpdated) {
          await this.documentationService.updatePosition(d);
        }
      }
    }

    return updatedTree;
  }

  async remove(id: string): Promise<void> {
    const folderToDelete: HnFolder = await this.foldersRepository.findOne(id, {relations: ['documentations', 'folders']});
    if (folderToDelete.documentations.length <= 0 && folderToDelete.folders.length <= 0) {
      await this.foldersRepository.delete(id);
    } else {
      throw new BadRequestException('Folders with children can\'t be deleted.');
    }
  }
}
