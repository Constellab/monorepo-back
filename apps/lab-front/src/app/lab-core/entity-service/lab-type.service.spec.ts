import {TestBed} from '@angular/core/testing';

import {LabTypeService} from './lab-type.service';

describe('LabTypeService', () => {
  let service: LabTypeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabTypeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
