import { HttpInterceptorFn } from '@angular/common/http';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Add cache control headers for API requests
  if (req.url.includes('/api/')) {
    const cachedReq = req.clone({
      headers: req.headers
        .set('Cache-Control', 'max-age=300, must-revalidate') // 5 minutes cache
        .set('Accept-Encoding', 'gzip, deflate, br')
    });
    return next(cachedReq);
  }
  
  return next(req);
};