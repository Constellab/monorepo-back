import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDocumentDetailPageComponent} from './ca-document-detail-page.component';

describe('CaDocumentDetailPageComponent', () => {
  let component: CaDocumentDetailPageComponent;
  let fixture: ComponentFixture<CaDocumentDetailPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDocumentDetailPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaDocumentDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
