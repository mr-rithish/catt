import { AttendanceResponse } from '../types/attendance';

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchStudentData(htno: string, password: string): Promise<AttendanceResponse> {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!baseUrl) {
      throw new ApiError('API base URL not configured');
    }
    
    const url = `${baseUrl}/get_student_data?htno=${htno}&password=${password}`;
    
    console.log('Fetching attendance data...');
    
    const response = await fetch(url, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new ApiError('Invalid HTNO or password');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Login failed. Please check your credentials.');
  }
}