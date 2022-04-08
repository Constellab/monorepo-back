import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HaPublicSidenavImportTecDocDialogComponent } from './ha-public-sidenav-import-tec-doc-dialog.component';

describe('HaPublicSidenavImportTecDocDialogComponent', () => {
  let component: HaPublicSidenavImportTecDocDialogComponent;
  let fixture: ComponentFixture<HaPublicSidenavImportTecDocDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HaPublicSidenavImportTecDocDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HaPublicSidenavImportTecDocDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
