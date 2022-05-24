import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabViewResourcesListComponent} from './lab-view-resources-list.component';

describe('LabResourcesListComponent', () => {
  let component: LabViewResourcesListComponent;
  let fixture: ComponentFixture<LabViewResourcesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabViewResourcesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabViewResourcesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
