import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDocumentTableComponent} from './ca-document-table.component';

describe('CaDocumentTableComponent', () => {
  let component: CaDocumentTableComponent;
  let fixture: ComponentFixture<CaDocumentTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDocumentTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaDocumentTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
