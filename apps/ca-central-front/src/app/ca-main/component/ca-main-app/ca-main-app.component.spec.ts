import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaMainAppComponent} from './ca-main-app.component';

describe('MainAppComponent', () => {
  let component: CaMainAppComponent;
  let fixture: ComponentFixture<CaMainAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaMainAppComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaMainAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
