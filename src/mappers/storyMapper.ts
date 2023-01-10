import Story from '../types/story';

function mapStory(data: any): Story {
  return {
    id: data.id,
    name:  data.name.replace("/", " "),
    points: data.estimate,
    description: data.description,
    type: data.story_type,
    url: data.url,
    state: data.current_state,
  };
}

export default function mapStories(data: any[]): Story[] {
  return data.map((d) => mapStory(d));
}
