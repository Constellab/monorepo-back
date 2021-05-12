import { TestBed } from '@angular/core/testing';

import { LabFileService } from './lab-file.service';

describe('LabFileService', () => {
  let service: LabFileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabFileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
