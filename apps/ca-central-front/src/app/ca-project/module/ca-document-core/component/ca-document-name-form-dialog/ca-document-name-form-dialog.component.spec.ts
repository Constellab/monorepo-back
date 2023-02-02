import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDocumentNameFormDialogComponent} from './ca-document-name-form-dialog.component';

describe('CaDocumentNameFormDialogComponent', () => {
  let component: CaDocumentNameFormDialogComponent;
  let fixture: ComponentFixture<CaDocumentNameFormDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDocumentNameFormDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaDocumentNameFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
