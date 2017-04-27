module.exports = {
  // The directory output will be processed to.
  outputDir: './dist',
  // Prefix for output filenames, default is no prefix, just the original filename.
  filenamePrefix: '',
  // For markdown files how many characters should be included in an add `preview` property. 0 for no preview.
  preview: 0,
  // Include the markdown document title as `title` on the resulting json objects.
  includeTitle: true,
  // Include the directory as `dir` on the resulting json objects.
  includeDir: true,
  // Include the filename (.json) as `base` on the resulting json objects.
  includeBase: true,
  // Include the extension (.json) as `ext` on the resulting json objects.
  includeExt: true,
  // Include the source filename (.md / .yml) as `sourceBase` on the resulting json objects.
  includeSourceBase: true,
  // Include the source extension (.md / .yml) as `sourceExt` on the resulting json objects.
  includeSourceExt: true,
  // Convert mode. Possible options for this are 'json' or 'source'.
  convertMode: 'json',
  // Whether to output to stdout or not.
  stdout: false,
  // Custom markdown renderer function, null to use the default: `marked`.
  markdownRenderer: null,
}
