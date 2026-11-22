export const WEB_PHOTO_INPUT = {
  type: 'file',
  accept: 'image/*',
  capture: 'environment',
} as const;

type BrowserFile = { size: number; type: string };

type BrowserInput = {
  type: string;
  accept: string;
  capture: string;
  files?: { [index: number]: BrowserFile | undefined; length: number } | null;
  click: () => void;
  onchange: (() => void) | null;
};

type BrowserDocument = {
  createElement: (tag: string) => BrowserInput;
  addEventListener: (type: string, listener: (event: BrowserDropEvent) => void) => void;
  removeEventListener: (type: string, listener: (event: BrowserDropEvent) => void) => void;
};

type BrowserDropEvent = {
  preventDefault: () => void;
  dataTransfer?: { files?: { [index: number]: BrowserFile | undefined; length: number } | null };
};

function browserDocument(): BrowserDocument | null {
  const candidate = (globalThis as { document?: BrowserDocument }).document;
  if (!candidate || typeof candidate.createElement !== 'function') {
    return null;
  }
  return candidate;
}

export function pickWebPhotoFile(): Promise<BrowserFile | null> {
  const doc = browserDocument();
  if (!doc) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    const input = doc.createElement('input');
    input.type = WEB_PHOTO_INPUT.type;
    input.accept = WEB_PHOTO_INPUT.accept;
    input.capture = WEB_PHOTO_INPUT.capture;
    input.onchange = () => {
      resolve(input.files?.[0] ?? null);
    };
    input.click();
  });
}

export function webPhotoObjectUrl(file: BrowserFile): string | null {
  const url = (
    globalThis as unknown as { URL?: { createObjectURL?: (value: BrowserFile) => string } }
  ).URL;
  if (!url?.createObjectURL) {
    return null;
  }
  return url.createObjectURL(file);
}

/** Desktop drop uses the same file object as the picker. Image files only. */
export function bindWebPhotoDrop(onFile: (file: BrowserFile) => void): () => void {
  const doc = browserDocument();
  if (!doc) {
    return () => undefined;
  }
  const onDragOver = (event: BrowserDropEvent) => {
    event.preventDefault();
  };
  const onDrop = (event: BrowserDropEvent) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFile(file);
    }
  };
  doc.addEventListener('dragover', onDragOver);
  doc.addEventListener('drop', onDrop);
  return () => {
    doc.removeEventListener('dragover', onDragOver);
    doc.removeEventListener('drop', onDrop);
  };
}
