#!/usr/bin/env bash

# Update Bundle Version with package.json Version

echo VERSION SET IS :
node -pe "require('./package.json').version"
echo $PACKAGE_VERSION
plutil -replace CFBundleVersion -string "1.1.0" $APPCENTER_SOURCE_DIRECTORY/ios/gamefare/Info.plist
plutil -replace CFBundleVersion -string "1.1.0" $APPCENTER_SOURCE_DIRECTORY/ios/gamefare/gamefare-dev-Info.plist
