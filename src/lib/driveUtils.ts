/* eslint-disable @typescript-eslint/no-explicit-any */
// driveUtils.ts
import type { gapi as GapiType } from 'gapi-script';

declare const gapi: typeof GapiType;
declare const google: any; // No official types for picker, keep as any for now

const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const API_KEY = 'YOUR_GOOGLE_API_KEY';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

let oauthToken: string | null = null;
let pickerInited = false;

export async function initGoogleApi(): Promise<void> {
  try {
    await new Promise<void>((resolve, reject) => {
      gapi.load('client:auth2:picker', {
        callback: resolve,
        onerror: () => reject(new Error('Failed to load gapi libraries')),
        timeout: 5000,
        ontimeout: () => reject(new Error('Timeout loading gapi libraries')),
      });
    });

    await gapi.client.init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    });
  } catch (error) {
    console.error('Error initializing Google API client:', error);
    throw error;
  }
}

export async function signIn(): Promise<void> {
  try {
    const auth = gapi.auth2.getAuthInstance();
    if (!auth) throw new Error('Google Auth instance not found');

    await auth.signIn();
    const currentUser = auth.currentUser.get();
    const authResponse = currentUser.getAuthResponse(true);
    oauthToken = authResponse.access_token;
  } catch (error) {
    console.error('Google sign-in failed:', error);
    throw error;
  }
}

export async function uploadToDrive(content: string, name: string): Promise<void> {
  if (!oauthToken) {
    throw new Error('OAuth token is missing, user may not be signed in');
  }

  const boundary = 'foo_bar_baz';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name,
    mimeType: 'application/json',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter;

  try {
    await gapi.client.request({
      path: '/upload/drive/v3/files',
      method: 'POST',
      params: { uploadType: 'multipart' },
      headers: {
        Authorization: `Bearer ${oauthToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}

export function openPicker(): Promise<{ id: string } | null> {
  return new Promise((resolve, reject) => {
    if (!oauthToken) {
      reject(new Error('OAuth token is missing, user must sign in first'));
      return;
    }

    if (!pickerInited) {
      google.picker.load('picker', () => {
        pickerInited = true;
        createPicker(resolve);
      });
    } else {
      createPicker(resolve);
    }
  });
}

function createPicker(resolve: (value: { id: string } | null) => void) {
  const view = new google.picker.View(google.picker.ViewId.DOCUMENTS);
  view.setMimeTypes('application/json');

  const picker = new google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(oauthToken)
    .setDeveloperKey(API_KEY)
    .setCallback((data: any) => {
      if (data.action === google.picker.Action.PICKED) {
        resolve({ id: data.docs[0].id });
      } else {
        resolve(null);
      }
    })
    .build();

  picker.setVisible(true);
}

export async function downloadFromDrive(fileId: string): Promise<string> {
  if (!oauthToken) {
    throw new Error('OAuth token is missing, user must sign in first');
  }

  try {
    // Make sure Drive API is loaded before calling it
    await gapi.client.load('drive', 'v3');

    const response = await gapi.client.drive.files.get({
      fileId,
      alt: 'media',
    });

    // The file content may be in response.body or response.result depending on gapi version
    return (response.body as string) || (response.result as string);
  } catch (error) {
    console.error('Error downloading from Google Drive:', error);
    throw error;
  }
}

