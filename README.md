# Obsidian Pivotal Tracker Integration Plugin

This is a plugin for Obsidian (https://obsidian.md), for the intergration between Pivotal Tracker (https://www.pivotaltracker.com/)
This project uses Typescript to provide type checking and documentation.

## Setup the Plugin
Once the plugin is installed, you will need to configure a few things.
- First you need to get your Tracker API Key
  - This is inside your account settings
- Then You need your Tracker Project ID
  - This can be found at the url of your tracker project.
- Finally you need to specify a folder location for the stories to be pulled to

## How to use

- Enter settings within the plugin.
- 
- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

- Copy over `main.js`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.
