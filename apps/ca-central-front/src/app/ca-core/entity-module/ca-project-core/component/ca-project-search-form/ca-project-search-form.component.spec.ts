import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectSearchFormComponent} from './ca-project-search-form.component';

describe('CaProjectSearchFormComponent', () => {
  let component: CaProjectSearchFormComponent;
  let fixture: ComponentFixture<CaProjectSearchFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectSearchFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectSearchFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
