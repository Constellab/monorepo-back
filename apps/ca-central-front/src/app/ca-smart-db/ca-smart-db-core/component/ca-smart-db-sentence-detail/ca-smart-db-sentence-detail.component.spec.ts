import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaSmartDbSentenceDetailComponent} from './ca-smart-db-sentence-detail.component';

describe('CaSmartDbSentenceDetailComponent', () => {
  let component: CaSmartDbSentenceDetailComponent;
  let fixture: ComponentFixture<CaSmartDbSentenceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaSmartDbSentenceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaSmartDbSentenceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
