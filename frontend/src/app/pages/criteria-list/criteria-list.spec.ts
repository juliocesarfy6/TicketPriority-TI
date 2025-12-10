import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriteriaList } from './criteria-list';

describe('CriteriaList', () => {
  let component: CriteriaList;
  let fixture: ComponentFixture<CriteriaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriteriaList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriteriaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
