import {Expose} from 'class-transformer';
import {FlArrayObs} from '@monorepo/front-core-lib';

export class LabBrickData {

  @Expose({name: 'brick_name'})
  brickName: string;

  @Expose({name: 'fs_node_name'})
  fsNodeName: string;

  @Expose({name: 'fs_node_size'})
  fsNodeSize: number;

  @Expose({name: 'fs_node_path'})
  fsNodePath: string;

  @Expose({name: 'fs_node_type'})
  fsNodeType: 'file' | 'folder';

}

export class LabBrickDataArrayObs extends FlArrayObs<LabBrickData> {
  protected equals(a: LabBrickData, b: LabBrickData): boolean {
    return a.fsNodePath === b.fsNodePath;
  }


}

