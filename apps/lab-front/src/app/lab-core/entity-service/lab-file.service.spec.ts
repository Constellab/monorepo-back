import {TestBed} from '@angular/core/testing';

import {LabFileResourceService} from './lab-file-resource.service';

describe('LabFileService', () => {
  let service: LabFileResourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabFileResourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
