import * as vscode from 'vscode';
import { PdfPreview } from './pdfPreview';

export class PdfCustomProvider implements vscode.CustomReadonlyEditorProvider {
  public static readonly viewType = 'pdf.preview';

  private readonly _previews = new Set<PdfPreview>();
  private _activePreview: PdfPreview | undefined;
  private _stateChangeHandlers: ((instances: number) => void)[] = [];

  constructor(private readonly extensionRoot: vscode.Uri) {}

  public openCustomDocument(uri: vscode.Uri): vscode.CustomDocument {
    return { uri, dispose: (): void => {} };
  }

  public reload() {
    this._previews.forEach(preview => {
      preview.reload()
    })
  }

  public addStateChangeHandler(handler: (instances: number) => void) {
    this._stateChangeHandlers.push(handler)
  }

  public async resolveCustomEditor(
    document: vscode.CustomDocument,
    webviewEditor: vscode.WebviewPanel
  ): Promise<void> {
    const preview = new PdfPreview(
      this.extensionRoot,
      document.uri,
      webviewEditor
    );
    this._previews.add(preview);
    this.setActivePreview(preview);
    for (const handler of this._stateChangeHandlers) {
      handler(this._previews.size)
    }

    webviewEditor.onDidDispose(() => {
      this._previews.delete(preview);
      for (const handler of this._stateChangeHandlers) {
        handler(this._previews.size)
      }
    });

    webviewEditor.onDidChangeViewState(() => {
      if (webviewEditor.active) {
        this.setActivePreview(preview);
      } else if (this._activePreview === preview && !webviewEditor.active) {
        this.setActivePreview(undefined);
      }
    });
  }

  public get activePreview(): PdfPreview {
    return this._activePreview;
  }

  private setActivePreview(value: PdfPreview | undefined): void {
    this._activePreview = value;
  }
}
