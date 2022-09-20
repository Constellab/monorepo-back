import {Component, Inject, OnInit} from '@angular/core';
import {FL_PORTAL_DATA, FlMenuDynamic, FlOverlayRef} from '@monorepo/front-core-lib';
import {PrWorkflowPort} from '@monorepo/protocol';
import {TdIOSpec} from '@monorepo/technical-doc';

export interface PrWorkflowPortActionPortalInput {
  port: PrWorkflowPort;
  menuDynamics: FlMenuDynamic[];
}

/**
 * Portal opened when clicking on a port to show port info along with button actions for this port
 */
@Component({
  selector: 'pr-workflow-port-action-portal',
  templateUrl: './pr-workflow-port-action-portal.component.html',
  styleUrls: ['./pr-workflow-port-action-portal.component.scss']
})
export class PrWorkflowPortActionPortalComponent implements OnInit {

  ioSpec: TdIOSpec;
  menuDynamics: FlMenuDynamic[];


  constructor(@Inject(FL_PORTAL_DATA) private data: PrWorkflowPortActionPortalInput,
              private overlayRef: FlOverlayRef) {
    this.ioSpec = data.port.specs;
    this.menuDynamics = data.menuDynamics;
  }

  ngOnInit(): void {

  }

  closePortal(): void {
    this.overlayRef.dispose();
  }
}
