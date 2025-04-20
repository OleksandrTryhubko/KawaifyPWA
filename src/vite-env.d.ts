/// <reference types="vite/client" />
declare module 'virtual:pwa-register' {
    export interface RegisterSWOptions {
      immediate?: boolean
      onNeedRefresh?: () => void
      onOfflineReady?: () => void
      onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void
      onRegisterError?: (error: any) => void
    }
declare module "*.png" {
const src: string;
    export default src;
    }    
  
    export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => void
  }