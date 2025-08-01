/**
 * TypeScript definitions for Creeble SDK
 */

export interface CreebleConfig {
  enableCache?: boolean;
  cacheTTL?: number;
  timeout?: number;
}

export interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_more_pages: boolean;
  next_page?: number;
  prev_page?: number;
  is_last_page: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  pagination?: PaginationInfo;
  meta?: {
    endpoint: string;
    request_id: string;
    response_time_ms: number;
  };
}

export interface DataItem {
  id: string;
  title: string;
  database?: string;
  database_id?: string;
  content?: string;
  html_content?: string;
  properties?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  notion_url?: string;
}

export interface FormSchema {
  properties: Record<string, FormField>;
  required?: string[];
}

export interface FormField {
  type: 'text' | 'email' | 'url' | 'number' | 'phone_number' | 'select' | 'multiselect';
  required?: boolean;
  options?: string[];
  validation?: Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
}

export interface RequestInterceptor {
  (url: URL, options: RequestInit): Promise<{ url: URL; options: RequestInit }> | { url: URL; options: RequestInit };
}

export interface ResponseInterceptor {
  (response: any): Promise<any> | any;
}

export interface ErrorInterceptor {
  (error: Error): Promise<Error> | Error | void;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  [key: string]: any;
}

// Main Classes
export declare class Creeble {
  constructor(apiKey: string, baseUrl?: string, options?: CreebleConfig);
  
  data: Data;
  projects: Projects;
  forms: Forms;
  client: Client;
  
  ping(): Promise<any>;
  version(): Promise<any>;
  endpoint(name: string): EndpointHelper;
  
  // Database helpers
  getRowsByDatabase(endpoint: string, databaseName: string): Promise<DataItem[]>;
  getRowsByDatabasePaginated(endpoint: string, databaseName: string, options?: PaginationOptions): Promise<ApiResponse<DataItem[]>>;
  getAllRowsByDatabase(endpoint: string, databaseName: string, filters?: Record<string, any>): Promise<DataItem[]>;
  getDatabases(endpoint: string): Promise<DataItem[]>;
  getDatabaseNames(endpoint: string): Promise<string[]>;
  getRowByField(endpoint: string, databaseName: string, field: string, value: any): Promise<DataItem | null>;
  getAllRows(endpoint: string): Promise<DataItem[]>;
  
  static simplifyItem(item: DataItem): Record<string, any>;
}

export declare class Data {
  constructor(client: Client);
  
