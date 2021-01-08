import {JsonObject, JsonProperty} from 'json2typescript';
import {BaseEntity} from './base-entity.class';
import {FormBuilder, FormGroup} from '@ngneat/reactive-forms';
import {Validators} from '@angular/forms';
import {ClHelpService} from '@monorepo/core-lib';
import {FlEntityPaginatedDatasource} from '@monorepo/front-core-lib';

@JsonObject('Protocol')
export class Protocol extends BaseEntity {

  @JsonProperty('label', String)
  label: string = null;

  @JsonProperty('json', String)
  json: string = null;

  getJsonProtocol(): any {
    if (!this.hasProtocol()) {
      return null;
    }
    try {
      return JSON.parse(this.json);
    } catch (e) {
      console.error('Error during json parsing ', this.json);
      return null;
    }
  }

  hasProtocol(): boolean {
    return !ClHelpService.isNullOrEmpty(this.json);
  }
}

export type ProtocolDatasource = FlEntityPaginatedDatasource<Protocol>;

export function newProtocolFormGp(): FormGroup<Partial<Protocol>> {
  return new FormBuilder().group({
    id: [null],
    label: [null, Validators.required],
    json: [null, Validators.required]
  });
}

export const protocolSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    // node is an object with at least on attribute
    // and the values are string
    nodes: {
      type: 'object',
      additionalProperties: {
        type: 'string'
      },
      minProperties: 1
    },
    links: {
      type: 'array',
      // each item are formatted like : {"from": {"node": "p1","port": "robot"} "to": {"node": "p2","port": "robot" }}
      items: [
        {
          type: 'object',
          properties: {
            from: {
              type: 'object',
              properties: {
                node: {
                  type: 'string'
                },
                port: {
                  type: 'string'
                }
              },
              required: [
                'node',
                'port'
              ]
            },
            to: {
              type: 'object',
              properties: {
                node: {
                  type: 'string'
                },
                port: {
                  type: 'string'
                }
              },
              required: [
                'node',
                'port'
              ]
            }
          },
          required: [
            'from',
            'to'
          ]
        },
      ]
    },
    // interfaces is a object with exactly one property
    // containing an object like {"proc": "p1", "port": "robot" }
    interfaces: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          proc: {
            type: 'string'
          },
          port: {
            type: 'string'
          }
        },
        required: [
          'proc',
          'port'
        ]
      },
      minProperties: 1,
      maxProperties: 1
    },
    outerfaces: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          proc: {
            type: 'string'
          },
          port: {
            type: 'string'
          }
        },
        required: [
          'proc',
          'port'
        ]
      },
      minProperties: 1,
      maxProperties: 1
    }
  },
  required: [
    'name',
    'nodes',
    'links',
    'interfaces',
    'outerfaces'
  ]
};
