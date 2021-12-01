import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioxResourceVennDiagramComponent } from './biox-resource-venn-diagram.component';

describe('BioxResoueceVennDiagramComponent', () => {
  let component: BioxResourceVennDiagramComponent;
  let fixture: ComponentFixture<BioxResourceVennDiagramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioxResourceVennDiagramComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioxResourceVennDiagramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
