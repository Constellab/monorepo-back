import {TestBed} from '@angular/core/testing';

import {FlDragManagerService} from './fl-drag-manager.service';

describe('FlDragManagerService', () => {
  let service: FlDragManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlDragManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
