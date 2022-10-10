import * as path from 'path';
import * as vscode from 'vscode';
import { Disposable } from './disposable';
import html from './pdfViewerHtml'

function escapeAttribute(value: string | vscode.Uri): string {
  return value.toString().replace(/"/g, '&quot;');
}

type PreviewState = 'Disposed' | 'Visible' | 'Active';

export class PdfPreview extends Disposable {
  private _previewState: PreviewState = 'Visible';

  constructor(
    private readonly extensionRoot: vscode.Uri,
    private readonly resource: vscode.Uri,
    private readonly webviewEditor: vscode.WebviewPanel
  ) {
    super();
    const resourceRoot = resource.with({
      path: resource.path.replace(/\/[^/]+?\.\w+$/, '/'),
    });

    webviewEditor.webview.options = {
      enableScripts: true,
      localResourceRoots: [resourceRoot, extensionRoot],
    };

    this._register(
      webviewEditor.webview.onDidReceiveMessage((message) => {
        switch (message.type) {
          case 'reopen-as-text': {
            vscode.commands.executeCommand(
              'vscode.openWith',
              resource,
              'default',
              webviewEditor.viewColumn
            );
            break;
          }
        }
      })
    );

    this._register(
      webviewEditor.onDidChangeViewState(() => {
        this.update();
      })
    );

    this._register(
      webviewEditor.onDidDispose(() => {
        this._previewState = 'Disposed';
      })
    );

    const autoReloadEnabled = vscode.workspace.getConfiguration('pdf-preview').get('default.autoReload') as boolean
    if (autoReloadEnabled) {
      const watcher = this._register(
        vscode.workspace.createFileSystemWatcher(resource.fsPath)
      );
      this._register(
        watcher.onDidChange((e) => {
          if (e.toString() === this.resource.toString()) {
            this.reload();
          }
        })
      );
      this._register(
        watcher.onDidDelete((e) => {
          if (e.toString() === this.resource.toString()) {
            this.webviewEditor.dispose();
          }
        })
      );
    }

    this.webviewEditor.webview.html = this.getWebviewContents();
    this.update();
  }

  public reload(): void {
    if (this._previewState !== 'Disposed') {
      this.webviewEditor.webview.postMessage({ type: 'reload' });
    }
  }

  private update(): void {
    if (this._previewState === 'Disposed') {
      return;
    }

    if (this.webviewEditor.active) {
      this._previewState = 'Active';
      return;
    }
    this._previewState = 'Visible';
  }

  private getWebviewContents(): string {
    const webview = this.webviewEditor.webview;
    const docPath = webview.asWebviewUri(this.resource);
    const cspSource = webview.cspSource;
    const resolveAsWebviewUri = (...p: string[]): vscode.Uri => {
      const uri = vscode.Uri.file(path.join(this.extensionRoot.path, ...p));
      return webview.asWebviewUri(uri);
    };

    const config = vscode.workspace.getConfiguration('pdf-preview');
    const settings = {
      cMapUrl: resolveAsWebviewUri('lib', 'pdfjs', 'web', 'cmaps/').toString(),
      path: docPath.toString(),
      defaults: {
        cursor: config.get('default.cursor') as string,
        scale: config.get('default.scale') as string,
        sidebar: config.get('default.sidebar') as boolean,
        scrollMode: config.get('default.scrollMode') as string,
        spreadMode: config.get('default.spreadMode') as string,
      },
    };

    const replace = `
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src ${cspSource}; script-src 'unsafe-inline' ${cspSource}; style-src 'unsafe-inline' ${cspSource}; img-src blob: data: ${cspSource};">
      <meta id="pdf-preview-config" data-config="${escapeAttribute(
            JSON.stringify(settings)
          )}">
      <link rel="resource" type="application/l10n" href="${resolveAsWebviewUri('lib', 'pdfjs', 'web', 'locale', 'locale.properties')}">
      <link rel="stylesheet" href="${resolveAsWebviewUri('lib', 'pdfjs', 'web', 'viewer.css')}">
      <link rel="stylesheet" href="${resolveAsWebviewUri('lib', 'webview', 'pdf.css')}">
      <script src="${resolveAsWebviewUri('lib', 'pdfjs', 'build', 'pdf.js')}"></script>
      <script src="${resolveAsWebviewUri('lib', 'pdfjs', 'build', 'pdf.worker.js')}"></script>
      <script src="${resolveAsWebviewUri('lib', 'pdfjs', 'web', 'viewer.js')}"></script>
      <script src="${resolveAsWebviewUri('lib', 'webview', 'main.js')}"></script>
    `

    return html.replace('</head>', replace + '</head>')
  }
}
