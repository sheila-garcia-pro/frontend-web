declare module 'html2canvas' {
  interface Html2CanvasOptions {
    allowTaint?: boolean;
    backgroundColor?: string | null;
    canvas?: HTMLCanvasElement;
    foreignObjectRendering?: boolean;
    imageTimeout?: number;
    ignoreElements?: (element: Element) => boolean;
    logging?: boolean;
    onclone?: (clonedDoc: Document, element: HTMLElement) => void;
    proxy?: string;
    removeContainer?: boolean;
    scale?: number;
    useCORS?: boolean;
    width?: number;
    height?: number;
    scrollX?: number;
    scrollY?: number;
    windowWidth?: number;
    windowHeight?: number;
    x?: number;
    y?: number;
  }

  function html2canvas(
    element: HTMLElement,
    options?: Html2CanvasOptions,
  ): Promise<HTMLCanvasElement>;
  export default html2canvas;
}

declare module 'dom-to-image' {
  interface Options {
    filter?: (node: Node) => boolean;
    bgcolor?: string;
    width?: number;
    height?: number;
    style?: any;
    quality?: number;
    imagePlaceholder?: string;
    cacheBust?: boolean;
  }

  export function toPng(node: Node, options?: Options): Promise<string>;
  export function toJpeg(node: Node, options?: Options): Promise<string>;
  export function toSvg(node: Node, options?: Options): Promise<string>;
  export function toPixelData(node: Node, options?: Options): Promise<Uint8ClampedArray>;
  export function toBlob(node: Node, options?: Options): Promise<Blob>;
}
