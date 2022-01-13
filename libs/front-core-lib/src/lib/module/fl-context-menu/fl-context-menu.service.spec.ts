import {TestBed} from '@angular/core/testing';

import {FlContextMenuService} from './fl-context-menu.service';

describe('FlContextMenuService', () => {
  let service: FlContextMenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FlContextMenuService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
