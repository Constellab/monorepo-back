import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaDocumentActionsMenuComponent} from './ca-document-actions-menu.component';

describe('CaDocumentActionsMenuComponent', () => {
  let component: CaDocumentActionsMenuComponent;
  let fixture: ComponentFixture<CaDocumentActionsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaDocumentActionsMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaDocumentActionsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
