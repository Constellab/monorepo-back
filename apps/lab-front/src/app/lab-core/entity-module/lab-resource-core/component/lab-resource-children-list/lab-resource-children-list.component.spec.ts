import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceChildrenListComponent} from './lab-resource-children-list.component';

describe('LabResourceChildrenListComponent', () => {
  let component: LabResourceChildrenListComponent;
  let fixture: ComponentFixture<LabResourceChildrenListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceChildrenListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResourceChildrenListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
