import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbVerifySentenceComponent} from './ca-smart-db-verify-sentence.component';

describe('CaSmartDbVerifySentenceComponent', () => {
  let component: CaSmartDbVerifySentenceComponent;
  let fixture: ComponentFixture<CaSmartDbVerifySentenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbVerifySentenceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbVerifySentenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
