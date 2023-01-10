import Story from './types/story';
import writeOutputToFile from './writeOutputToFile';
import {Notice} from "obsidian";

function storyToMarkdown(story: Story): string {

  let currentStory = appendLine(`### ${story.name} [#${story.id}](${story.url})`, newLine("## Pivotal Tracker"),);


  if(story.type === "feature" && story.points ){
    currentStory = appendLine(newLine("#### Points: "+story.points), currentStory)
  }

  if (story.description) {
    currentStory = appendLine("### Description", currentStory);
    currentStory = appendLine(story.description, currentStory);
  }

  currentStory = appendLine(generateTags(story.type), currentStory);

  return currentStory;
}

function newLine(content: string) {
  return `${content}\r\n`
}

function appendLine(content: string, destination: string): string {
  return newLine(`${destination + content}`);
}

function generateTags(type: "feature" | "bug" | "chore"){

  return newLine("") + newLine("---") + newLine("tags") + newLine("  - pivotal-tracker") + newLine("  - " + type) +newLine("---")

}

export default async function generateMarkdown(folderPath: string, stories: Story[]) {
  let storiesIgnored = 0;
  for (let feature of stories) {
    await writeOutputToFile(folderPath, appendLine(storyToMarkdown(feature), ''), feature.name)
        .then(() => {
          new Notice(`${feature.name} Created`)
        })
        .catch(() => {
          storiesIgnored += 1;
        });
  }
  if(storiesIgnored === stories.length) {
    return new Notice('All Stories Ignored, Files Already Exist')

  }
  const storiesCreated = stories.length - storiesIgnored;

  new Notice(`${storiesCreated} ${storiesCreated > 1 ? 'Stories' : 'Story'} Created`)
}
