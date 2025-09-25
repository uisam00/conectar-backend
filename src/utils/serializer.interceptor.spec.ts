import { ResolvePromisesInterceptor } from './serializer.interceptor';
import { of } from 'rxjs';

describe('ResolvePromisesInterceptor', () => {
  it('should resolve promises in response data', async () => {
    const interceptor = new ResolvePromisesInterceptor();
    const ctx: any = {};
    const next: any = {
      handle: () => of({ a: Promise.resolve(1), b: [Promise.resolve(2)] }),
    };

    const result = await interceptor.intercept(ctx as any, next as any).toPromise();
    expect(result).toEqual({ a: 1, b: [2] });
  });
});


