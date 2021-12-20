import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaThemeSelectionComponent} from './ca-theme-selection.component';

describe('ThemeSelectionComponent', () => {
  let component: CaThemeSelectionComponent;
  let fixture: ComponentFixture<CaThemeSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaThemeSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaThemeSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
