import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CaLabsCatalogComponent} from './ca-labs-catalog.component';

describe('LabsListComponent', () => {
  let component: CaLabsCatalogComponent;
  let fixture: ComponentFixture<CaLabsCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CaLabsCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CaLabsCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
