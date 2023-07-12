/**
 * Common request error with status and status text
 */
export class RequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText?: string
  ) {
    super(
      `Request failure with status ${status}` + (statusText ? `, status text ${statusText}` : "")
    );
  }
}

/**
 * An universal fetch function, wrapper of `window.fetch`.
 * Any not `ok` response will throw a {@link RequestError} with status and status text.
 * @param input `fetch` input
 * @param init `fetch` init
 * @returns `fetch` Response, or {@link RequestError} if not ok.
 */
export const fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const response = await window.fetch(input, init);
  if (response.ok) {
    return response;
  } else {
    throw new RequestError(response.status, response.statusText);
  }
};
