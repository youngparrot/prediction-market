/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ypfile.myfilebase.com",
      },
      {
        protocol: "https",
        hostname: "yp-prediction-market.s3.filebase.com",
      },
    ],
  },
};

export default nextConfig;
