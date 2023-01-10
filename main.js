/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => MyPlugin,
  retrieveStories: () => retrieveStories
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/mappers/storyMapper.ts
function mapStory(data) {
  return {
    id: data.id,
    name: data.name.replace("/", " "),
    points: data.estimate,
    description: data.description,
    type: data.story_type,
    url: data.url,
    state: data.current_state
  };
}
function mapStories(data) {
  return data.map((d) => mapStory(d));
}

// src/apiClient.ts
var import_obsidian = require("obsidian");
var TRACKER_URL = "https://www.pivotaltracker.com/services/v5";
function generateConfig(trackerToken, projectId, queryParam) {
  return {
    method: "GET",
    url: `${TRACKER_URL}/projects/${projectId}/stories?${queryParam}`,
    headers: {
      "X-TrackerToken": trackerToken
    },
    contentType: "application/json"
  };
}
async function getStories(trackerId, trackerToken, included) {
  try {
    const projectId = parseInt(trackerId);
    const response = [];
    if (included.includeStories) {
      let unstartedStories = JSON.parse(await (0, import_obsidian.request)(generateConfig(trackerToken, projectId, "with_state=unstarted")));
      let startedStories = JSON.parse(await (0, import_obsidian.request)(generateConfig(trackerToken, projectId, "with_state=started")));
      response.push(...unstartedStories, ...startedStories);
    }
    if (included.includeChores) {
      let unstartedChores = JSON.parse(await (0, import_obsidian.request)(generateConfig(trackerToken, projectId, "with_story_type=chore&with_state=unstarted")));
      let startedChores = JSON.parse(await (0, import_obsidian.request)(generateConfig(trackerToken, projectId, "with_story_type=chore&with_state=started")));
      response.push(...unstartedChores, ...startedChores);
    }
    if (included.includeBugs) {
      let unstartedBugs = JSON.parse(await (0, import_obsidian.request)(generateConfig(trackerToken, projectId, "with_story_type=bug&with_state=unstarted")));
      let startedBugs = JSON.parse(await (0, import_obsidian.request)(generateConfig(trackerToken, projectId, "with_story_type=bug&with_state=started")));
      response.push(...unstartedBugs, ...startedBugs);
    }
    if (response.length === 0) {
      throw new Error("No stories available");
    }
    let stories = mapStories(response);
    new import_obsidian.Notice("Retrieving Stories");
    return stories.filter((story) => {
      const onlyNonAccepted = story.state !== "accepted";
      if (included.pointed) {
        return onlyNonAccepted && typeof story.points === "number";
      }
      return onlyNonAccepted;
    });
  } catch (e) {
    return Promise.reject(e.message);
  }
}

// src/writeOutputToFile.ts
async function writeOutputToFile(folderPath, markdown, fileName) {
  const modifiedFileName = fileName.replace("/", " ");
  const readmePath = `${folderPath}/${modifiedFileName}.md`;
  return this.app.vault.create(readmePath, markdown);
}

// src/generateMarkdown.ts
var import_obsidian2 = require("obsidian");
function storyToMarkdown(story) {
  let currentStory = appendLine(`### ${story.name} [#${story.id}](${story.url})`, newLine("## Pivotal Tracker"));
  if (story.type === "feature" && story.points) {
    currentStory = appendLine(newLine("#### Points: " + story.points), currentStory);
  }
  if (story.description) {
    currentStory = appendLine("### Description", currentStory);
    currentStory = appendLine(story.description, currentStory);
  }
  currentStory = appendLine(generateTags(story.type), currentStory);
  return currentStory;
}
function newLine(content) {
  return `${content}\r
`;
}
function appendLine(content, destination) {
  return newLine(`${destination + content}`);
}
function generateTags(type) {
  return newLine("") + newLine("---") + newLine("tags") + newLine("  - pivotal-tracker") + newLine("  - " + type) + newLine("---");
}
async function generateMarkdown(folderPath, stories) {
  let storiesIgnored = 0;
  for (let feature of stories) {
    await writeOutputToFile(folderPath, appendLine(storyToMarkdown(feature), ""), feature.name).then(() => {
      new import_obsidian2.Notice(`${feature.name} Created`);
    }).catch(() => {
      storiesIgnored += 1;
    });
  }
  if (storiesIgnored === stories.length) {
    return new import_obsidian2.Notice("All Stories Ignored, Files Already Exist");
  }
  const storiesCreated = stories.length - storiesIgnored;
  new import_obsidian2.Notice(`${storiesCreated} ${storiesCreated > 1 ? "Stories" : "Story"} Created`);
}

