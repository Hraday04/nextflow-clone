"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  url: string;
  ssl_url: string;
  name: string;
  size: number;
  type: string;
  meta?: any;
}

interface TransloaditUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: UploadResult | null;
}

export const useTransloaditUpload = () => {
  const [uploadState, setUploadState] = useState<TransloaditUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const uploadFile = useCallback(
    async (file: File, fileType: "image" | "video") => {
      setUploadState({
        isUploading: true,
        progress: 0,
        error: null,
        result: null,
      });

      try {
        // Get upload signature from our API
        const signatureResponse = await fetch("/api/transloadit/signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileType,
            fileExt: file.name.split(".").pop() || "",
            mimeType: file.type || undefined,
          }),
        });

        if (!signatureResponse.ok) {
          throw new Error("Failed to get upload signature");
        }

        const { params, signature, endpoint } = await signatureResponse.json();

        // Create FormData for the upload
        const formData = new FormData();

        // Strict parameter enforcement. By strictly piping what the backend gave,
        // we eliminate any signature errors associated with frontend manipulation.
        let paramsString = params;

        if (typeof paramsString !== "string") {
          paramsString = JSON.stringify(paramsString);
        }

        // Ensure UTF-8 characters are explicitly passed correctly to matching form boundaries
        formData.append("params", paramsString);
        formData.append("signature", signature);
        formData.append("file", file);

        return new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Use the default API endpoint universally to prevent undefined router crashing
          const endpoint = "https://api2.transloadit.com/assemblies";

          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const progress = (event.loaded / event.total) * 100;
              setUploadState((prev) => ({ ...prev, progress }));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status === 200) {
              try {
                const response = JSON.parse(xhr.responseText);

                if (response.ok === "ASSEMBLY_COMPLETED") {
                  // Assembly completed immediately
                  const results = response.results;
                  const processedFile =
                    fileType === "image"
                      ? results.optimize?.[0] ||
                        results.resize?.[0] ||
                        results[":original"]?.[0] // Fixed: use ":original" key
                      : results.encode?.[0] || results[":original"]?.[0]; // Fixed: use ":original" key

                  if (processedFile) {
                    const result: UploadResult = {
                      url: processedFile.url,
                      ssl_url: processedFile.ssl_url || processedFile.url,
                      name: processedFile.name || file.name,
                      size: processedFile.size || file.size,
                      type: processedFile.type || file.type,
                      meta: processedFile.meta,
                    };

                    setUploadState({
                      isUploading: false,
                      progress: 100,
                      error: null,
                      result,
                    });

                    resolve(result);
                  } else {
                    throw new Error("No processed file found in results");
                  }
                } else if (
                  response.ok === "ASSEMBLY_UPLOADING" ||
                  response.ok === "ASSEMBLY_EXECUTING"
                ) {
                  // Assembly is still processing - you might want to poll for completion
                  // For now, we'll return the original file URL as a fallback
                  const originalFile = response.uploads?.[0];

                  if (originalFile) {
                    const result: UploadResult = {
                      url: originalFile.url,
                      ssl_url: originalFile.ssl_url || originalFile.url,
                      name: originalFile.name || file.name,
                      size: originalFile.size || file.size,
                      type: originalFile.type || file.type,
                      meta: {
                        processing: true,
                        assembly_id: response.assembly_id,
                      },
                    };

                    setUploadState({
                      isUploading: false,
                      progress: 100,
                      error: null,
                      result,
                    });

                    resolve(result);
                  } else {
                    throw new Error(
                      "Upload completed but no file URL available",
                    );
                  }
                } else {
                  throw new Error(response.message || "Upload failed");
                }
              } catch (parseError) {
                throw new Error("Failed to parse upload response");
              }
            } else {
              // Enhanced error handling for common HTTP status codes
              console.error(
                `❌ Upload failed with status ${xhr.status}. Response:`,
                xhr.responseText,
              );
              let errorMessage = `Upload failed with status: ${xhr.status}`;

              try {
                const errorResponse = JSON.parse(xhr.responseText);
                console.error("❌ Parsed error response:", errorResponse);

                if (errorResponse.error === "INVALID_SIGNATURE") {
                  errorMessage =
                    "❌ Authentication failed: Invalid Transloadit credentials. Please check your API key and secret.";
                } else if (errorResponse.error === "ASSEMBLY_INVALID_ACCOUNT") {
                  errorMessage =
                    "❌ Transloadit account issue: Please verify your account is active and has sufficient credits.";
                } else if (errorResponse.message) {
                  errorMessage = `❌ ${errorResponse.message}`;
                }
              } catch (e) {
                console.error("❌ Could not parse error response:", e);
                // If we can't parse the error response, use the status code
                if (xhr.status === 400) {
                  errorMessage =
                    "❌ Bad request: Invalid upload parameters or authentication failure.";
                } else if (xhr.status === 401) {
                  errorMessage =
                    "❌ Authentication failed: Please check your Transloadit API credentials.";
                } else if (xhr.status === 403) {
                  errorMessage =
                    "❌ Access forbidden: Account may be suspended or out of credits.";
                } else if (xhr.status === 413) {
                  errorMessage =
                    "❌ File too large: Please reduce file size or upgrade your plan.";
                } else if (xhr.status >= 500) {
                  errorMessage =
                    "❌ Server error: Transloadit service is temporarily unavailable.";
                }
              }

              throw new Error(errorMessage);
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.open("POST", endpoint);
          xhr.send(formData);
        });
      } catch (error: any) {
        const errorMessage = error.message || "Upload failed";

        setUploadState({
          isUploading: false,
          progress: 0,
          error: errorMessage,
          result: null,
        });

        throw error;
      }
    },
    [],
  );

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  return {
    uploadFile,
    resetUpload,
    ...uploadState,
  };
};
