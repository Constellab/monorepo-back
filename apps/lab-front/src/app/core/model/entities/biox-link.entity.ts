import {JsonObject, JsonProperty} from 'json2typescript';

@JsonObject('BioxLinkPart')
export class BioxLinkPart{

  @JsonProperty('node', String)
  node: string = null;

  @JsonProperty('port', String)
  port: string = null;
}

@JsonObject('BioxLink')
export class BioxLink{

  @JsonProperty('from', BioxLinkPart)
  from: BioxLinkPart = null;

  @JsonProperty('to', BioxLinkPart)
  to: BioxLinkPart = null;
}
