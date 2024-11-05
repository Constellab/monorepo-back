import { HnAbstractCommentDto } from '../comment-core/hn-abstract-comment.dto';
import { HnAgentDto } from '../../agent-aggregate/agent/hn-agent.dto';
import { HnCommentAgent } from './hn-comment-agent.entity';
import { HnAgent } from '../../agent-aggregate/agent/hn-agent.entity';

export class HnCommentAgentDto extends HnAbstractCommentDto<HnAgentDto> {
  entity: HnAgentDto;

  constructor(commentAgent: HnCommentAgent) {
    super(commentAgent);
    this.entity = new HnAgentDto(commentAgent.entity as HnAgent);
  }
}
