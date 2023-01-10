import {App, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import getStories from "./src/apiClient";
import generateMarkdown from "./src/generateMarkdown";
import generateFilePath from "./src/generateFilePath";

interface PivotalTrackerIntegrationSettings {
	folderPath: string;
	trackerUserAPIToken: string;
	trackerAppId: string;
	onlyPointedStories: boolean;
	includeChores: boolean;
	includeBugs: boolean;
	includeStories: boolean;
}

const DEFAULT_SETTINGS: PivotalTrackerIntegrationSettings = {
	folderPath: './stories',
	trackerUserAPIToken: '',
	trackerAppId: '',
	includeBugs: true,
	includeChores: true,
	includeStories: true,
	onlyPointedStories: false
};

export const retrieveStories = async (settings: PivotalTrackerIntegrationSettings) => {
	const {trackerUserAPIToken, trackerAppId, folderPath, onlyPointedStories, includeStories, includeChores, includeBugs} = settings;
	const inclusion = {includeStories, includeChores, includeBugs, pointed: onlyPointedStories};
	const stories = await getStories(trackerAppId, trackerUserAPIToken, inclusion);

	const newFolderPath = await generateFilePath(folderPath);
	await generateMarkdown(newFolderPath, stories);
};

const pullTrackerStories = (settings: PivotalTrackerIntegrationSettings) => {
	if(settings.trackerAppId === ''){
		return new Notice('No APP ID Provided.')
	}
	if(settings.trackerUserAPIToken === ''){
		return new Notice('No API Token provided.')
	}
	retrieveStories(settings).catch((e)=>{
		new Notice(e);
	});
};

export default class MyPlugin extends Plugin {
	settings: PivotalTrackerIntegrationSettings;

	async onload() {
		await this.loadSettings();



		// This creates an icon in the left ribbon.
		this.addRibbonIcon('book-open', 'Pull Tracker Stories',
			() => pullTrackerStories(this.settings));


		// This adds a command that can be triggered anywhere
		this.addCommand({
			id: 'pivotal-tracker-retrieve-stories',
			name: 'Pull Pivotal Tracker Stories',
			callback: () => pullTrackerStories(this.settings),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TrackerIntegrationSettingTab(this.app, this));

		// // If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// // Using this function will automatically remove the event listener when this plugin is disabled.
		// this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
		// 	console.log('click', evt);
		// });

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		// this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class TrackerIntegrationSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Tracker Integration'});

		new Setting(containerEl)
			.setName('Tracker User Token')
			.setDesc('To retrieve this, it can be found in your profile settings under "API KEY"')
			.addText(text => text
				.setPlaceholder('Enter your API Key')
				.setValue(this.plugin.settings.trackerUserAPIToken)
				.onChange(async (value) => {
					this.plugin.settings.trackerUserAPIToken = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Tracker App ID')
			.setDesc('This can be found in the project url bar https://www.pivotaltracker.com/n/projects/<your_project_id>')
			.addText(text => text
				.setPlaceholder('Enter your Apps Id')
				.setValue(this.plugin.settings.trackerAppId)
				.onChange(async (value) => {
					this.plugin.settings.trackerAppId = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Folder Path')
			.setDesc('This is the folder path to dump the stories it. It will create the folder path for you.')
			.addText(text => text
				.setPlaceholder('./Path/Name')
				.setValue(this.plugin.settings.folderPath)
				.onChange(async (value) => {
					this.plugin.settings.folderPath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Only Pointed Stories')
			.setDesc('Should only grab pointed stories if it is on.')
			.addToggle(ev => ev
				.setValue(this.plugin.settings.onlyPointedStories)
				.onChange(async (value) => {
					this.plugin.settings.onlyPointedStories = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Stories')
			.setDesc('Should include stories if it is on.')
			.addToggle(ev => ev
				.setValue(this.plugin.settings.includeStories)
				.onChange(async (value) => {
					this.plugin.settings.includeStories = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Include Chores')
			.setDesc('Should include chores if it is on.')
			.addToggle(ev => ev
				.setValue(this.plugin.settings.includeChores)
				.onChange(async (value) => {
					this.plugin.settings.includeChores = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Include Bugs')
			.setDesc('Should include bugs if it is on.')
			.addToggle(ev => ev
				.setValue(this.plugin.settings.includeBugs)
				.onChange(async (value) => {
					this.plugin.settings.includeBugs = value;
					await this.plugin.saveSettings();
				}))

	}
}
