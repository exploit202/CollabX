export interface BrandRegistrationPayload {
  companyName: string;
  workEmail: string;
  password: string;
  industryType?: string;
  aboutBrand?: string;
}

export interface BrandRegistrationResponse {
  userId: string;
  companyName: string;
  email: string;
  role: 'brand';
}

const parseErrorMessage = async (response: Response) => {
  try {
    const data = await response.json();
    if (Array.isArray(data?.error?.details) && data.error.details.length > 0) {
      return data.error.details.map((d: { message: string }) => d.message).join('. ');
    }
    if (typeof data?.message === 'string') return data.message;
    if (typeof data?.error === 'string') return data.error;
    if (typeof data?.errors === 'string') return data.errors;
    return 'Unable to create brand account right now.';
  } catch {
    return 'Unable to create brand account right now.';
  }
};

export const registerBrandAccount = async (
  payload: BrandRegistrationPayload
): Promise<BrandRegistrationResponse> => {
  const response = await fetch('/api/brand/auth/register', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const json = await response.json();
  return json.data.user;
};

export const requestBrandOtpApi = async (): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await fetch('/api/brand/auth/otp/send', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const verifyBrandOtpApi = async (otp: string): Promise<{ success: boolean; message: string; data?: any }> => {
  const response = await fetch('/api/brand/auth/otp/verify', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ otp }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
};
