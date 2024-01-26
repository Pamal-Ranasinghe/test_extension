const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  try {
    const outputChannel = vscode.window.createOutputChannel("Codeclip");

    const valueArray = [];
    let clipboardText = "";
    let statusBarItem = clearCodeclipStatusBarItem();

    let copy = vscode.commands.registerCommand("codeclip.copy", async () => {
      try {
        clipboardText = await vscode.env.clipboard.readText();
        if (clipboardText.length != 0 && typeof clipboardText === "string") {
          if (valueArray.length < 10) {
            statusBarItem.show();
            valueArray.push(clipboardText);
            vscode.window.showInformationMessage("Moved to Codeclip clipboard");
          } else {
            vscode.window.showWarningMessage("Codeclip clipboard limit exceeded");
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
            iconPath: new vscode.ThemeIcon("eye"), 
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
      "codeclip.list",
      async () => {
        const quickPick = vscode.window.createQuickPick();

        quickPick.items = arrayManipulate(valueArray);

        quickPick.placeholder = "Codeclip Search";

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

            if(valueArray.length == 0){
              statusBarItem.hide();
              outputChannel.hide();
            }
            
            vscode.window.showWarningMessage("Removed from the Codeclip clipboard");
          } else if (button.button.tooltip == "Copy") {
            vscode.env.clipboard.writeText(details);
            vscode.window.showInformationMessage(`Copied from the Codeclip clipboard`);
          } else {
            vscode.window.showErrorMessage(`Something went wrong`);
          }
        });

        quickPick.onDidChangeSelection((selection) => {
          if (selection && selection[0]) {
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
      "codeclip.clearlist",
      async () => {
        await outputChannel.hide();
        await statusBarItem.hide();
        valueArray.splice(0, valueArray.length);
        vscode.window.showInformationMessage(`Codeclip Cleared`);
      }
    );

    context.subscriptions.push(copy, listAllValues, clearClibBoard);
  } catch (error) {
    vscode.window.showInformationMessage(`Something went wrong - ${error}`);
  }
}

const clearCodeclipStatusBarItem = () => {
  try{
    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left
    );
    
    statusBarItem.text = "$(trash) Clear Codeclip";
    statusBarItem.command = "codeclip.clearlist";
    return statusBarItem;
  }catch(error){
    vscode.window.showInformationMessage(`Something went wrong - ${error}`);
  }
};


function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
