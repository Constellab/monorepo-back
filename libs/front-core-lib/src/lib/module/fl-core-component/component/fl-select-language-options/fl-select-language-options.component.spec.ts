import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlSelectLanguageOptionsComponent } from './fl-select-language-options.component';

describe('SelectLanguageOptionsComponent', () => {
  let component: FlSelectLanguageOptionsComponent;
  let fixture: ComponentFixture<FlSelectLanguageOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlSelectLanguageOptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FlSelectLanguageOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
