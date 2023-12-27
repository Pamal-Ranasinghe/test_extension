// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "ttOne" is now active!');
	let valueArray = [];

	let disposable = vscode.commands.registerCommand('ttOne.helloWorld', async () => {
		try{
			let clipboardText = await vscode.env.clipboard.readText();
			vscode.window.showInformationMessage('Copied value: ' + clipboardText);
			valueArray.push(clipboardText);
			console.log(valueArray);
			clipboardText='';
		} catch (error){
			// vscode.window.showErrorMessage('Error reading clipboard: ' + error.message);
			console.log('Error : ' + error.message);
		}
		
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
