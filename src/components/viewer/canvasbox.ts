import { AppImportMap } from "@/store/app";
import srcdoc from "./CanvasBox.html?raw";
import { getChapterBaseUrl } from "@/apis/chapter";

const parser = new DOMParser();

/**
 * Creates canvas box iframe srcdoc by chapter.
 * @param dark Is dark theme
 * @param importMaps Chapter import maps
 * @param htmlCode Chapter html code
 * @param stylesheetCode Chapter stylesheet code
 * @param scriptCode Chapter script code
 * @returns Canvas box iframe srcdoc
 */
export const createIframeDoc = (
  dark?: boolean,
  surfaceTheme?: string,
  importMaps?: AppImportMap[],
  htmlCode?: string,
  stylesheetCode?: string,
  scriptCode?: string
) => {
  const document = parser.parseFromString(srcdoc, "text/html");

  setTheme(document, dark, surfaceTheme);
  appendChapterBaseUrl(document);
  appendImportsMap(document, importMaps);
  appendHTML(document, htmlCode);
  appendStylesheet(document, stylesheetCode);
  appendScript(document, scriptCode);

  return document.documentElement.outerHTML;
};

const setTheme = (document: Document, dark?: boolean, surfaceTheme?: string) => {
  dark = dark ?? false;
  document.body.style.setProperty("--v-theme-surface", surfaceTheme ?? "0, 0, 0");
  document.body.classList.add(dark ? "sl-theme-dark" : "sl-theme-light");
  document.body.classList.remove(dark ? "sl-theme-light" : "sl-theme-dark");
  document.body.setAttribute("dark", dark.toString());
};

const appendImportsMap = (document: Document, importMaps?: AppImportMap[]) => {
  if (!importMaps) return;

  const imports = importMaps.reduce(
    (result, { lib, url }) => {
      result[lib] = url;
      return result;
    },
    {} as Record<string, string>
  );
  const importsMap = document.createElement("script");
  importsMap.type = "importmap";
  importsMap.innerHTML = JSON.stringify({ imports });
  document.head.insertBefore(importsMap, document.head.firstChild);
};

const appendChapterBaseUrl = (document: Document) => {
  const chapterBaseUrlScript = document.createElement("script");
  chapterBaseUrlScript.innerHTML = `window.CHAPTERS_BASE_URL = "${getChapterBaseUrl()}";`;
  document.head.appendChild(chapterBaseUrlScript);
};

const appendHTML = (document: Document, code?: string) => {
  if (!code) return;

  const container = document.createElement("div");
  container.classList.add("canvas-box__controllers");
  container.innerHTML = code;
  document.body.appendChild(container);
};

const appendStylesheet = (document: Document, code?: string) => {
  if (!code) return;

  const stylesheet = document.createElement("style");
  stylesheet.innerHTML = code;
  document.head.appendChild(stylesheet);
};

const appendScript = (document: Document, code?: string) => {
  if (!code) return;

  const script = document.createElement("script");
  script.type = "module";
  script.innerHTML = code;
  document.head.appendChild(script);
};
