import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, TreeRepository} from 'typeorm';
import {HnFolder, HnFolderResDTO, HnNode} from './hn-folder.entity';
import {HnDocumentation, HnDocumentationResDTO} from '../documentation/hn-documentation.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnBrickVersion} from '../brick-version/hn-brick-version.entity';

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

  async create(createFolderRes: HnFolderResDTO, brickVersion: HnBrickVersion): Promise<HnFolder> {

    let folder: HnFolder;
    if(createFolderRes.folderId){
      folder = await this.foldersRepository.findOne(createFolderRes.folderId);
    }

    const createFolder = {
      title: createFolderRes.title,
      folder: folder ? folder : null,
      path: createFolderRes.path,
      completePath: folder ? folder.completePath + createFolderRes.path + '/' : null,
      brickVersion: brickVersion,
      order: createFolderRes.order
    }

    return this.foldersRepository.save(createFolder);
  }

  async createMainFolders(brickVersion: HnBrickVersion): Promise<void>{

    const createMainFolder: HnFolderResDTO = new HnFolderResDTO(null, null, 0, null);

    const mainFolder = await this.create(createMainFolder, brickVersion);
    const gettingStartedDoc: HnDocumentationResDTO = new HnDocumentationResDTO();
    gettingStartedDoc.folderId = mainFolder.id;
    gettingStartedDoc.order = 0;
    gettingStartedDoc.path = 'getting-started';
    gettingStartedDoc.title = 'Getting Started';
    await this.createDoc(gettingStartedDoc);
  }

  async createDoc(createDocumentationRes: HnDocumentationResDTO): Promise<HnDocumentation> {
    const folder = await this.foldersRepository.findOne(createDocumentationRes.folderId);

    const createDocumentation = new HnDocumentation();

    createDocumentation.title = createDocumentationRes.title;
    createDocumentation.path = createDocumentationRes.path;
    createDocumentation.completePath =
      folder.completePath != null ? folder.completePath + createDocumentationRes.path + '/' : createDocumentationRes.path + '/';
    createDocumentation.order = createDocumentationRes.order;
    createDocumentation.folder = folder;

    return await this.documentationService.create(createDocumentation);
  }

  async updateDoc(updateDocumentationRes: HnDocumentationResDTO): Promise<HnDocumentation> {
    const folder = await this.foldersRepository.findOne(updateDocumentationRes.folderId);

    const updateDocumentation = HnDocumentation.newDoc(
      updateDocumentationRes.id,
      updateDocumentationRes.title,
      updateDocumentationRes.path,
      folder.completePath + updateDocumentationRes.path + '/',
      updateDocumentationRes.order, folder);

    const doc: HnDocumentation = await this.documentationService.update(updateDocumentation);
    return doc;
  }

  async findAll(): Promise<HnFolder[]> {
    const tree = await this.foldersTreeRepository.findTrees();
    return this.TreeToArray(tree[0]);
  }

  async findFolderByBrickVersion(brickVersion: HnBrickVersion): Promise<HnFolder>{
    return this.foldersRepository.findOne({
      where : { brickVersion: brickVersion, completePath: null },
      relations: ['documentations', 'folders']
    });
  }

  async findBrickDocsTree(mainFolder: HnFolder): Promise<HnNode>{
    const brickDocs: HnFolder =
      await this.foldersTreeRepository.findDescendantsTree(mainFolder, {relations: ['documentations', 'folders']});
    return this.createTree(brickDocs);
  }

  private createTree(folder: HnFolder): HnNode {

    const currentChild: HnNode[] = [];

    const currentParent: HnNode =
      new HnNode(folder.id, folder.title, folder.path, folder.completePath, folder.order, [], folder.folder ? folder.folder.id : null);

    if (folder.documentations != null) {
      folder.documentations.map(doc => {
        currentChild.push(new HnNode(doc.id, doc.title, doc.path, doc.completePath, doc.order));
      });
    }

    if (folder.folders != null) {
      folder.folders.map(f => {
        currentChild.push(this.createTree(f));
      })
    }

    if (currentChild.length == 0) {
      currentChild[0] = new HnNode(null, null, null, null, 0);
    }

    currentParent.children = currentChild;
    currentParent.children.sort((a, b) => a.order - b.order);

    return currentParent;
  }

  private TreeToArray(folder: HnFolder): HnFolder[] {
    let array: HnFolder[] = [folder];
    let arrayChildFolder: HnFolder[] = [];

    folder.folders.sort((a, b) => a.order - b.order);
    folder.folders.map(f => {
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

  async update(updateFolder: HnFolderResDTO): Promise<HnFolder> {
    let folder: HnFolder = await this.foldersRepository.findOne(updateFolder.id, {relations: ['documentations', 'folders']});

    folder.path = updateFolder.path;
    folder.title = updateFolder.title;
    folder.order = updateFolder.order;
    if (updateFolder.folderId) {
      folder.folder = await this.foldersRepository.findOne(updateFolder.folderId);
      folder.completePath = folder.folder.completePath + folder.path + '/';
    } else {

    }


    folder = await this.foldersRepository.save(folder);

    const folderTree: HnFolder = await this.foldersTreeRepository.findDescendantsTree(folder, {relations: ['documentations', 'folder']});

    return this.updateChildrenPath(folderTree);
  }

  private updateChildrenPath(folder: HnFolder): HnFolder {
    folder.folders.map(
      f => {
        f.completePath = folder.completePath + f.path + '/';
        this.foldersRepository.save(f);
        this.updateChildrenPath(f);
      }
    );

    folder.documentations.map(
      d => {
        d.completePath = folder.completePath + d.path + '/';
        this.documentationService.update(d);
      }
    );

    return folder;
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
