const Transformer = require('./Transformer');
const { Reporter } = require('@parcel/plugin');
const { isHTMLEntryBundle } = require('./Utils');

module.exports = new Reporter({
  async report({ event }) {
    const hasBuildFinished = event.type === 'buildSuccess';
    if (!hasBuildFinished) return;

    const bundles = event.bundleGraph.getBundles();
    const HTMLEntryBundles = bundles.filter(isHTMLEntryBundle);

    const EntryHTMLFilePaths = HTMLEntryBundles.map(bundle => bundle.filePath);

    for (const filePath of EntryHTMLFilePaths) {
      const transformer = new Transformer(filePath);

      transformer.convertHTMLToScriptletImport();
      transformer.wrapDependenciesCode();
      transformer.renameDependencyFiles();
    }

    console.log(
      '\n✅ The project is ready to be deployed on Google Apps Script.'
    );
  }
});
