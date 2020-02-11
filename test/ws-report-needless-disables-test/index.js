'use strict';

const path = require('path');
const pWaitFor = require('p-wait-for');
const test = require('tape');
const { extensions, workspace, window, Uri, commands, languages } = require('vscode');

const run = () =>
	test('vscode-stylelint with "stylelint.reportNeedlessDisables"', async (t) => {
		await commands.executeCommand('vscode.openFolder', Uri.file(__dirname));

		const vscodeStylelint = extensions.getExtension('stylelint.vscode-stylelint');

		// Open the './test.css' file.
		const cssDocument = await workspace.openTextDocument(path.resolve(__dirname, 'test.css'));

		await window.showTextDocument(cssDocument);

		// Wait for diagnostics result.
		await pWaitFor(() => vscodeStylelint.isActive, { timeout: 2000 });
		await pWaitFor(() => languages.getDiagnostics(cssDocument.uri).length > 0, { timeout: 5000 });

		// Check the result.
		const diagnostics = languages.getDiagnostics(cssDocument.uri);

		t.deepEqual(
			diagnostics.map((o) => ({ ...o, range: normalizeRange(o.range) })),
			[
				{
					range: { start: { line: 3, character: 0 }, end: { line: 3, character: 15 } },
					message: 'unused rule: indentation, start line: 4, end line: 4',
					severity: 1,
					code: 'indentation',
					source: 'stylelint',
				},
				{
					range: { start: { line: 6, character: 0 }, end: { line: 10, character: 34 } },
					message: 'unused rule: indentation, start line: 7, end line: 11',
					severity: 1,
					code: 'indentation',
					source: 'stylelint',
				},
				{
					range: { start: { line: 14, character: 0 }, end: { line: 14, character: 56 } },
					message: 'unused rule: indentation, start line: 15, end line: 15',
					severity: 1,
					code: 'indentation',
					source: 'stylelint',
				},
				{
					range: { start: { line: 17, character: 0 }, end: { line: 21, character: 0 } },
					message: 'unused rule: indentation, start line: 18',
					severity: 1,
					code: 'indentation',
					source: 'stylelint',
				},
				{
					range: { start: { line: 2, character: 2 }, end: { line: 2, character: 2 } },
					message: 'Expected indentation of 4 spaces (indentation)',
					severity: 0,
					code: 'indentation',
					source: 'stylelint',
				},
			],
			'should work if "stylelint.reportNeedlessDisables" is enabled.',
		);

		t.end();
	});

exports.run = (root, done) => {
	test.onFinish(done);
	run();
};

function normalizeRange(range) {
	const obj = {
		start: {
			line: range.start.line,
			character: range.start.character,
		},
	};

	if (range.end !== undefined) {
		obj.end = {
			line: range.end.line,
			character: range.end.character,
		};
	}

	return obj;
}
