import {TdConfigSpec, TdIOSpec} from '@monorepo/technical-doc';

export interface PrProtocolGraphInput{
  nodes: Record<string, PrProtocolGraphInputNode>;

  links: PrProtocolGraphInputLink[];

  interfaces: Record<string, PrProtocolGraphInputIntOut>;

  outerfaces: Record<string, PrProtocolGraphInputIntOut>;
}

export interface PrProtocolGraphInputNode{
  brick_version: string;

  human_name: string;

  instance_name: string;

  process_typing_name: string;

  short_description: string;

  config: PrProtocolGraphInputConfig;

  input_specs: Record<string, TdIOSpec>;

  output_specs: Record<string, TdIOSpec>;

  graph?: PrProtocolGraphInput;
}

export interface PrProtocolGraphInputConfig{
  specs: Record<string, TdConfigSpec>;

  data: any;
}

export interface PrProtocolGraphInputLink{
  from: PrProtocolGraphInputLinkNode;

  to: PrProtocolGraphInputLinkNode;
}

export interface PrProtocolGraphInputIntOut extends PrProtocolGraphInputLink{
  name: string;
}

export interface PrProtocolGraphInputLinkNode{
  node: string;

  port: string;
}
