/** Storybook 8：Components/YnButton + Variants → /story/components-ynbutton--variants */
export function storybookStoryPath(componentName: string, story: string): string {
  const base = componentName.includes("/")
    ? componentName.split("/").pop()!
    : componentName;
  const componentSlug = `components-${base.toLowerCase()}`;
  const storySlug = story
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase();
  return `${componentSlug}--${storySlug}`;
}

export function storybookUrl(
  componentName: string,
  story: string,
  base = "http://localhost:6006"
): string {
  return `${base}/?path=/story/${storybookStoryPath(componentName, story)}`;
}
