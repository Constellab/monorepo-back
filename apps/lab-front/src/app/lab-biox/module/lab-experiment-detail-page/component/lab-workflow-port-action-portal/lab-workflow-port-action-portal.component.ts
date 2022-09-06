import {Component, Inject, OnInit} from '@angular/core';
import {TdIOSpec} from '@monorepo/technical-doc';
import {FL_PORTAL_DATA, FlMenuDynamic, FlOverlayRef} from '@monorepo/front-core-lib';
import {PrWorkflowPort} from '@monorepo/protocol';

export interface LabWorkflowPortActionPortalInput {
  port: PrWorkflowPort;
  menuDynamics: FlMenuDynamic[];
}

/**
 * Portal opened when clicking on a port to show port info along with button actions for this port
 */
@Component({
  selector: 'lab-workflow-port-action-portal',
  templateUrl: './lab-workflow-port-action-portal.component.html',
  styleUrls: ['./lab-workflow-port-action-portal.component.scss']
})
export class LabWorkflowPortActionPortalComponent implements OnInit {

  ioSpec: TdIOSpec;
  menuDynamics: FlMenuDynamic[];


  constructor(@Inject(FL_PORTAL_DATA) private data: LabWorkflowPortActionPortalInput,
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
