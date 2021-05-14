import { TestBed } from '@angular/core/testing';

import { FileResourceService } from './file-resource.service';

describe('LabFileService', () => {
  let service: FileResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FileResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
