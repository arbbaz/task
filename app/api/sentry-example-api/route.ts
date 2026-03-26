import * as Sentry from "@sentry/nextjs";
export const dynamic = "force-dynamic";

class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}

class SentryExampleValidationError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleValidationError";
  }
}

class SentryExampleDatabaseError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleDatabaseError";
  }
}

function crashByType(type: string) {
  if (type === "validation") {
    throw new SentryExampleValidationError(
      "Validation failed in API test route (sample).",
    );
  }

  if (type === "database") {
    throw new SentryExampleDatabaseError(
      "Database operation failed in API test route (sample).",
    );
  }

  if (type === "nested") {
    const parseNestedPayload = () => {
      const saveNestedPayload = () => {
        throw new SentryExampleAPIError(
          "Nested backend error for source map testing.",
        );
      };
      saveNestedPayload();
    };
    parseNestedPayload();
    return;
  }
}

// A faulty API route to test Sentry's error monitoring
export function GET(request: Request) {
  Sentry.logger.info("Sentry example API called");
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "default";

  crashByType(type);

  throw new SentryExampleAPIError(
    "This error is raised on the backend called by the example page.",
  );
}
