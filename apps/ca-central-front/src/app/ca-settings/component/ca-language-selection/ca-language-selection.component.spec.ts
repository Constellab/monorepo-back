import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLanguageSelectionComponent} from './ca-language-selection.component';

describe('LanguageSelectionComponent', () => {
  let component: CaLanguageSelectionComponent;
  let fixture: ComponentFixture<CaLanguageSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLanguageSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLanguageSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
