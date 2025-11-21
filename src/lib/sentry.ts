// src/lib/sentry.ts
import * as Sentry from "@sentry/react";
import { browserTracingIntegration, replayIntegration } from "@sentry/react";

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.VITE_ENVIRONMENT || "development";

  // Only initialize Sentry if DSN is provided and not in development
  if (!dsn || environment === "development") {
    console.log("Sentry not initialized (development mode or missing DSN)");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    integrations: [
      browserTracingIntegration(),
      replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Move tracePropagationTargets to the root level
    tracePropagationTargets: [
      "localhost",
      /^https:\/\/.*\.web\.app$/,
      /^https:\/\/.*\.firebaseapp\.com$/,
    ],

    // Performance Monitoring
    tracesSampleRate: environment === "production" ? 0.1 : 1.0,

    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% on errors

    beforeSend(event, hint) {
      const error = hint?.originalException;
      if (error && typeof error === "object" && "message" in error) {
        const message = String((error as Error).message);
        if (
          message.includes("NetworkError") ||
          message.includes("Failed to fetch") ||
          message.includes("Load failed")
        ) {
          return null;
        }
      }
      return event;
    },

    beforeBreadcrumb(breadcrumb) {
      if (breadcrumb.category === "console") {
        return null;
      }
      return breadcrumb;
    },
  });
};

// Helper functions
export const logError = (error: Error, context?: Record<string, unknown>) => {
  console.error("Error:", error, context);
  if (import.meta.env.VITE_ENVIRONMENT !== "development") {
    Sentry.captureException(error, { extra: context });
  }
};

export const setUserContext = (user: {
  uid: string;
  email?: string | null;
  displayName?: string | null;
}) => {
  if (import.meta.env.VITE_ENVIRONMENT !== "development") {
    Sentry.setUser({
      id: user.uid,
      email: user.email || undefined,
      username: user.displayName || undefined,
    });
  }
};

export const clearUserContext = () => {
  if (import.meta.env.VITE_ENVIRONMENT !== "development") {
    Sentry.setUser(null);
  }
};