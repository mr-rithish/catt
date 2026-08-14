import { AttendanceResponse } from '../types/attendance';

export class ApiError extends Error {
  newCaptcha?: string;
  newSessionToken?: string;

  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Step 1: start login and get captcha
export async function startLogin(): Promise<{ captchaImage: string; sessionToken: string }> {
  try {
    const response = await fetch('https://vce-ckdjcdajdfgedhcm.centralindia-01.azurewebsites.net/start_login');
    if (!response.ok) {
      throw new ApiError('Failed to fetch captcha');
    }
    const data = await response.json();
    return {
      captchaImage: `data:image/png;base64,${data.captcha_image_base64}`,
      sessionToken: data.session_token,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Failed to start login.');
  }
}

// Step 2: complete login with HTNO, password, and captcha
export async function completeLogin(
  htno: string,
  password: string,
  captcha: string,
  sessionToken: string
): Promise<AttendanceResponse> {
  let response: Response;
  let data: any;

  try {
    response = await fetch('https://vce-ckdjcdajdfgedhcm.centralindia-01.azurewebsites.net/complete_login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ htno, password, captcha, session_token: sessionToken }),
    });

    data = await response.json();
  } catch (error) {
    throw new ApiError('Network error. Please check your connection and try again.');
  }

  // 401 = wrong credentials or captcha — session still alive, new captcha returned
  if (response.status === 401) {
    const err = new ApiError(data.detail || 'Invalid credentials or captcha', 401);
    // Attach new captcha so LoginPage can swap image without a full reset
    if (data.new_captcha && data.session_token) {
      err.newCaptcha = `data:image/png;base64,${data.new_captcha}`;
      err.newSessionToken = data.session_token;
    }
    throw err;
  }

  // 400 = session token not found or expired — need full reset
  if (response.status === 400) {
    throw new ApiError('Session expired. Please refresh the captcha and try again.', 400);
  }

  if (!response.ok) {
    throw new ApiError(data.detail || 'Login failed. Please try again.', response.status);
  }

  return data as AttendanceResponse;
}