import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaProjectDocumentsListComponent} from './ca-project-documents-list.component';

describe('CaProjectDocumentsListComponent', () => {
  let component: CaProjectDocumentsListComponent;
  let fixture: ComponentFixture<CaProjectDocumentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaProjectDocumentsListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CaProjectDocumentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
