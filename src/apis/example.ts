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
 * Example descriptor
 */
export type ExampleDescriptor = ExampleInstance | ExampleDirectory;

/**
 * Example descriptor type
 */
export enum ExampleDescriptorType {
  Instance = 0,
  Directory = 1,
}

/**
 * Example instance
 */
export type ExampleInstance = {
  type: ExampleDescriptorType.Instance;
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
 * Example directory
 */
export type ExampleDirectory = {
  type: ExampleDescriptorType.Directory;
  entry: string;
  children: ExampleDescriptor[];
  title?: string;
  intro?: string;
};

/**
 * Prelude information
 */
export type Prelude = {
  imports: Record<string, string>;
  descriptors: ExampleDescriptor[];
};

const EXAMPLE_BASE_URL_KEY = "EXAMPLE_BASE_URL";

/**
 * Gets example base url
 * @returns example base url
 */
export const getExampleBaseUrl = () => {
  if (import.meta.env.VITE_ENABLE_BASE_URL_EDITOR === "true") {
    return (
      localStorage.getItem(EXAMPLE_BASE_URL_KEY) ??
      import.meta.env.VITE_EXAMPLE_BASE_URL ??
      "/examples"
    );
  } else {
    return import.meta.env.VITE_EXAMPLE_BASE_URL ?? "/examples";
  }
};

/**
 * Sets example base url
 * @param url example base url
 */
export const setExampleBaseUrl = (url: string) => {
  if (import.meta.env.VITE_ENABLE_BASE_URL_EDITOR === "true") {
    localStorage.setItem(EXAMPLE_BASE_URL_KEY, url);
  }
};

/**
 * Resets example base url
 */
export const resetExampleBaseUrl = () => {
  if (import.meta.env.VITE_ENABLE_BASE_URL_EDITOR === "true") {
    localStorage.removeItem(EXAMPLE_BASE_URL_KEY);
  }
};

/**
 * Concatenates base example url with path
 * @param paths paths
 * @returns url
 */
export const concatenateExampleUrl = (...paths: string[]) => getExampleBaseUrl() + paths.join("/");

/**
 * Gets prelude descriptors tree
 * @returns Prelude information
 */
export const getPrelude = async () =>
  await fetch(concatenateExampleUrl(PRELUDE_FILE_PATH)).then(
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
  return getTextFile(concatenateExampleUrl(fullEntry, JAVASCRIPT_FILENAME));
};

/**
 * Gets html file content of the specific entry
 * @param fullEntry Full entry of instance
 * @returns HTML file content
 */
export const getInstanceHTML = async (fullEntry: string) => {
  return getTextFile(concatenateExampleUrl(fullEntry, HTML_FILENAME));
};

/**
 * Gets stylesheet file content of the specific entry
 * @param fullEntry Full entry of instance
 * @returns Stylesheet file content
 */
export const getInstanceStylesheet = async (fullEntry: string) => {
  return getTextFile(concatenateExampleUrl(fullEntry, STYLESHEET_FILENAME));
};

/**
 * Gets description file content of the specific entry
 * @param fullEntry Full entry of instance
 * @returns Description file content
 */
export const getInstanceDescription = async (fullEntry: string) => {
  return getTextFile(concatenateExampleUrl(fullEntry, DESCRIPTION_FILENAME));
};

/**
 * Connects to Server-Side Event.
 *
 * Promise resolves after event source successfully opened.
 * @returns Event Source of SSE
 */
export const connectServerSideEvent = async () => {
  const eventSource = new EventSource(concatenateExampleUrl(SSE_URL));
  await new Promise((resolve) => {
    eventSource.addEventListener("open", resolve);
  });
  return eventSource;
};
