import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstancesListComponent} from './ca-lab-instances-list.component';

describe('LabInstancesListComponent', () => {
  let component: CaLabInstancesListComponent;
  let fixture: ComponentFixture<CaLabInstancesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstancesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabInstancesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
