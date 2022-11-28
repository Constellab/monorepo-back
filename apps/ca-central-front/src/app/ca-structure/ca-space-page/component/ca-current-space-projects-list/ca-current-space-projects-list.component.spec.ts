import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaCurrentSpaceProjectsListComponent} from './ca-current-space-projects-list.component';

describe('CaCurrentSpaceProjectsListComponent', () => {
  let component: CaCurrentSpaceProjectsListComponent;
  let fixture: ComponentFixture<CaCurrentSpaceProjectsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaCurrentSpaceProjectsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaCurrentSpaceProjectsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
