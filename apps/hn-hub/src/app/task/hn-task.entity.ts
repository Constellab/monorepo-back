import {HnGeneratedDocEntity} from '../core/model/entities/hn-generated-doc.entity';
import {Entity, Unique} from 'typeorm';

@Unique(['uniqueName', 'technicalFolder'])
@Entity('Task')
export class HnTask extends HnGeneratedDocEntity {

}
