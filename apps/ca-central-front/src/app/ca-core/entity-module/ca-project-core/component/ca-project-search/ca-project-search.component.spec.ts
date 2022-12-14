import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectSearchComponent} from './ca-project-search.component';

describe('CaProjectSearchComponent', () => {
  let component: CaProjectSearchComponent;
  let fixture: ComponentFixture<CaProjectSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectSearchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
