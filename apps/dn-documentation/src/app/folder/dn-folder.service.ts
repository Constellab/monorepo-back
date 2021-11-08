import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Repository, TreeRepository} from 'typeorm';
import {DnFolder, DnFolderDTO, DnFolderResDTO, DnNode} from './dn-folder.entity';
import {DnVersion} from '../version/dn-version.entity';
import {DnVersionService} from '../version/dn-version.service';
import {DnDocumentation} from '../documentation/dn-documentation.entity';

@Injectable()
export class DnFolderService {
  constructor(
        @InjectRepository(DnFolder)
        private foldersRepository: Repository<DnFolder>,

        @InjectRepository(DnFolder)
        private foldersTreeRepository: TreeRepository<DnFolder>,

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
      path: folder.path + createFolderRes.path + '/',
      version: version,
      order: createFolderRes.order
    }

    return this.foldersRepository.save(createFolder);
  }

  async findAll(): Promise<DnFolder[]> {
    const tree = await this.foldersTreeRepository.findTrees();
    return this.TreeToArray(tree[0]);
  }

  async findTree(): Promise<DnNode> {
    const allDoc: DnFolder[] = await this.foldersTreeRepository.findTrees({relations: ['documentations', 'version']});
    return this.createTree(allDoc[0]);
  }

  createTree(folder: DnFolder): DnNode{

    const currentChild: DnNode[] = [];

    const currentParent: DnNode = new DnNode(folder.id, folder.title, folder.path, folder.order, []);

    if(typeof folder.documentations !== 'undefined'){
      folder.documentations.map(doc => {
        currentChild.push(new DnNode(doc.id, doc.title, doc.path, doc.order));
      });
    }

    if(typeof folder.folders !== 'undefined') {
      folder.folders.map(f => {
        currentChild.push(this.createTree(f));
      })
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

}
