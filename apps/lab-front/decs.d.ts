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

    on(eventName: string, callback: (event: any) => void);

    addModule(moduleName: string): void;

    changeModule(moduleName: string): void;

  }

  export interface ConnectionEvent {
    outputId: string;
    input_id: string,
    output_class: string,
    input_class: string;
  }

  export = Drawflow;
}
