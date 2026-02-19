/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly MODE: string;
    readonly VITE_APP_VERSION?: string;
    readonly VITE_SENTRY_DSN?: string;
    readonly VITE_DATADOG_CLIENT_TOKEN?: string;
    readonly VITE_DATADOG_APPLICATION_ID?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
