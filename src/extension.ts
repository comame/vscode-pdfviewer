import * as vscode from 'vscode';
import { PdfCustomProvider } from './pdfProvider';

export function activate(context: vscode.ExtensionContext): void {
  const extensionRoot = vscode.Uri.file(context.extensionPath);

  const pdfCustomProvider = new PdfCustomProvider(extensionRoot);
  const customEditorProvider = vscode.window.registerCustomEditorProvider(
    PdfCustomProvider.viewType,
    pdfCustomProvider,
    {
      webviewOptions: {
        enableFindWidget: false, // default
        retainContextWhenHidden: true,
      },
    }
  )

  const reloadCommand = vscode.commands.registerCommand('dev.comame.code-pdf.reload', () => {
    pdfCustomProvider.reload()
  })

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 0);
  statusBar.command = 'dev.comame.code-pdf.reload'
  statusBar.text = '$(refresh) Reload PDF'

  pdfCustomProvider.addStateChangeHandler((num) => {
    if (num == 0) {
      statusBar.hide()
    } else {
      statusBar.show()
    }
  })

  context.subscriptions.push(customEditorProvider, reloadCommand, statusBar);
}

export function deactivate(): void {}
