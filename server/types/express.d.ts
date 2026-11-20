declare global {
  namespace Express {
    interface Request {
      // Set by requireAuth; read only on routes that use it.
      userId: number;
    }
  }
}

export {};