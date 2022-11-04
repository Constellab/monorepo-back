import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabInstanceProjectsListComponent} from './ca-lab-instance-projects-list.component';

describe('CaLabInstanceProjectsListComponent', () => {
  let component: CaLabInstanceProjectsListComponent;
  let fixture: ComponentFixture<CaLabInstanceProjectsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabInstanceProjectsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaLabInstanceProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
