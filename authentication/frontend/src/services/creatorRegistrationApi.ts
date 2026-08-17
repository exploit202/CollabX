export interface CreatorRegistrationPayload {
  fullName: string;
  email: string;
  phoneNumber: string;
  primaryContentNiche: string;
  password: string;
  confirmPassword: string;
}

export interface CreatorRegistrationResponse {
  userId: string;
  fullName: string;
  email: string;
  role: 'creator';
}

export interface CreatorPlatformEntry {
  platform: 'instagram' | 'youtube' | 'twitter';
  link?: string;
}

export interface CreatorPlatformsPayload {
  platforms: (string | CreatorPlatformEntry)[];
}

export interface CreatorPlatformsResponse {
  profile?: {
    platforms?: (string | CreatorPlatformEntry)[];
  };
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
    return 'Unable to create creator account right now.';
  } catch {
    return 'Unable to create creator account right now.';
  }
};

export const registerCreatorAccount = async (
  payload: CreatorRegistrationPayload,
): Promise<CreatorRegistrationResponse> => {
  const response = await fetch('/api/creator/register', {
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

export interface CreatorLoginPayload {
  email: string;
  password: string;
}

export const loginCreatorAccount = async (
  payload: CreatorLoginPayload
): Promise<CreatorRegistrationResponse> => {
  const response = await fetch('/api/creator/login', {
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

export const updateCreatorPlatforms = async (
  platforms: (string | CreatorPlatformEntry)[]
): Promise<CreatorPlatformsResponse> => {
  const response = await fetch('/api/creator/profile/platforms', {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ platforms } satisfies CreatorPlatformsPayload),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  const json = await response.json();
  return json.data;
};

export interface PlatformVerifyResponse {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
  };
}

export const verifyCreatorPlatformUrl = async (
  platform: 'instagram' | 'youtube' | 'twitter',
  url: string,
): Promise<PlatformVerifyResponse> => {
  const response = await fetch('/api/creator/platform/verify', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ platform, url }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
};

export const requestCreatorOtp = async (): Promise<{ success: boolean; message: string }> => {
  const response = await fetch('/api/creator/otp/send', {
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

export const verifyCreatorOtp = async (otp: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch('/api/creator/otp/verify', {
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
