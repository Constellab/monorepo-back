import {ComponentFixture, TestBed} from '@angular/core/testing';

import {LabsCatalogComponent} from './labs-catalog.component';

describe('LabsListComponent', () => {
  let component: LabsCatalogComponent;
  let fixture: ComponentFixture<LabsCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LabsCatalogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LabsCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
