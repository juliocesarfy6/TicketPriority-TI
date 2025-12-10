import { TestBed } from '@angular/core/testing';

import { Criteria } from './criteria';

describe('Criteria', () => {
  let service: Criteria;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Criteria);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
