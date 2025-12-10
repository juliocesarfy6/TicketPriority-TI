import { TestBed } from '@angular/core/testing';

import { Saw } from './saw';

describe('Saw', () => {
  let service: Saw;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Saw);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
