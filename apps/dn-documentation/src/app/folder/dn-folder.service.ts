import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Repository, TreeRepository} from 'typeorm';
import {DnFolder, DnFolderResDTO, DnNode} from './dn-folder.entity';
import {DnVersion} from '../version/dn-version.entity';
import {DnVersionService} from '../version/dn-version.service';
import {DnDocumentation, DnDocumentationResDTO} from '../documentation/dn-documentation.entity';
import {DnDocumentationService} from '../documentation/dn-documentation.service';

@Injectable()
export class DnFolderService {
  constructor(
    @InjectRepository(DnFolder)
    private foldersRepository: Repository<DnFolder>,

    @InjectRepository(DnFolder)
    private foldersTreeRepository: TreeRepository<DnFolder>,

    private documentationService: DnDocumentationService,

    private versionService: DnVersionService
  ){}

  async create(createFolderRes: DnFolderResDTO): Promise<DnFolder> {

    const version: DnVersion = await this.versionService.getByVersionNumber('1.0.0');
    if (!version) {
      throw new NotFoundException();
    }

    const folder: DnFolder = await this.foldersRepository.findOne(createFolderRes.folderId);

    const createFolder = {
      title: createFolderRes.title,
      folder: folder,
      path: createFolderRes.path,
      completePath: folder.completePath + createFolderRes.path + '/',
      version: version,
      order: createFolderRes.order
    }

    return this.foldersRepository.save(createFolder);
  }

  async createDoc(createDocumentationRes: DnDocumentationResDTO): Promise<DnDocumentation> {
    const folder = await this.foldersRepository.findOne(createDocumentationRes.folderId);

    const createDocumentation = {
      title: createDocumentationRes.title,
      content: createDocumentationRes.content,
      path: createDocumentationRes.path,
      completePath: folder.completePath + createDocumentationRes.path + '/',
      order: createDocumentationRes.order,
      folder: folder
    }

    const doc: DnDocumentation = await this.documentationService.create(createDocumentation);
    return doc;
  }

  async updateDoc(updateDocumentationRes: DnDocumentationResDTO): Promise<DnDocumentation> {
    const folder = await this.foldersRepository.findOne(updateDocumentationRes.folderId);

    const updateDocumentation = {
      id: updateDocumentationRes.id,
      title: updateDocumentationRes.title,
      content: updateDocumentationRes.content,
      path: updateDocumentationRes.path,
      completePath: folder.completePath + updateDocumentationRes.path + '/',
      order: updateDocumentationRes.order,
      folder: folder
    }

    const doc: DnDocumentation = await this.documentationService.update(updateDocumentation);
    return doc;
  }

  async findAll(): Promise<DnFolder[]> {
    const tree = await this.foldersTreeRepository.findTrees();
    return this.TreeToArray(tree[0]);
  }

  async findTree(): Promise<DnNode> {
    const allDoc: DnFolder[] = await this.foldersTreeRepository.findTrees({relations: ['documentations', 'version', 'folder']});
    return this.createTree(allDoc[0]);
  }

  createTree(folder: DnFolder): DnNode{

    const currentChild: DnNode[] = [];

    const currentParent: DnNode =
      new DnNode(folder.id, folder.title, folder.path, folder.completePath, folder.order, [], folder.folder ? folder.folder.id : null);

    if(folder.documentations != null){
      folder.documentations.map(doc => {
        currentChild.push(new DnNode(doc.id, doc.title, doc.path, doc.completePath, doc.order));
      });
    }

    if(folder.folders != null) {
      folder.folders.map(f => {
        currentChild.push(this.createTree(f));
      })
    }

    if(currentChild.length == 0){
      currentChild[0] = new DnNode(null, null, null, null, 0);
    }
    currentParent.children = currentChild;
    currentParent.children.sort((a, b) => a.order - b.order);

    return currentParent;
  }

  TreeToArray(folder: DnFolder): DnFolder[]{
    let array:DnFolder[] = [folder];
    let arrayChildFolder: DnFolder[] = [];

    folder.folders.sort((a, b) => a.order - b.order);
    folder.folders.map(f => {
      const yeah = this.TreeToArray(f);
      arrayChildFolder = arrayChildFolder.concat(yeah);
    });
    array = array.concat(arrayChildFolder);
    return array;
  }

  findOne(id: string): Promise<DnFolder> {
    return this.foldersRepository.findOne({where: {id: id}, relations: ['documentations', 'folders']});
  }

  async findFoldersByParentId(id: string): Promise<DnFolder[]>{
    const parent: DnFolder = await this.findOne(id);

    return parent.folders;
  }

  async findDocsByParentId(id: string): Promise<DnDocumentation[]>{
    const parent: DnFolder = await this.findOne(id);

    return parent.documentations;
  }

  async update(updateFolder: DnFolderResDTO): Promise<DnFolder> {
    let folder: DnFolder = await this.foldersRepository.findOne(updateFolder.id, {relations: ['documentations', 'folder']});

    folder.path = updateFolder.path;
    folder.title = updateFolder.title;
    folder.order = updateFolder.order;
    if(updateFolder.folderId){
      folder.folder = await this.foldersRepository.findOne(updateFolder.folderId);
      folder.completePath = folder.folder.completePath + folder.path + '/';
    } else {

    }


    folder = await this.foldersRepository.save(folder);

    const folderTree: DnFolder = await this.foldersTreeRepository.findDescendantsTree(folder, {relations: ['documentations', 'folder']});

    return this.updateChildrenPath(folderTree);
  }

  updateChildrenPath(folder: DnFolder): DnFolder{
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
    if(folderToDelete.documentations.length <= 0 && folderToDelete.folders.length <= 0){
      await this.foldersRepository.delete(id);
    } else {
      throw new BadRequestException('Folders with children can\'t be deleted.');
    }
  }
}
