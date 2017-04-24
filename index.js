'use strict'

const fs = require('fs')
const path = require('path')
const globby = require('globby')
const marked = require('marked')
const yaml = require('js-yaml')
const mkdirp = require('mkdirp')

const EXTENSIONS = {
  JSON: '.json'
}

const SOURCE_MODE = 'source'

marked.setOptions(
  {
    // renderer: new marked.Renderer(),
    // gfm: true,
    // tables: true,
    // breaks: false,
    // pedantic: false,
    // sanitize: false,
    // smartLists: true,
    // smartypants: false
  }
)

const defaultOptions = require('./defaultOptions')

function processto(options, callback) {
  // const ignoreList = defaultOptions.ignore.concat(options.ignore)
  options = Object.assign({}, defaultOptions, options)
  // options.ignore = ignoreList

  const globs = (options.files || []).concat(options._)
  // if ( !( (options.htmlRaw || options.html.length || options.webpages.length) && (options.cssRaw || options.css.length) ) ) {
  //   throw new Error('You must include HTML and CSS for input.')
  // }

  // if (options.convertMode === SOURCE_MODE) {
  //
  // }

  const p = new Promise(function(resolve, reject) {
    console.log(globs);
    globby(globs, {
      // matchBase: true
    }).then(function(result) {
      console.log(result)
      const commonDir = findCommonDir(result);
      const processingFunc = options.convertMode === SOURCE_MODE
        ? unProcessFile
        : processFile

      result.forEach(function(file) {
        processingFunc(file, function(err, data) {
          const baseFilename = file.replace(commonDir, '')
          // console.log(baseFilename, err, data)
          const parsedPath = path.parse(path.join(options.outputDir, baseFilename))
          const oldExt = parsedPath.ext
          const oldBase = parsedPath.base
          const newPathObj = Object.assign({}, parsedPath, {
            ext: EXTENSIONS.JSON,
            base: parsedPath.base.replace(oldExt, EXTENSIONS.JSON)
          })
          const newPath = path.format(newPathObj)

          if (options.includeDir) {
            data.dir = path.dirname(newPath)
          }
          if (options.includeBase) {
            data.base = path.basename(newPath)
          }
          if (options.includeExt) {
            data.ext = EXTENSIONS.JSON
          }
          if (options.includeOldBase) {
            data.oldBase = oldBase
          }
          if (options.includeExt) {
            data.oldExt = oldExt
          }
          // console.log('@@@', newPathObj);

          writeFile(newPath, JSON.stringify(data), function(e, d) {
            // console.log(e,d);
          })
        })
      })
    })
  })

  // Enable callback support too.
  if (callback) {
    p.then(result => {
      callback(null, result)
    })
  }

  return p
}

function processFile(file, cb) {
  if (fs.lstatSync(file).isDirectory()) {
    return
  }
  fs.readFile(file, (err, data) => {
    const fileContent = data.toString()
    const hasFrontmatter = fileContent.indexOf('---\n') === 0
    const isYaml = file.endsWith('.yaml') || file.endsWith('.yml')
    let content = fileContent.trim()
    let frontmatter = {}

    if (isYaml) {
      const data = yaml.safeLoad(content)
      // Callback for YAML.
      return cb(err, Object.assign({}, data))
    }

    if (hasFrontmatter) {
      let splitContent = fileContent.split('---\n')
      // Remove first string in split content which is empty.
      if (splitContent[0] === '') {
        splitContent.shift()
      }
      frontmatter = yaml.safeLoad(splitContent[0])
      content = splitContent[1].trim()
    }

    // Callback for markdown.
    return cb(
      err,
      Object.assign({}, frontmatter, {
        bodyContent: content,
        bodyHtml: marked(content),
      })
    )
  })
}

function unProcessFile(file, cb) {
  if (fs.lstatSync(file).isDirectory()) {
    return
  }
  fs.readFile(file, (err, data) => {
    const fileContent = data.toString()
    const fileData = yaml.safeLoad(fileContent)

    console.log(fileData);
    console.log(path.format(fileData));
    // const hasFrontmatter = fileContent.indexOf('---\n') === 0
    // const isYaml = file.endsWith('.yaml') || file.endsWith('.yml')
    // let content = fileContent.trim()
    // let frontmatter = {}

    // if (isYaml) {
    //   // Callback for YAML.
    //   return cb(err, Object.assign({}, data))
    // }
    //
    // if (hasFrontmatter) {
    //   let splitContent = fileContent.split('---\n')
    //   // Remove first string in split content which is empty.
    //   if (splitContent[0] === '') {
    //     splitContent.shift()
    //   }
    //   frontmatter = yaml.safeLoad(splitContent[0])
    //   content = splitContent[1].trim()
    // }
    //
    // // Callback for markdown.
    // return cb(
    //   err,
    //   Object.assign({}, frontmatter, {
    //     bodyContent: content,
    //     bodyHtml: marked(content),
    //   })
    // )
  })
}

// Write a file making sure the directory exists first.
function writeFile(file, content, cb) {
  mkdirp(path.dirname(file), function(err) {
    fs.writeFile(file, content, (e, data) => {
      cb(e, data)
    })
  })
}

// Find the common parent directory given an array of files.
function findCommonDir(files) {
  return files.reduce(function(p, c) {
    return !p ? c : p.split('').filter((letter, i) => letter === c[i]).join('')
  }, null)
}

module.exports = {
  default: processto,
}
