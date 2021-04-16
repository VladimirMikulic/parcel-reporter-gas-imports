const fs = require('fs');
const { getDependencies } = require('./Utils');

const prependFileSync = require('prepend-file').sync;
const replaceInFileSync = require('replace-in-file').sync;

/**
 * Given an HTML file, it can do the following:
 * 1) Convert HTML script/link imports to GAS imports
 * 2) Wrap JS/CSS code in <script>/<style> to be GAS compatible
 * 3) Rename JS/CSS files to HTML files since GAS only allows HTML & GS (server-side JS)
 */
class Transformer {
  constructor(htmlFilePath) {
    this.filePath = htmlFilePath;
    this.dependencies = getDependencies(htmlFilePath);
  }

  convertHTMLToScriptletImport() {
    for (const dependency of this.dependencies) {
      const { fileName, sourceLine } = dependency;
      const scriptletImport = `<?!= HtmlService.createTemplateFromFile("${fileName}").getRawContent() ?>`;

      replaceInFileSync({
        files: this.filePath,
        from: sourceLine,
        to: scriptletImport
      });
    }
  }

  wrapDependenciesCode() {
    for (const { filePath } of this.dependencies) {
      const fileType = filePath.split('.').slice(-1)[0];
      const isCSSFile = fileType === 'css';

      const openTag = isCSSFile ? '<style>' : '<script>';
      const closeTag = isCSSFile ? '</style>' : '</script>';

      if (!fs.existsSync(filePath)) continue;

      prependFileSync(filePath, openTag);
      fs.appendFileSync(filePath, closeTag);
    }
  }

  renameDependencyFiles() {
    for (const { filePath } of this.dependencies) {
      if (!fs.existsSync(filePath)) continue;
      fs.renameSync(filePath, `${filePath}.html`);
    }
  }
}

module.exports = Transformer;
