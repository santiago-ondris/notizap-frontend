export interface ProblemDetails {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    traceId?: string;
  }
  
  export class ApiError extends Error {
    public traceId?: string;
    public status?: number;
    public detail?: string;
  
    constructor(problemDetails: ProblemDetails) {
      super(problemDetails.detail || problemDetails.title || 'Error desconocido');
      this.name = 'ApiError';
      this.traceId = problemDetails.traceId;
      this.status = problemDetails.status;
      this.detail = problemDetails.detail;
    }
  }