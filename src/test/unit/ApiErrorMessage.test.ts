import { ApiError } from "../../infra/api/client";
import { describeApiError, getApiErrorCode } from "../../lib/errors/apiErrorMessage";

describe("describeApiError", () => {
  it("uses known code mapping when available", () => {
    const error = new ApiError(401, {
      error: "AUTH.INVALID_CREDENTIALS",
      message: "any",
    });

    expect(describeApiError(error, "fallback")).toBe(
      "Invalid credentials. Check your email and password and try again.",
    );
  });

  it("returns network-friendly message for transport failures", () => {
    const error = new Error("Network request failed: GET /api/v1/users. dns");

    expect(describeApiError(error, "fallback")).toBe(
      "Network connection failed. Check your internet connection and try again.",
    );
  });

  it("uses status fallback when message is technical", () => {
    const error = new ApiError(400, {
      error: "SOME_CODE",
      message: "API request failed with status 400",
    });

    expect(describeApiError(error, "fallback")).toBe(
      "Some input values are invalid. Please review and try again.",
    );
  });

  it("returns safe custom message for conflicts", () => {
    const error = new ApiError(409, {
      message: "Galaxy name already exists",
    });

    expect(describeApiError(error, "fallback")).toBe("Galaxy name already exists");
  });

  it("extracts API error codes for flow-specific handling", () => {
    const error = new ApiError(401, {
      error: "USERS.EMAIL_NOT_VERIFIED",
      message: "Email is not verified",
    });

    expect(getApiErrorCode(error)).toBe("USERS.EMAIL_NOT_VERIFIED");
  });
});
