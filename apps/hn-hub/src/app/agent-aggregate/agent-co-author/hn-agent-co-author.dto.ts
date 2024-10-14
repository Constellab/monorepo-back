import {HnUserDto} from '../../users/hn-user.dto';
import {HnAgentCoAuthor} from './hn-agent-co-author.entity';

export class HnAgentCoAuthorDto {
  id: string;
  user: HnUserDto;

  constructor(agentCoAuthor: HnAgentCoAuthor) {
    this.id = agentCoAuthor.id;
    this.user = new HnUserDto(agentCoAuthor.user);
  }
}
