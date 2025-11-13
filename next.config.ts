// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // ❌ Mejor no mandes X-Frame-Options:
          // { key: "X-Frame-Options", value: "ALLOWALL" },

          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://pixkay.com https://*.pixkay.com https://app.pixkay.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
