# VSCode PDF Viewer

VSCode PDF Viewer forked from [tomoki1207/vscode-pdfviewer](https://github.com/tomoki1207/vscode-pdfviewer).

## Changes from original

- Update PDF.js to v2.16.105
- Add reload button in status bar
- Make auto reloading configurable

## How to update PDF.js

1. Download newer version of PDF.js build from <https://mozilla.github.io/pdf.js/>.
1. Extract PDF.js into `lib/pdfjs/`.
1. Copy `lib/pdfjs/web/viewer.html` to `src/pdfViewerHtml.ts`.

## Project structure

- src
  - disposable.ts<br>
    Wrapper library for `vscode.Disposable`
  - extension.ts<br>
    Entrypoint of extension.
  - pdfPreview.ts<br>
    Provides WebView implementation.
  - pdfProvider.ts<br>
    Custom class extends `CustomReadonlyEditorProvidor`.
- lib
  - pdfjs<br>
    PDF.js
  - webview<br>
    Custom script runs in WebView.

---

# pdf (Original README.md)

Display pdf in VSCode.

![screenshot](https://user-images.githubusercontent.com/3643499/84454816-98fcd600-ac96-11ea-822c-3ae1e1599a13.gif)

## Contribute

### Upgrade PDF.js (Obsoleted)

1. Download latest [Prebuilt](https://mozilla.github.io/pdf.js/getting_started/#download).
1. Extract the ZIP file.
1. Overwrite ./lib/* by extracted directories.
   - If lib/web/viewer.html has changes, apply these changes to HTML template at pdfPreview.ts.
1. To not use sample pdf.
  - Remove sample pdf called `compressed.tracemonkey-pldi-09.pdf`.
  - Remove code about using sample pdf from lib/web/viewer.js.
    ```js
    defaultUrl: {
      value: "", // "compressed.tracemonkey-pldi-09.pdf"
      kind: OptionKind.VIEWER
    },
    ```

## Change log
See [CHANGELOG.md](CHANGELOG.md).

## License
Please see [LICENSE](./LICENSE)
