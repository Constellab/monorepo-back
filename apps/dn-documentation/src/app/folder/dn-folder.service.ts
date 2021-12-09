import {BadRequestException, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, TreeRepository} from 'typeorm';
import {DnFolder, DnFolderResDTO, DnNode} from './dn-folder.entity';
import {DnDocumentation, DnDocumentationResDTO} from '../documentation/dn-documentation.entity';
import {DnDocumentationService} from '../documentation/dn-documentation.service';
import {DnBrickVersion} from '../brick-version/dn-brick-version.entity';

@Injectable()
export class DnFolderService {
  constructor(
    @InjectRepository(DnFolder)
    private foldersRepository: Repository<DnFolder>,
    @InjectRepository(DnFolder)
    private foldersTreeRepository: TreeRepository<DnFolder>,
    private documentationService: DnDocumentationService,
  ) {
  }

  async create(createFolderRes: DnFolderResDTO, brickVersion: DnBrickVersion): Promise<DnFolder> {

    const folder: DnFolder = await this.foldersRepository.findOne(createFolderRes.folderId);

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

  async createMainFolders(brickVersion: DnBrickVersion): Promise<void>{

    const createMainFolder: DnFolderResDTO = new DnFolderResDTO(null, null, 0, null);

    await this.create(createMainFolder, brickVersion);
  }

  async createDoc(createDocumentationRes: DnDocumentationResDTO): Promise<DnDocumentation> {
    const folder = await this.foldersRepository.findOne(createDocumentationRes.folderId);

    const createDocumentation = new DnDocumentation();

    createDocumentation.title = createDocumentationRes.title;
    createDocumentation.content = createDocumentationRes.content;
    createDocumentation.path = createDocumentationRes.path;
    createDocumentation.completePath = folder.completePath + createDocumentationRes.path + '/';
    createDocumentation.order = createDocumentationRes.order;
    createDocumentation.folder = folder;


    const doc: DnDocumentation = await this.documentationService.create(createDocumentation);
    return doc;
  }

  async updateDoc(updateDocumentationRes: DnDocumentationResDTO): Promise<DnDocumentation> {
    const folder = await this.foldersRepository.findOne(updateDocumentationRes.folderId);

    const updateDocumentation = DnDocumentation.newDoc(
      updateDocumentationRes.id,
      updateDocumentationRes.title,
      updateDocumentationRes.content,
      updateDocumentationRes.path,
      folder.completePath + updateDocumentationRes.path + '/',
      updateDocumentationRes.order, folder);

    const doc: DnDocumentation = await this.documentationService.update(updateDocumentation);
    return doc;
  }

  async findAll(): Promise<DnFolder[]> {
    const tree = await this.foldersTreeRepository.findTrees();
    return this.TreeToArray(tree[0]);
  }

  async findTree(): Promise<DnNode> {
    const allDoc: DnFolder[] = await this.foldersTreeRepository.findTrees({relations: ['documentations', 'folder']});
    return this.createTree(allDoc[0]);
  }

  async findFolderByBrickVersion(brickVersion: DnBrickVersion): Promise<DnFolder>{
    return this.foldersRepository.findOne({where : { brickVersion: brickVersion, path: null }});
  }

  async findBrickDocsTree(mainFolder: DnFolder): Promise<DnNode>{
    const brickDocs: DnFolder =
      await this.foldersTreeRepository.findDescendantsTree(mainFolder, {relations: ['documentations', 'folder']});
    return this.createTree(brickDocs);
  }

  private createTree(folder: DnFolder): DnNode {

    const currentChild: DnNode[] = [];

    const currentParent: DnNode =
      new DnNode(folder.id, folder.title, folder.path, folder.completePath, folder.order, [], folder.folder ? folder.folder.id : null);

    if (folder.documentations != null) {
      folder.documentations.map(doc => {
        currentChild.push(new DnNode(doc.id, doc.title, doc.path, doc.completePath, doc.order));
      });
    }

    if (folder.folders != null) {
      folder.folders.map(f => {
        currentChild.push(this.createTree(f));
      })
    }

    if (currentChild.length == 0) {
      currentChild[0] = new DnNode(null, null, null, null, 0);
    }

    currentParent.children = currentChild;
    currentParent.children.sort((a, b) => a.order - b.order);

    return currentParent;
  }

  private TreeToArray(folder: DnFolder): DnFolder[] {
    let array: DnFolder[] = [folder];
    let arrayChildFolder: DnFolder[] = [];

    folder.folders.sort((a, b) => a.order - b.order);
    folder.folders.map(f => {
      arrayChildFolder = arrayChildFolder.concat(this.TreeToArray(f));
    });
    array = array.concat(arrayChildFolder);
    return array;
  }

  findOne(id: string): Promise<DnFolder> {
    return this.foldersRepository.findOne({where: {id: id}, relations: ['documentations', 'folders']});
  }

  async findFoldersByParentId(id: string): Promise<DnFolder[]> {
    const parent: DnFolder = await this.findOne(id);

    return parent.folders;
  }

  async findDocsByParentId(id: string): Promise<DnDocumentation[]> {
    const parent: DnFolder = await this.findOne(id);

    return parent.documentations;
  }

  async update(updateFolder: DnFolderResDTO): Promise<DnFolder> {
    let folder: DnFolder = await this.foldersRepository.findOne(updateFolder.id, {relations: ['documentations', 'folder']});

    folder.path = updateFolder.path;
    folder.title = updateFolder.title;
    folder.order = updateFolder.order;
    if (updateFolder.folderId) {
      folder.folder = await this.foldersRepository.findOne(updateFolder.folderId);
      folder.completePath = folder.folder.completePath + folder.path + '/';
    } else {

    }


    folder = await this.foldersRepository.save(folder);

    const folderTree: DnFolder = await this.foldersTreeRepository.findDescendantsTree(folder, {relations: ['documentations', 'folder']});

    return this.updateChildrenPath(folderTree);
  }

  private updateChildrenPath(folder: DnFolder): DnFolder {
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
    const folderToDelete: DnFolder = await this.foldersRepository.findOne(id, {relations: ['documentations', 'folders']});
    if (folderToDelete.documentations.length <= 0 && folderToDelete.folders.length <= 0) {
      await this.foldersRepository.delete(id);
    } else {
      throw new BadRequestException('Folders with children can\'t be deleted.');
    }
  }
}
