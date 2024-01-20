const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  try {
    const outputChannel = vscode.window.createOutputChannel("VsClipBoard");

    // vscode.subscriptions.push(disposable);
    const valueArray = [];
    let clipboardText = "";
    let statusBarItem = clearVsClipBoardStatusBarItem();

    let copy = vscode.commands.registerCommand("ttOne.copy", async () => {
      try {
        clipboardText = await vscode.env.clipboard.readText();
        if (clipboardText.length != 0 && typeof clipboardText === "string") {
          if (valueArray.length < 10) {
            statusBarItem.show();
            valueArray.push(clipboardText);
            vscode.window.showInformationMessage("Moved to VsClipBoard");
          } else {
            vscode.window.showWarningMessage("10xCopy limit exceeded");
          }
        } else {
          vscode.window.showWarningMessage("Value is empty");
        }
      } catch (error) {
        vscode.window.showErrorMessage(
          "Error reading clipboard: " + error.message
        );
      }
    });

    const arrayManipulate = (listArray) => {
      return listArray.map((option, index) => ({
        label: `${option}`,
        buttons: [
          {
            iconPath: new vscode.ThemeIcon("eye"), // Use an eye icon as an example
            command: "command.view",
            tooltip: "View",
          },
          {
            iconPath: new vscode.ThemeIcon("trash"),
            command: "command.trash",
            tooltip: "Remove",
          },
          {
            iconPath: new vscode.ThemeIcon("files"),
            command: "command.copy",
            tooltip: "Copy",
          },
        ],
      }));
    };

    let listAllValues = vscode.commands.registerCommand(
      "ttOne.list",
      async () => {
        const quickPick = vscode.window.createQuickPick();

        quickPick.items = arrayManipulate(valueArray);

        quickPick.placeholder = "VsClipBoard Search";

        quickPick.show();

        quickPick.onDidTriggerItemButton(async (button) => {
          const details = `${button.item.label}`;
          const selectedIndexTriggerButton = valueArray.indexOf(details);

          if (button.button.tooltip == "View") {
            outputChannel.replace(details);
            outputChannel.show(true);
            context.subscriptions.push(outputChannel);
          } else if (button.button.tooltip == "Remove") {
            if (selectedIndexTriggerButton !== -1) {
              valueArray.splice(selectedIndexTriggerButton, 1);
            }

            quickPick.items = arrayManipulate(valueArray);
            vscode.window.showWarningMessage("Removed from the VsClipBoard");
          } else if (button.button.tooltip == "Copy") {
            vscode.env.clipboard.writeText(details);
            vscode.window.showInformationMessage(`Copied from the VsClipBoard`);
          } else {
            vscode.window.showErrorMessage(`Something went wrong`);
          }
        });

        quickPick.onDidChangeSelection((selection) => {
          if (selection && selection[0]) {
            // const selectedLabel = selection[0].description;
            const selectedLabel = selection[0].label;

            const editor = vscode.window.activeTextEditor;

            if (editor) {
              editor.edit((editBuilder) => {
                editBuilder.insert(editor.selection.active, selectedLabel);
              });
              quickPick.dispose();
            }
          }
        });

        quickPick.onDidHide(() => quickPick.dispose());
      }
    );

    let clearClibBoard = vscode.commands.registerCommand(
      "ttOne.clearlist",
      async () => {
        await outputChannel.hide();
        await statusBarItem.hide();
        valueArray.splice(0, valueArray.length);
        vscode.window.showInformationMessage(`VsClipBoard Cleared`);
      }
    );

    context.subscriptions.push(copy, listAllValues, clearClibBoard);
  } catch (error) {
    vscode.window.showInformationMessage(`Something went wrong - ${error}`);
  }
}

const clearVsClipBoardStatusBarItem = () => {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
  );
  
  statusBarItem.text = "$(trash) Clear VsClipBoard";
  statusBarItem.command = "ttOne.clearlist";
  // statusBarItem.show();
  // return vscode.Disposable.from(statusBarItem);
  return statusBarItem;
};

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
