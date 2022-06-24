import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBrickVersionDetailComponent} from './ca-brick-version-detail.component';

describe('CaBrickVersionDetailComponent', () => {
  let component: CaBrickVersionDetailComponent;
  let fixture: ComponentFixture<CaBrickVersionDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBrickVersionDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaBrickVersionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
