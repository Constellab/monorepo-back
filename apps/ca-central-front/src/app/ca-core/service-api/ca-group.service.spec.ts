import {TestBed} from '@angular/core/testing';
import {CaGroupService} from './ca-group.service.service';

describe('CaGroupService', () => {
  let service: CaGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
