import { TestBed } from '@angular/core/testing';

import { WorkflowManagerService } from './workflow-manager.service';

describe('WorkflowManagerService', () => {
  let service: WorkflowManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkflowManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
