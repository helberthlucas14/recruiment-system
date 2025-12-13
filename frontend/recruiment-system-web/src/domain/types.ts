export const Role = {
  CANDIDATE: 'CANDIDATE',
  RECRUITER: 'RECRUITER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  requirements?: string;
  salary?: string;
  status: 'OPEN' | 'CLOSED';
  created_at?: string;
  recruiter_id?: number;
  recruiter_email?: string;
  anonymous?: boolean;
}

export interface Application {
  id: number;
  job_id: number;
  candidate_id: number;
  candidate_name?: string;
  candidate?: { id?: number; name?: string; email?: string };
  status: string;
  job_title: string;
  company: string;
  location: string;
  applied_at: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Input Types
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface CreateJobInput {
  title: string;
  description: string;
  company: string;
  location: string;
  requirements?: string;
  salary?: string;
}

export interface PaginationInput {
  page?: number;
  limit?: number;
  q?: string;
}

export interface DashboardStats {
  applied: number;
  pending: number;
}

export interface RecruiterStats {
  total_jobs: number;
  open_jobs: number;
  closed_jobs: number;
  total_applications: number;
}
