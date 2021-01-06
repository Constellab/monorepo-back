import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabInstancesListComponent} from './lab-instances-list.component';

describe('LabInstancesListComponent', () => {
  let component: LabInstancesListComponent;
  let fixture: ComponentFixture<LabInstancesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabInstancesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabInstancesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
