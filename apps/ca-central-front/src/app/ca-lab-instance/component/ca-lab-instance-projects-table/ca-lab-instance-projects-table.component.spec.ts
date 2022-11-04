import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceProjectsTableComponent} from './ca-lab-instance-projects-table.component';

describe('CaLabInstanceProjectsTableComponent', () => {
  let component: CaLabInstanceProjectsTableComponent;
  let fixture: ComponentFixture<CaLabInstanceProjectsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceProjectsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceProjectsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
