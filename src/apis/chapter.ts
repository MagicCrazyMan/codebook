import { fetch } from ".";

/**
 * Server-Side Event request url
 */
export const SSE_URL = "/sse";

/**
 * Javascript filename
 */
export const JAVASCRIPT_FILENAME = "index.js";
/**
 * Prelude file path
 */
export const PRELUDE_FILE_PATH = "/index.json";
/**
 * HTML filename
 */
export const HTML_FILENAME = "index.html";
/**
 * Stylesheet filename
 */
export const STYLESHEET_FILENAME = "index.css";
/**
 * Description filename
 */
export const DESCRIPTION_FILENAME = "index.md";
/**
 * Preview image filename
 */
export const PREVIEW_IMAGE_FILENAME = "index.png";

/**
 * Chapter descriptor
 */
export type ChapterDescriptor = ChapterInstance | ChapterDirectory;

/**
 * Chapter descriptor type
 */
export enum ChapterDescriptorType {
  Instance = 0,
  Directory = 1,
}

/**
 * Chapter instance
 */
export type ChapterInstance = {
  type: ChapterDescriptorType.Instance;
  entry: string;
  libs: string[];
  title?: string;
  intro?: string;
  hasHTML: boolean;
  hasStylesheet: boolean;
  hasDescription: boolean;
  hasPreviewImage: boolean;
};

/**
 * Chapter directory
 */
export type ChapterDirectory = {
  type: ChapterDescriptorType.Directory;
  entry: string;
  children: ChapterDescriptor[];
  title?: string;
  intro?: string;
};

/**
 * Prelude information
 */
export type Prelude = {
  imports: Record<string, string>;
  descriptors: ChapterDescriptor[];
};

const CHAPTER_BASE_URL_KEY = "CHAPTER_BASE_URL";

/**
 * Gets chapter base url
 * @returns chapter base url
 */
export const getChapterBaseUrl = () => {
  if (import.meta.env.VITE_ENABLE_CHAPTERS_BASE_URL_EDITOR === "true") {
    return (
      localStorage.getItem(CHAPTER_BASE_URL_KEY) ??
      import.meta.env.VITE_CHAPTERS_BASE_URL ??
      "/chapters"
    );
  } else {
    return import.meta.env.VITE_CHAPTERS_BASE_URL ?? "/chapters";
  }
};

/**
 * Sets chapter base url
 * @param url chapter base url
 */
export const setChapterBaseUrl = (url: string) => {
  if (import.meta.env.VITE_ENABLE_CHAPTERS_BASE_URL_EDITOR === "true") {
    localStorage.setItem(CHAPTER_BASE_URL_KEY, url);
  }
};

/**
 * Resets chapter base url
 */
export const resetChapterBaseUrl = () => {
  if (import.meta.env.VITE_ENABLE_CHAPTERS_BASE_URL_EDITOR === "true") {
    localStorage.removeItem(CHAPTER_BASE_URL_KEY);
  }
};

/**
 * Concatenates base chapter url with path
 * @param paths paths
 * @returns url
 */
export const concatenateChapterUrl = (...paths: string[]) => {
  const base = getChapterBaseUrl();
  const path = paths.join("/");
  if (base.endsWith("/") && path.startsWith("/")) {
    return base + path.slice(1);
  } else {
    return base + path;
  }
};

/**
 * Gets prelude descriptors tree
 * @returns Prelude information
 */
export const getPrelude = async () =>
  await fetch(concatenateChapterUrl(PRELUDE_FILE_PATH)).then(
    (res) => res.json() as Promise<Prelude>
  );

/**
 * Gets a file as plain text in UTF-8
 * @param path Path
 * @returns File string content
 */
export const getTextFile = async (path: string) => {
  return await fetch(path).then((res) => res.text());
};

/**
 * Gets javascript file content of the specific entry
 * @param fullEntry Full entry of instance
 * @returns Javascript file content
 */
export const getInstanceJavascript = async (fullEntry: string) => {
  return getTextFile(concatenateChapterUrl(fullEntry, JAVASCRIPT_FILENAME));
};

/**
 * Gets html file content of the specific entry
 * @param fullEntry Full entry of instance
 * @returns HTML file content
 */
export const getInstanceHTML = async (fullEntry: string) => {
  return getTextFile(concatenateChapterUrl(fullEntry, HTML_FILENAME));
};

/**
 * Gets stylesheet file content of the specific entry
 * @param fullEntry Full entry of instance
 * @returns Stylesheet file content
 */
export const getInstanceStylesheet = async (fullEntry: string) => {
  return getTextFile(concatenateChapterUrl(fullEntry, STYLESHEET_FILENAME));
};

/**
 * Gets description file content of the specific entry
 * @param fullEntry Full entry of instance
 * @returns Description file content
 */
export const getInstanceDescription = async (fullEntry: string) => {
  return getTextFile(concatenateChapterUrl(fullEntry, DESCRIPTION_FILENAME));
};

/**
 * Connects to Server-Side Event.
 *
 * Promise resolves after event source successfully opened.
 * @returns Event Source of SSE
 */
export const connectServerSideEvent = async () => {
  const eventSource = new EventSource(concatenateChapterUrl(SSE_URL));
  await new Promise((resolve) => {
    eventSource.addEventListener("open", resolve);
  });
  return eventSource;
};
