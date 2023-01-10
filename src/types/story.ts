export default interface Story {
  id: number;
  name: string;

  points: number | undefined;
  description: string;
  type: 'feature' | 'bug' | 'chore';
  url: string;
  state: 'accepted' | 'delivered' | 'started' | 'unstarted';
}
