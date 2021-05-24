const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

const isHTMLEntryBundle = bundle => bundle.type === 'html' && bundle.isEntry;

const isNotExternalResource = virtualEl =>
  !virtualEl.rawAttrs.match(/((src=)|(href=)).*https?:\/\//);

const getImportElements = htmlFilePath => {
  const entryFileSource = fs.readFileSync(htmlFilePath, 'utf-8');
  const virtualDOM = parse(entryFileSource);

  const importElements = virtualDOM
    .querySelectorAll('link[href], script[src]')
    .filter(isNotExternalResource);

  return importElements;
};

const getDependencies = htmlFilePath => {
  const distDirPath = htmlFilePath.split('/').slice(0, -1).join('/');
  const importElements = getImportElements(htmlFilePath);

  const dependencies = [];

  for (const element of importElements) {
    const importAttr = element.rawTagName === 'link' ? 'href' : 'src';
    const importPath = element.getAttribute(importAttr);

    const sourceLine = element.toString();
    const filePath = path.join(distDirPath, importPath);
    const fileName = importPath.split('/').slice(-1).join();

    dependencies.push({ fileName, filePath, sourceLine });
  }

  return dependencies;
};

module.exports = {
  isHTMLEntryBundle,
  isNotExternalResource,
  getImportElements,
  getDependencies
};
