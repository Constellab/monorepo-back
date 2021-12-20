import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DaProjectInfoComponent} from './da-project-info.component';

describe('ProjectInfoComponent', () => {
  let component: DaProjectInfoComponent;
  let fixture: ComponentFixture<DaProjectInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DaProjectInfoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DaProjectInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
