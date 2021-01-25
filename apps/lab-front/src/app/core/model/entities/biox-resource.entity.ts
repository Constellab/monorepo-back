import {LabBaseEntity} from '../global/lab-entity.entity';
import {Any, JsonObject, JsonProperty} from 'json2typescript';

@JsonObject('BioxResource')
export class BioxResource extends LabBaseEntity{

  @JsonProperty('job_uri', String)
  jobId: string = null;

  @JsonProperty('experiment_uri', String)
  experimentId: string = null;

  @JsonProperty('data', Any)
  data: Record<string, any> = null;
}
