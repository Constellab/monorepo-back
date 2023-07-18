import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {EntityManager, IsNull, Repository, TreeRepository} from 'typeorm';
import {HnFolder} from './hn-folder.entity';
import {HnDocumentation, HnDocumentationSearchDTO} from '../documentation/hn-documentation.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnBrickMajorVersion, HnVersionState} from '../brick-major-version/hn-brick-major-version.entity';
import {HnNode, HnNodeDTO} from './hn-folder.dto';
import {BlBadRequestException} from '@monorepo/back-core-lib';
import {ClStringHelper} from '@monorepo/core-lib';

@Injectable()
export class HnFolderService {
  constructor(@InjectRepository(HnFolder)
              private foldersRepository: Repository<HnFolder>,
              @InjectRepository(HnFolder)
              private foldersTreeRepository: TreeRepository<HnFolder>,
              private documentationService: HnDocumentationService,) {
  }


  async create(createFolderRes: HnNodeDTO, entityManager?: EntityManager, brickMajorVersion?: HnBrickMajorVersion): Promise<HnFolder> {

    createFolderRes.path = ClStringHelper.generateUrlPathFromString(createFolderRes.title);

    let folder: HnFolder;
    if (createFolderRes.folderId) {
      folder = await this.foldersRepository.findOne({
        where: {id: createFolderRes.folderId},
        relations: {documentations: true, folders: true}
      });
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
    await this.documentationService.create(gettingStartedDoc, mainFolder, entityManager);
  }

  async findAll(): Promise<HnFolder[]> {
    const tree = await this.foldersTreeRepository.findTrees();
    return this.TreeToArray(tree[0]);
  }

  async findFolderByBrickMajorVersion(brickMajorVersion: HnBrickMajorVersion): Promise<HnFolder> {
    return this.foldersRepository.findOne({
      where: {brickMajorVersion: {id: brickMajorVersion.id}, completePath: IsNull()},
      relations: {documentations: true}
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
    return this.documentationService.findById(firstDocNode.id);
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
      });
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

  findById(id: string): Promise<HnFolder> {
    return this.foldersRepository.findOne({where: {id: id}, relations: ['documentations', 'folders']});
  }

  async findFoldersByParentId(id: string): Promise<HnFolder[]> {
    const parent: HnFolder = await this.findById(id);

    return parent.folders;
  }

  async findDocsByParentId(id: string): Promise<HnDocumentation[]> {
    const parent: HnFolder = await this.findById(id);

    return parent.documentations;
  }

  async update(updatedFolder: HnNodeDTO): Promise<HnFolder> {
    let folder: HnFolder = await this.foldersRepository.findOne({
      where: {id: updatedFolder.id},
      relations: {folder: true, documentations: true, folders: true}
    });

    folder.path = ClStringHelper.generateUrlPathFromString(updatedFolder.title);
    folder.title = updatedFolder.title;
    folder.completePath = folder.folder.completePath ? folder.folder.completePath + folder.path + '/' : folder.path + '/';

    folder = await this.foldersRepository.save(folder);

    await this.updateChildCompletePath(folder);

    return folder;
  }

  async updateChildCompletePath(folder: HnFolder): Promise<void> {
    if (folder.documentations.length > 0) {
      for (const d of folder.documentations) {
        await this.documentationService.updateCompletePath(d, folder);
      }
    }
    if (folder.folders.length > 0) {
      for (const f of folder.folders) {
        const fDTO = new HnNodeDTO();
        fDTO.isFolder = true;
        fDTO.title = f.title;
        fDTO.id = f.id;
        await this.update(fDTO);
      }
    }
  }

  async updateTree(updatedTree: HnNode[]): Promise<HnNode[]> {
    for (const node of updatedTree) {
      let isUpdated = false;
      if (node.children) {
        const f: HnFolder = await this.foldersRepository.findOne({where: {id: node.id}, relations: {folder: true}});
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
        const d: HnDocumentation = await this.documentationService.findById(node.id);
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
    const folderToDelete: HnFolder = await this.foldersRepository.findOne({
      where: {id: id}, relations: {
        documentations: true,
        folders: true
      }
    });
    if (folderToDelete.documentations.length <= 0 && folderToDelete.folders.length <= 0) {
      await this.foldersRepository.delete(id);
    } else {
      throw new BlBadRequestException('Folders with children can\'t be deleted.');
    }
  }

  async getDocsByBrickNameMajor(brickMajorVersion: HnBrickMajorVersion, major: string, brickName: string):
    Promise<HnDocumentationSearchDTO[]> {
    const brickDocs: HnFolder =
      await this.foldersTreeRepository.findDescendantsTree(
        await this.findFolderByBrickMajorVersion(brickMajorVersion),
        {relations: ['documentations', 'folders', 'folder']});

    return this.getDocsByFolder(brickDocs, major, brickName);
  }

  private getDocsByFolder(folder: HnFolder, major: string, brickName: string): HnDocumentationSearchDTO[] {
    const documentations: HnDocumentationSearchDTO[] = [];

    for (const doc of folder.documentations) {
      documentations.push({
        name: doc.title,
        id: doc.id,
        completePath: doc.completePath,
        major: major,
        brickName: brickName,
        isTechnical: false
      });
    }

    if (folder.folder) {
      for (const fol of folder.folders) {
        this.getDocsByFolder(fol, major, brickName).forEach(d => {
          documentations.push(d);
        });
      }
    }
    return documentations;
  }

  async findBrickMajorVersionMap(brickMajorVersion: HnBrickMajorVersion, baseMapString: string): Promise<string[]> {
    const brickMajorVersionMap: string[] = [];
    const mainFolder: HnFolder = await this.findFolderByBrickMajorVersion(brickMajorVersion);
    const docs: HnDocumentationSearchDTO[] =
      this.getDocsByFolder(mainFolder, brickMajorVersion.major.toString(), brickMajorVersion.brick.name);
    for (const doc of docs) {
      if (brickMajorVersion.versionState == HnVersionState.LATEST) {
        const latestBaseMapString: string = baseMapString.split('/')[0] + '/latest/doc/';
        brickMajorVersionMap.push(latestBaseMapString + doc.completePath.slice(0, -1));
      } else {
        brickMajorVersionMap.push(baseMapString + '/doc/' + doc.completePath.slice(0, -1));
      }
    }
    return brickMajorVersionMap;
  }
}
