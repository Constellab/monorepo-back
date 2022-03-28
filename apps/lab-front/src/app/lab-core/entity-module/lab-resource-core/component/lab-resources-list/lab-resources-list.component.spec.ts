import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourcesListComponent} from './lab-resources-list.component';

describe('LabResourcesListComponent', () => {
  let component: LabResourcesListComponent;
  let fixture: ComponentFixture<LabResourcesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourcesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabResourcesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
