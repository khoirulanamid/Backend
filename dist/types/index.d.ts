import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email: string;
        role: 'ADMIN' | 'PENGHUNI';
    };
}
//# sourceMappingURL=index.d.ts.map