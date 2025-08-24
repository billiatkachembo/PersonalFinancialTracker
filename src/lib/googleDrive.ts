// googleDrive.ts
import { gapi } from 'gapi-script';

const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

export async function initGapi(clientId: string, apiKey: string): Promise<void> {
  try {
    await new Promise<void>((resolve, reject) => {
      gapi.load('client:auth2', {
        callback: resolve,
        onerror: () => reject(new Error('Failed to load gapi client')),
        timeout: 5000,
        ontimeout: () => reject(new Error('Loading gapi client timed out')),
      });
    });

    await gapi.client.init({
      clientId,
      apiKey,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    });
  } catch (error) {
    console.error('Error initializing Google API client:', error);
    throw error;
  }
}

export async function signInGoogle(): Promise<gapi.auth2.GoogleUser> {
  try {
    const auth = gapi.auth2.getAuthInstance();
    if (!auth) throw new Error('Google Auth instance not found');
    return await auth.signIn();
  } catch (error) {
    console.error('Google sign-in failed:', error);
    throw error;
  }
}

export function getProfileEmail(): string | null {
  try {
    const auth = gapi.auth2.getAuthInstance();
    if (!auth) throw new Error('Google Auth instance not found');
    const user = auth.currentUser.get();
    return user.getBasicProfile().getEmail();
  } catch (error) {
    console.error('Failed to get profile email:', error);
    return null;
  }
}

export async function uploadToDrive(blob: Blob, fileName: string): Promise<{ id: string }> {
  try {
    const token = gapi.auth.getToken()?.access_token;
    if (!token) throw new Error('No OAuth token found, user might not be signed in');

    const metadata = { name: fileName, mimeType: blob.type };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Upload failed: ${res.status} ${res.statusText} - ${errorBody}`);
    }

    return res.json();
  } catch (error) {
    console.error('Error uploading file to Drive:', error);
    throw error;
  }
}