// src/generateFilePath.ts
var import_obsidian3 = require("obsidian");
async function generateFilePath(folderPath) {
  let currentFolderPath = "";
  if (!await this.app.vault.adapter.exists(folderPath)) {
    let path = folderPath.split("/");
    if (path[0] === ".") {
      path = path.slice(1);
    }
    for (let folder of path) {
      if (folder.trim()) {
        currentFolderPath += folder;
        if (!await this.app.vault.exists(currentFolderPath)) {
          await this.app.vault.createFolder(currentFolderPath);
        }
        currentFolderPath += "/";
      }
    }
    new import_obsidian3.Notice("Folders Created For Story Output");
    return currentFolderPath;
  } else {
    return folderPath;
  }
}

// main.ts
var DEFAULT_SETTINGS = {
  folderPath: "./stories",
  trackerUserAPIToken: "",
  trackerAppId: "",
  includeBugs: true,
  includeChores: true,
  includeStories: true,
  onlyPointedStories: false
};
var retrieveStories = async (settings) => {
  const { trackerUserAPIToken, trackerAppId, folderPath, onlyPointedStories, includeStories, includeChores, includeBugs } = settings;
  const inclusion = { includeStories, includeChores, includeBugs, pointed: onlyPointedStories };
  const stories = await getStories(trackerAppId, trackerUserAPIToken, inclusion);
  const newFolderPath = await generateFilePath(folderPath);
  await generateMarkdown(newFolderPath, stories);
};
var pullTrackerStories = (settings) => {
  if (settings.trackerAppId === "") {
    return new import_obsidian4.Notice("No APP ID Provided.");
  }
  if (settings.trackerUserAPIToken === "") {
    return new import_obsidian4.Notice("No API Token provided.");
  }
  retrieveStories(settings).catch((e) => {
    new import_obsidian4.Notice(e);
  });
};
var MyPlugin = class extends import_obsidian4.Plugin {
  async onload() {
    await this.loadSettings();
    this.addRibbonIcon("book-open", "Pull Tracker Stories", () => pullTrackerStories(this.settings));
    this.addCommand({
      id: "pivotal-tracker-retrieve-stories",
      name: "Pull Pivotal Tracker Stories",
      callback: () => pullTrackerStories(this.settings)
    });
    this.addSettingTab(new TrackerIntegrationSettingTab(this.app, this));
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
var TrackerIntegrationSettingTab = class extends import_obsidian4.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Settings for Tracker Integration" });
    new import_obsidian4.Setting(containerEl).setName("Tracker User Token").setDesc('To retrieve this, it can be found in your profile settings under "API KEY"').addText((text) => text.setPlaceholder("Enter your API Key").setValue(this.plugin.settings.trackerUserAPIToken).onChange(async (value) => {
      this.plugin.settings.trackerUserAPIToken = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian4.Setting(containerEl).setName("Tracker App ID").setDesc("This can be found in the project url bar https://www.pivotaltracker.com/n/projects/<your_project_id>").addText((text) => text.setPlaceholder("Enter your Apps Id").setValue(this.plugin.settings.trackerAppId).onChange(async (value) => {
      this.plugin.settings.trackerAppId = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian4.Setting(containerEl).setName("Folder Path").setDesc("This is the folder path to dump the stories it. It will create the folder path for you.").addText((text) => text.setPlaceholder("./Path/Name").setValue(this.plugin.settings.folderPath).onChange(async (value) => {
      this.plugin.settings.folderPath = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian4.Setting(containerEl).setName("Only Pointed Stories").setDesc("Should only grab pointed stories if it is on.").addToggle((ev) => ev.setValue(this.plugin.settings.onlyPointedStories).onChange(async (value) => {
      this.plugin.settings.onlyPointedStories = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian4.Setting(containerEl).setName("Include Stories").setDesc("Should include stories if it is on.").addToggle((ev) => ev.setValue(this.plugin.settings.includeStories).onChange(async (value) => {
      this.plugin.settings.includeStories = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian4.Setting(containerEl).setName("Include Chores").setDesc("Should include chores if it is on.").addToggle((ev) => ev.setValue(this.plugin.settings.includeChores).onChange(async (value) => {
      this.plugin.settings.includeChores = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian4.Setting(containerEl).setName("Include Bugs").setDesc("Should include bugs if it is on.").addToggle((ev) => ev.setValue(this.plugin.settings.includeBugs).onChange(async (value) => {
      this.plugin.settings.includeBugs = value;
      await this.plugin.saveSettings();
    }));
  }
};
