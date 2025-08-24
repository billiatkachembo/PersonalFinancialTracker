// src/global.d.ts
export {};

declare global {
  interface Window {
    __APP_LOADED__?: boolean;
  }
}
