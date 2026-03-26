// Server-side only: Import Transloadit (not used on client)
let Transloadit: any = null;
let transloadit: any = null;

// Check if we're on the server side
if (typeof window === "undefined") {
  try {
    const transloaditModule = require("transloadit");
    Transloadit = transloaditModule.Transloadit;

    // Initialize only if credentials are available
    if (
      process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY &&
      process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET
    ) {
      transloadit = new Transloadit({
        authKey: process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY,
        authSecret: process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET,
      });
    }
  } catch (error) {
    console.warn("Transloadit module not available:", error);
  }
}

// Export for server-side use
export { transloadit };

// Check if Transloadit is configured
export const isTransloaditConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY &&
    process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET
  );
};

// Template configurations for different file types
export const TRANSLOADIT_TEMPLATES = {
  image: {
    templateId: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_IMAGE,
    steps: {
      import: {
        robot: "/upload/handle",
      },
      resize: {
        robot: "/image/resize",
        use: "import",
        width: 800,
        height: 600,
        resize_strategy: "fit",
        format: "jpg",
      },
      optimize: {
        robot: "/image/optimize",
        use: "resize",
        quality: 85,
      },
    },
  },
  video: {
    templateId: process.env.NEXT_PUBLIC_TRANSLOADIT_TEMPLATE_ID_VIDEO,
    steps: {
      import: {
        robot: "/upload/handle",
      },
      encode: {
        robot: "/video/encode",
        use: "import",
        preset: "mp4",
        width: 1280,
        height: 720,
        resize_strategy: "fit",
      },
      thumbnail: {
        robot: "/video/thumbs",
        use: "encode",
        count: 1,
        format: "jpg",
      },
    },
  },
};

// Generate assembly parameters for client-side uploads
export const createAssemblyParams = (fileType: "image" | "video") => {
  if (!isTransloaditConfigured()) {
    throw new Error(
      "Transloadit is not configured. Please set NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY and NEXT_PUBLIC_TRANSLOADIT_AUTH_SECRET in your environment variables.",
    );
  }

  const template = TRANSLOADIT_TEMPLATES[fileType];

  return {
    auth: {
      key: process.env.NEXT_PUBLIC_TRANSLOADIT_AUTH_KEY!,
      expires: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    },
    template_id: template.templateId,
    // You can also pass steps directly instead of using a template
    steps: template.steps,
    notify_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/transloadit/notify`,
  };
};
