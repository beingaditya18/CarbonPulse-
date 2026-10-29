/**
 * @fileoverview API and validation request/response interfaces
 */

export interface ValidationResult {
  valid: boolean;
  reason: 'FILE_TOO_LARGE' | 'INVALID_FILE_TYPE' | 'UNSUPPORTED_FILE_TYPE' | null;
}

export interface ChatApiRequest {
  messages: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  userLogs?: {
    id: string;
    category: string;
    emission_amount: number;
    source: string;
    description: string;
    logged_date: string;
  }[];
}
