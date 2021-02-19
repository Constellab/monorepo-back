import { TestBed } from '@angular/core/testing';

import { BiotaDatabaseService } from './biota-database.service';

describe('BiotaDatabaseService', () => {
  let service: BiotaDatabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiotaDatabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
