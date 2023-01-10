import mapStories from './mappers/storyMapper';
import Story from './types/story';
import {request} from "obsidian";

const TRACKER_URL = 'https://www.pivotaltracker.com/services/v5';

function generateConfig(
    trackerToken: string,
    projectId: number,
    queryParam: string
): { headers: { "X-TrackerToken": string }; method: string; contentType: string; url: string } {

  return {
    method: 'GET',
    url: `${TRACKER_URL}/projects/${projectId}/stories?${queryParam}`,
    headers: {
      'X-TrackerToken': trackerToken,
    },
    contentType: "application/json",
  };
}

export default async function getStories(
    trackerId: string,
    trackerToken: string,
    included: {includeStories: boolean, includeChores:boolean, includeBugs:boolean, pointed: boolean}
): Promise<Story[]> {
  try {
    const projectId = parseInt(trackerId);

    const response: any[] = [];

    if(included.includeStories) {
      let unstartedStories = JSON.parse(await request(generateConfig(trackerToken, projectId, 'with_state=unstarted')));
      let startedStories = JSON.parse(await request(generateConfig(trackerToken, projectId, 'with_state=started')));
      response.push(...unstartedStories, ...startedStories);
    }
    if(included.includeChores) {
      let unstartedChores = JSON.parse(await request(generateConfig(trackerToken, projectId, 'with_story_type=chore&with_state=unstarted')));
      let startedChores = JSON.parse(await request(generateConfig(trackerToken, projectId, 'with_story_type=chore&with_state=started')));
      response.push(...unstartedChores, ...startedChores);
    }
    if(included.includeBugs) {
      let unstartedBugs = JSON.parse(await request(generateConfig(trackerToken, projectId, 'with_story_type=bug&with_state=unstarted')));
      let startedBugs = JSON.parse(await request(generateConfig(trackerToken, projectId, 'with_story_type=bug&with_state=started')));
      response.push(...unstartedBugs, ...startedBugs);
    }

    let stories = mapStories(response as any[]);


    return stories.filter((story) => {
      const onlyNonAccepted = story.state !== 'accepted';

      if(included.pointed){
        return onlyNonAccepted && typeof story.points === 'number'
      }

      return onlyNonAccepted
    });
  } catch (e: any) {
    return Promise.reject(e.message);
  }
}