  list(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  get(endpoint: string, id: string): Promise<ApiResponse<DataItem>>;
  search(endpoint: string, query: string, filters?: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  paginate(endpoint: string, page?: number, limit?: number, filters?: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  getAllPages(endpoint: string, filters?: Record<string, any>, limit?: number): Promise<DataItem[]>;
  getNextPage(currentResponse: ApiResponse<DataItem[]>, filters?: Record<string, any>): Promise<ApiResponse<DataItem[]> | null>;
  getPrevPage(currentResponse: ApiResponse<DataItem[]>, filters?: Record<string, any>): Promise<ApiResponse<DataItem[]> | null>;
  hasMorePages(response: ApiResponse<DataItem[]>): boolean;
  isLastPage(response: ApiResponse<DataItem[]>): boolean;
  filter(endpoint: string, filters: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  sortBy(endpoint: string, field: string, direction?: 'asc' | 'desc', filters?: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  recent(endpoint: string, limit?: number): Promise<ApiResponse<DataItem[]>>;
  findBy(endpoint: string, field: string, value: any, type?: 'pages' | 'rows'): Promise<DataItem | null>;
  findPageBy(endpoint: string, field: string, value: any): Promise<DataItem | null>;
  findRowBy(endpoint: string, field: string, value: any): Promise<DataItem | null>;
  exists(endpoint: string, id: string): Promise<boolean>;
}

export declare class Forms {
  constructor(client: Client);
  
  getForm(endpoint: string, formSlug: string): Promise<any>;
  submit(endpoint: string, formSlug: string, formData: Record<string, any>): Promise<any>;
  getSchema(endpoint: string, formSlug: string): Promise<FormSchema>;
  validateFormData(schema: FormSchema, formData: Record<string, any>): ValidationResult;
  submitWithValidation(endpoint: string, formSlug: string, formData: Record<string, any>): Promise<any>;
}

export declare class Projects {
  constructor(client: Client);
  
  info(endpoint: string): Promise<any>;
  schema(endpoint: string): Promise<any>;
}

export declare class Client {
  constructor(apiKey: string, baseUrl: string, options?: CreebleConfig);
  
  addRequestInterceptor(interceptor: RequestInterceptor): number;
  addResponseInterceptor(interceptor: ResponseInterceptor): number;
  addErrorInterceptor(interceptor: ErrorInterceptor): number;
  removeInterceptor(type: 'request' | 'response' | 'error', index: number): void;
  
  get(uri: string, params?: Record<string, any>): Promise<any>;
  post(uri: string, data?: Record<string, any>): Promise<any>;
  put(uri: string, data?: Record<string, any>): Promise<any>;
  delete(uri: string): Promise<any>;
}

export interface EndpointHelper {
  list(params?: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  get(id: string): Promise<ApiResponse<DataItem>>;
  search(query: string, filters?: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  paginate(page?: number, limit?: number, filters?: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  filter(filters: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  sortBy(field: string, direction?: 'asc' | 'desc', filters?: Record<string, any>): Promise<ApiResponse<DataItem[]>>;
  recent(limit?: number): Promise<ApiResponse<DataItem[]>>;
  findBy(field: string, value: any, type?: 'pages' | 'rows'): Promise<DataItem | null>;
  findPageBy(field: string, value: any): Promise<DataItem | null>;
  findRowBy(field: string, value: any): Promise<DataItem | null>;
  exists(id: string): Promise<boolean>;
  
  // Database helpers
  getRowsByDatabase(databaseName: string): Promise<DataItem[]>;
  getRowsByDatabasePaginated(databaseName: string, options?: PaginationOptions): Promise<ApiResponse<DataItem[]>>;
  getAllRowsByDatabase(databaseName: string, filters?: Record<string, any>): Promise<DataItem[]>;
  getDatabases(): Promise<DataItem[]>;
  getDatabaseNames(): Promise<string[]>;
  getRowByField(databaseName: string, field: string, value: any): Promise<DataItem | null>;
  getAllRows(): Promise<DataItem[]>;
  
  // Pagination helpers
  getAllPages(filters?: Record<string, any>, limit?: number): Promise<DataItem[]>;
  getNextPage(currentResponse: ApiResponse<DataItem[]>, filters?: Record<string, any>): Promise<ApiResponse<DataItem[]> | null>;
  getPrevPage(currentResponse: ApiResponse<DataItem[]>, filters?: Record<string, any>): Promise<ApiResponse<DataItem[]> | null>;
  hasMorePages(response: ApiResponse<DataItem[]>): boolean;
  isLastPage(response: ApiResponse<DataItem[]>): boolean;
}

// Exceptions
export declare class CreebleException extends Error {
  statusCode?: number;
  originalError?: Error;
  constructor(message: string, statusCode?: number, originalError?: Error);
}

export declare class AuthenticationException extends CreebleException {}
export declare class ValidationException extends CreebleException {
  errors: Record<string, string[]>;
  constructor(message: string, errors?: Record<string, string[]>);
}
export declare class RateLimitException extends CreebleException {
  retryAfter: number;
  constructor(message: string, retryAfter?: number);
}

// Models
export declare class BaseModel {
  constructor(data?: Record<string, any>);
  toObject(): Record<string, any>;
  toJSON(): string;
  has(property: string): boolean;
  get(property: string, defaultValue?: any): any;
}

export declare class DataItem extends BaseModel {
  getId(): string;
  getTitle(): string;
  getDescription(): string;
  getProperties(): Record<string, any>;
  getProperty(key: string, defaultValue?: any): any;
  getUrl(): string;
  getCreatedAt(): Date | null;
  getLastModified(): Date | null;
}

export default Creeble;