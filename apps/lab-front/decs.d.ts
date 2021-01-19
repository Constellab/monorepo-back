// Declare the workflow module to be able to used it in typescript
// this file must be defined in the include in tsconfig.json


declare module 'drawflow' {

  export class Drawflow {

    constructor(element: HTMLElement);

    module: string;

    drawflow: any;

    start(): void;

    import(data: any): void;


    addNode(name: string, inputs: number, outputs: number, posx: number, posy: number,
            className: string, data: any, html: string, typenode: false): number;

    addConnection(outputNodeId: string, inputNodeId: string, outputName: string, inputName: string): void;

    removeSingleConnection(id_output: string, id_input: string, output_class: string, input_class: string)

    on(eventName: string, callback: (event: any) => void);

    addModule(moduleName: string): void;

    changeModule(moduleName: string): void;

  }

  export interface ConnectionEvent {
    /**
     * outputNodeId
     */
    output_id: string;

    /**
     * inputNodeId
     */
    input_id: string;

    /**
     * name of the output
     */
    output_class: string;

    /**
     * name of the input
     */
    input_class: string;
  }

  export = Drawflow;
}
