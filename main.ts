import {addIcon, App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting} from 'obsidian';
import getStories from "./src/apiClient";
import generateMarkdown from "./src/generateMarkdown";
// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	folderPath: string;
	trackerUserId: string;
	trackerAppId: string;
	onlyPointedStories: boolean;
	includeChores: boolean;
	includeBugs: boolean;
	includeStories: boolean;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	folderPath: './stories',
	includeBugs: true,
	includeChores: true,
	includeStories: true,
	trackerUserId: 'default',
	trackerAppId: 'default',
	onlyPointedStories: false
}

export const retrieveStories = async (settings: MyPluginSettings) => {
	const {trackerUserId, trackerAppId, folderPath, onlyPointedStories, includeStories, includeChores, includeBugs} = settings;
	const inclusion = {includeStories, includeChores, includeBugs, pointed: onlyPointedStories};
	const stories = await getStories(trackerAppId, trackerUserId, inclusion);

	generateMarkdown(folderPath, stories);
};

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		await this.loadSettings();
		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('book-open', 'Pull Tracker Stories', (evt: MouseEvent) => {
			// Called when the user clicks the icon.

			retrieveStories(this.settings).then(()=> {
				new Notice('Retrieving Stories');
			}).catch((e)=>{
				new Notice(e + this.settings.trackerAppId + this.settings.trackerUserId);
			});
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			},

		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new TrackerIntegrationSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
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
				.setValue(this.plugin.settings.trackerUserId)
				.onChange(async (value) => {
					this.plugin.settings.trackerUserId = value;
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
			.setDesc('This is the folder path to dump the stories it, currently they do NOT get created automatically.')
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
