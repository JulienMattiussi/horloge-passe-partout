export type PassePartoutMountOptions = {
  format?: string;
  time?: string | null;
  imageBase?: string;
};

export type PassePartoutInstance = {
  element: HTMLElement;
  destroy: () => void;
};

export type PassePartoutApi = {
  mount: (
    el: HTMLElement,
    options?: PassePartoutMountOptions,
  ) => PassePartoutInstance;
  scan: () => void;
};

declare global {
  interface Window {
    PassePartout?: PassePartoutApi;
  }
}
