import {BadRequestException, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, TreeRepository} from 'typeorm';
import {HnFolder, HnFolderResDTO, HnNode, HnNodeDTO} from './hn-folder.entity';
import {HnDocumentation, HnDocumentationResDTO} from '../documentation/hn-documentation.entity';
import {HnDocumentationService} from '../documentation/hn-documentation.service';
import {HnBrickVersion} from '../brick-version/hn-brick-version.entity';
import {HnUser} from '../users/hn-user.entity';
import {HnCurrentUserHelper} from '../core/utils/hn-current-user.helper';

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

  async create(createFolderRes: HnNodeDTO, brickVersion?: HnBrickVersion): Promise<HnFolder> {

    let folder: HnFolder;
    if(createFolderRes.folderId){
      folder = await this.foldersRepository.findOne(createFolderRes.folderId, {relations: ['documentations', 'folders']});
    }
    const createFolder = {
      title: createFolderRes.title,
      folder: folder ? folder : null,
      path: createFolderRes.path,
      completePath: folder ? (folder.completePath ? folder.completePath : '') + createFolderRes.path + '/' : null,
      brickVersion: brickVersion ? brickVersion : folder.brickVersion,
      order: createFolderRes.order != null ? createFolderRes.order : folder.nextOrder()
  }

    return await this.foldersRepository.save(createFolder);
  }

  async createMainFolders(brickVersion: HnBrickVersion): Promise<void>{

    const createMainFolder: HnNodeDTO = new HnNodeDTO();
    createMainFolder.isFolder = true;
    createMainFolder.path = null;
    createMainFolder.title = null;
    createMainFolder.order = 0;

    const mainFolder = await this.create(createMainFolder, brickVersion);

    const gettingStartedDoc: HnNodeDTO = new HnNodeDTO();
    gettingStartedDoc.folder = mainFolder;
    gettingStartedDoc.path = 'getting-started';
    gettingStartedDoc.title = 'Getting Started';
    gettingStartedDoc.isFolder = false;
    await this.createDoc(gettingStartedDoc);
  }

  async createDoc(createDocumentationRes: HnNodeDTO): Promise<HnDocumentation> {
    createDocumentationRes.folder =
      await this.foldersRepository.findOne(createDocumentationRes.folder ? createDocumentationRes.folder.id : createDocumentationRes.folderId, {relations: ['documentations', 'folders']});


    const createDocumentation = new HnDocumentation();

    createDocumentation.title = createDocumentationRes.title;
    createDocumentation.path = createDocumentationRes.path;
    createDocumentation.completePath = createDocumentationRes.folder.completePath != null ? createDocumentationRes.folder.completePath + createDocumentationRes.path + '/' : createDocumentationRes.path + '/';
    createDocumentation.folder = createDocumentationRes.folder;
    createDocumentation.order = createDocumentationRes.folder.nextOrder();

    return await this.documentationService.create(createDocumentation);
  }

  async findAll(): Promise<HnFolder[]> {
    const tree = await this.foldersTreeRepository.findTrees();
    return this.TreeToArray(tree[0]);
  }

  async findFolderByBrickVersion(brickVersion: HnBrickVersion): Promise<HnFolder>{
    return this.foldersRepository.findOne({
      where : { brickVersion: brickVersion, completePath: null },
      relations: ['documentations']
    });
  }

  async findBrickDocsTree(mainFolder: HnFolder): Promise<HnNode>{
    const brickDocs: HnFolder =
      await this.foldersTreeRepository.findDescendantsTree(mainFolder, {relations: ['documentations', 'folders', 'folder'] });
    return this.createTree(brickDocs);
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

    // if(currentChild.length ==  0){
    //   currentChild.push(new HnNode(null, null, null, null, 0, null));
    // }



    currentParent.children = currentChild;
    currentParent.children.sort((a, b) => a.order - b.order);

    console.log(currentChild);

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
    let folder: HnFolder = await this.foldersRepository.findOne(updatedFolder.id, {relations: ['folder']});

    folder.path = updatedFolder.path;
    folder.title = updatedFolder.title;
    folder.completePath = folder.folder.completePath + updatedFolder.path + '/';
    return await this.foldersRepository.save(folder);
  }

  async updateTree(updatedTree: HnNode[]): Promise<HnNode[]>{
    const currentUser: HnUser = HnCurrentUserHelper.getCurrentUser();
    if(!currentUser.category.includes('ADMIN')){
      throw new UnauthorizedException();
    }
    for (const node of updatedTree){
      let isUpdated = false;
      if(node.children) {
        const f: HnFolder = await this.foldersRepository.findOne(node.id, {relations:  ['folder']});
        if (f.order != node.order || f.folder.id != node.parentId) {
          isUpdated = true;
          f.order = node.order;
          f.folder.id = node.parentId;
        }
        if(isUpdated){
          await this.foldersRepository.save(f);
        }
        await this.updateTree(node.children);
      } else {
        const d: HnDocumentation = await this.documentationService.findOne(node.id);
        if(d.order != node.order || d.folder.id != node.parentId) {
          isUpdated = true;
          d.order = node.order;
          d.folder.id = node.parentId;
        }
        if(isUpdated){
          await this.documentationService.updatePosition(d);
        }
      }
    }

    return updatedTree;
  }

  // private updateChildrenPath(folder: HnFolder): HnFolder {
  //   folder.folders.map(
  //     f => {
  //       f.completePath = folder.completePath + f.path + '/';
  //       this.foldersRepository.save(f);
  //       this.updateChildrenPath(f);
  //     }
  //   );
  //
  //   folder.documentations.map(
  //     d => {
  //       d.completePath = folder.completePath + d.path + '/';
  //       this.documentationService.update(d);
  //     }
  //   );
  //
  //   return folder;
  // }

  async remove(id: string): Promise<void> {
    const folderToDelete: HnFolder = await this.foldersRepository.findOne(id, {relations: ['documentations', 'folders']});
    if (folderToDelete.documentations.length <= 0 && folderToDelete.folders.length <= 0) {
      await this.foldersRepository.delete(id);
    } else {
      throw new BadRequestException('Folders with children can\'t be deleted.');
    }
  }
}
