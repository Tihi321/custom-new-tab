# Custom New Tab Extension

A Chrome extension that allows you to set a custom URL for new tabs with an easy enable/disable toggle.

## Features

- Set any custom URL to open when creating a new tab
- Toggle to enable/disable the custom URL without losing your saved address
- Beautiful and modern UI
- Simple and lightweight

## Installation

1. Clone this repository
2. Run `yarn install` to install dependencies
3. Run `yarn build` to build the extension
4. Open Chrome and go to `chrome://extensions/`
5. Enable "Developer mode" in the top right
6. Click "Load unpacked" and select the `dist` folder

## Usage

1. Click on the extension icon in the Chrome toolbar
2. Enter your desired URL (must start with http:// or https://)
3. Click "Save URL"
4. Open a new tab and it will redirect to your custom URL
5. Use the toggle button to enable/disable the custom URL feature

## Development

- `yarn dev` - Watch mode for development
- `yarn build` - Build the extension for production

## License

MIT
