import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectTableComponent} from './ca-project-table.component';

describe('CaProjectTableComponent', () => {
  let component: CaProjectTableComponent;
  let fixture: ComponentFixture<CaProjectTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
