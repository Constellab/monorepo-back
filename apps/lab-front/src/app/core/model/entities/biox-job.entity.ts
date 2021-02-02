import {BioxConfig} from './biox-config.entity';
import {BioxProcessableBase} from './biox-processable-base.entity';
import {ClLuxonTransform} from '@monorepo/core-lib';
import {DateTime} from 'luxon';
import {BioxNode} from '../global/biox-connection.class';
import {Expose, Type} from 'class-transformer';


/**
 * Executed or ready to be executed process of a job
 */
export class BioxJob extends BioxNode {

  // python class link
  type: 'gws.model.Job';

  @Expose({name: 'creation_datetime'})
  @ClLuxonTransform()
  createdAt: DateTime;

  @Expose({name: 'is_running'})
  isRunning: boolean;

  @Expose({name: 'is_finished'})
  isFinished: boolean;

  @Expose({name: 'experiment_uri'})
  experimentId: string;

  @Expose({name: 'parent_job_uri'})
  parentJobId: string = null;

  @Type(() => BioxConfig)
  config: BioxConfig = null;

  @Type(() => BioxProcessableBase)
  process: BioxProcessableBase = null;

  // merge the current config with the default values to ge tte current config
  public getCurrentConfig(): any{
    return this.process.configSpecs.mergeConfigWithDefault(this.config.params);
  }

}
