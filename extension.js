const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  try {
    const outputChannel = vscode.window.createOutputChannel('10xCopyOutput');
    const valueArray = [];
    let clipboardText = '';

    let copy = vscode.commands.registerCommand("ttOne.copy", async () => {
      try {
         clipboardText = await vscode.env.clipboard.readText();
        if (clipboardText.length != 0) {
          if (valueArray.length < 10) {
            valueArray.push(clipboardText);
            vscode.window.showInformationMessage("Clipboard value moved to 10xCopy : " + clipboardText);
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

    let listAllValues = vscode.commands.registerCommand("ttOne.list",async () => {
        const quickPick = vscode.window.createQuickPick();

        const quickPickItems = valueArray.map((option, index) => ({
          label: `value ${index + 1}`,
          description: option,
          buttons: [
            {
              iconPath: new vscode.ThemeIcon('eye'), // Use an eye icon as an example
              tooltip: 'View Details'
            }
		      ] 
        }));

        quickPick.items = quickPickItems;


        quickPick.placeholder = "Select an option";

       
        quickPick.show();

        quickPick.onDidTriggerItemButton(async (button) => {
        
          vscode.window.showInformationMessage(`${button.item.description}`);

          const details = `${button.item.description}`;
          outputChannel.replace(details);
          outputChannel.show(true);
          context.subscriptions.push(outputChannel);
        });

        quickPick.onDidChangeSelection((selection) => {
          if (selection && selection[0]) {
            const selectedLabel = selection[0].description;
            const selectedIndex = valueArray.indexOf(selectedLabel);

            const editor = vscode.window.activeTextEditor;

            if (editor) {
              editor.edit((editBuilder) => {
                editBuilder.insert(editor.selection.active, selectedLabel);
              });
              quickPick.dispose();
            }

            if (selectedIndex !== -1) {
              valueArray.splice(selectedIndex, 1);
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
