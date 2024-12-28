/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ypfile.myfilebase.com",
      },
    ],
  },
};

export default nextConfig;
