import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabResourceViewSpecListComponent} from './lab-resource-view-spec-list.component';

describe('LabResourceViewSpecListComponent', () => {
  let component: LabResourceViewSpecListComponent;
  let fixture: ComponentFixture<LabResourceViewSpecListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabResourceViewSpecListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LabResourceViewSpecListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
