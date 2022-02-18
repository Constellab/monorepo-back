import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaBrickVersionSelectOptionsComponent} from './ca-brick-version-select-options.component';

describe('CaBrickVersionSelectOptionsComponent', () => {
  let component: CaBrickVersionSelectOptionsComponent;
  let fixture: ComponentFixture<CaBrickVersionSelectOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaBrickVersionSelectOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaBrickVersionSelectOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
