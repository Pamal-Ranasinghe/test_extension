const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  try {
    console.log('Congratulations, your extension "ttOne" is now active!');
    const valueArray = [];

    let copy = vscode.commands.registerCommand("ttOne.copy", async () => {
      try {
        let clipboardText = await vscode.env.clipboard.readText();
        console.log(clipboardText.length);
        if (clipboardText.length != 0) {
          if (valueArray.length < 10) {
            valueArray.push(clipboardText);
            vscode.window.showInformationMessage(
              "Copied value: " + clipboardText
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
          label: `value ${index + 1}`,
          description: option,
		  buttons: [
			{
				iconPath: new vscode.ThemeIcon('eye'), // Use an eye icon as an example
				tooltip: 'View Details',
			}
		  ]
        }));

        quickPick.items = quickPickItems;

        quickPick.placeholder = "Select an option";

        quickPick.show();

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

		quickPick.onDidTriggerButton((button,item) => {
			console.log("Hellp");
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
