// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // o "/quizzes/:slug"
        headers: [
          // X-Frame-Options está deprecado, pero algunos navegadores lo respetan:
          { key: "X-Frame-Options", value: "ALLOWALL" },
          // Autoriza a Pixkay a embeber
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://pixkay.com https://*.pixkay.com https://app.pixkay.com;"
          },
        ],
      },
    ];
  },
};
export default nextConfig;
