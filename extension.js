const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  try {
    const outputChannel = vscode.window.createOutputChannel("10xCopyOutput");
    const valueArray = [];
    let clipboardText = "";

    let copy = vscode.commands.registerCommand("ttOne.copy", async () => {
      try {
        clipboardText = await vscode.env.clipboard.readText();
        if (clipboardText.length != 0) {
          if (valueArray.length < 10) {
            valueArray.push(clipboardText);
            vscode.window.showInformationMessage(
              "Clipboard value moved to 10xCopy : " + clipboardText
            );
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
    

    let listAllValues = vscode.commands.registerCommand(
      "ttOne.list",
      async () => {
        const quickPick = vscode.window.createQuickPick();

        const quickPickItems = valueArray.map((option, index) => ({
          // label: `value ${index + 1}`,
          label: `${option}`,
          // Fdescription: option,
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
              iconPath: new vscode.ThemeIcon("file"),
              command: "command.copy",
              tooltip: "Copy",
            },
          ],
        }));

        quickPick.items = quickPickItems;

        quickPick.placeholder = "Select an option";

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
            quickPick.dispose();
            vscode.window.showWarningMessage('Option Deleted');

          } else if (button.button.tooltip == "Copy") {
            vscode.env.clipboard.writeText(details)
            vscode.window.showInformationMessage(`Value Copied`);
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

    context.subscriptions.push(copy, listAllValues);
  } catch (error) {
    vscode.window.showInformationMessage(`Something went wrong - ${error}`);
  }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
