export default async function writeOutputToFile(
    folderPath: string,
    markdown: string,
    fileName: string,
): Promise<any> {
  const modifiedFileName = fileName.replace("/", " ");
  const readmePath = `${folderPath}/${modifiedFileName}.md`;

  return this.app.vault.create(readmePath, markdown);
}
