import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabBiotaDatabaseSearchFormComponent} from './lab-biota-database-search-form.component';

describe('BiotaDatabaseSearchFormComponent', () => {
  let component: LabBiotaDatabaseSearchFormComponent;
  let fixture: ComponentFixture<LabBiotaDatabaseSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabBiotaDatabaseSearchFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabBiotaDatabaseSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
