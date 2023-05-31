import {CnLabStatusRuleAction, CnLabStatusRuleType} from './cn-lab-status-rule.entity';


export interface CnLabStatusRuleCreateDto {
  action: CnLabStatusRuleAction;

  type: CnLabStatusRuleType;
}
