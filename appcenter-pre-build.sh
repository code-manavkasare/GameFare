#!/usr/bin/env bash

# Update Bundle Version with package.json Version

echo VERSION SET IS :
node -pe "require('./package.json').version"
echo $PACKAGE_VERSION
plutil -replace CFBundleVersion -string $PACKAGE_VERSION $APPCENTER_SOURCE_DIRECTORY/ios/gamefare/Info.plist
plutil -replace CFBundleVersion -string $PACKAGE_VERSION $APPCENTER_SOURCE_DIRECTORY/ios/gamefare-dev-Info.plist
