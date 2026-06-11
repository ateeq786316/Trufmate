const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for custom assets
config.resolver.assetExts.push("png", "jpg", "jpeg", "gif", "webp");

module.exports = config;
