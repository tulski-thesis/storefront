const { withStoreConfig } = require("./store-config")
const store = require("./store.config.json")

module.exports = withStoreConfig({
  output: "standalone",
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: [
      "@medusajs/product",
      "@medusajs/modules-sdk",
    ],
  },
  features: store.features,
  reactStrictMode: true,
  images: {
    domains: ["assets.myntassets.com"],
  }
})

console.log("next.config.js", JSON.stringify(module.exports, null, 2))
