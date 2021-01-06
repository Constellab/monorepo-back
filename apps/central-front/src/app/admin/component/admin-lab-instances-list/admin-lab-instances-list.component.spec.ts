import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AdminLabInstancesListComponent} from './admin-lab-instances-list.component';

describe('AdminLabInstancesListComponent', () => {
  let component: AdminLabInstancesListComponent;
  let fixture: ComponentFixture<AdminLabInstancesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminLabInstancesListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLabInstancesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
