(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var htmlToImage = _interopRequireWildcard(require("html-to-image"));
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
window.htmlToImage = htmlToImage;

},{"html-to-image":9}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyStyle = applyStyle;
function applyStyle(node, options) {
  const {
    style
  } = node;
  if (options.backgroundColor) {
    style.backgroundColor = options.backgroundColor;
  }
  if (options.width) {
    style.width = `${options.width}px`;
  }
  if (options.height) {
    style.height = `${options.height}px`;
  }
  const manual = options.style;
  if (manual != null) {
    Object.keys(manual).forEach(key => {
      style[key] = manual[key];
    });
  }
  return node;
}

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cloneNode = cloneNode;
var _clonePseudos = require("./clone-pseudos");
var _util = require("./util");
var _mimes = require("./mimes");
var _dataurl = require("./dataurl");
async function cloneCanvasElement(canvas) {
  const dataURL = canvas.toDataURL();
  if (dataURL === 'data:,') {
    return canvas.cloneNode(false);
  }
  return (0, _util.createImage)(dataURL);
}
async function cloneVideoElement(video, options) {
  if (video.currentSrc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL();
    return (0, _util.createImage)(dataURL);
  }
  const poster = video.poster;
  const contentType = (0, _mimes.getMimeType)(poster);
  const dataURL = await (0, _dataurl.resourceToDataURL)(poster, contentType, options);
  return (0, _util.createImage)(dataURL);
}
async function cloneIFrameElement(iframe) {
  var _a;
  try {
    if ((_a = iframe === null || iframe === void 0 ? void 0 : iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.body) {
      return await cloneNode(iframe.contentDocument.body, {}, true);
    }
  } catch (_b) {
    // Failed to clone iframe
  }
  return iframe.cloneNode(false);
}
async function cloneSingleNode(node, options) {
  if (node instanceof HTMLCanvasElement) {
    return cloneCanvasElement(node);
  }
  if (node instanceof HTMLVideoElement) {
    return cloneVideoElement(node, options);
  }
  if (node instanceof HTMLIFrameElement) {
    return cloneIFrameElement(node);
  }
  return node.cloneNode(false);
}
const isSlotElement = node => node.tagName != null && node.tagName.toUpperCase() === 'SLOT';
async function cloneChildren(nativeNode, clonedNode, options) {
  var _a;
  const children = isSlotElement(nativeNode) && nativeNode.assignedNodes ? (0, _util.toArray)(nativeNode.assignedNodes()) : (0, _util.toArray)(((_a = nativeNode.shadowRoot) !== null && _a !== void 0 ? _a : nativeNode).childNodes);
  if (children.length === 0 || nativeNode instanceof HTMLVideoElement) {
    return clonedNode;
  }
  await children.reduce((deferred, child) => deferred.then(() => cloneNode(child, options)).then(clonedChild => {
    if (clonedChild) {
      clonedNode.appendChild(clonedChild);
    }
  }), Promise.resolve());
  return clonedNode;
}
function cloneCSSStyle(nativeNode, clonedNode) {
  const targetStyle = clonedNode.style;
  if (!targetStyle) {
    return;
  }
  const sourceStyle = window.getComputedStyle(nativeNode);
  if (sourceStyle.cssText) {
    targetStyle.cssText = sourceStyle.cssText;
    targetStyle.transformOrigin = sourceStyle.transformOrigin;
  } else {
    (0, _util.toArray)(sourceStyle).forEach(name => {
      let value = sourceStyle.getPropertyValue(name);
      if (name === 'font-size' && value.endsWith('px')) {
        const reducedFont = Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
        value = `${reducedFont}px`;
      }
      targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
    });
  }
}
function cloneInputValue(nativeNode, clonedNode) {
  if (nativeNode instanceof HTMLTextAreaElement) {
    clonedNode.innerHTML = nativeNode.value;
  }
  if (nativeNode instanceof HTMLInputElement) {
    clonedNode.setAttribute('value', nativeNode.value);
  }
}
function cloneSelectValue(nativeNode, clonedNode) {
  if (nativeNode instanceof HTMLSelectElement) {
    const clonedSelect = clonedNode;
    const selectedOption = Array.from(clonedSelect.children).find(child => nativeNode.value === child.getAttribute('value'));
    if (selectedOption) {
      selectedOption.setAttribute('selected', '');
    }
  }
}
function decorate(nativeNode, clonedNode) {
  if (clonedNode instanceof Element) {
    cloneCSSStyle(nativeNode, clonedNode);
    (0, _clonePseudos.clonePseudoElements)(nativeNode, clonedNode);
    cloneInputValue(nativeNode, clonedNode);
    cloneSelectValue(nativeNode, clonedNode);
  }
  return clonedNode;
}
async function ensureSVGSymbols(clone, options) {
  const uses = clone.querySelectorAll ? clone.querySelectorAll('use') : [];
  if (uses.length === 0) {
    return clone;
  }
  const processedDefs = {};
  for (let i = 0; i < uses.length; i++) {
    const use = uses[i];
    const id = use.getAttribute('xlink:href');
    if (id) {
      const exist = clone.querySelector(id);
      const definition = document.querySelector(id);
      if (!exist && definition && !processedDefs[id]) {
        // eslint-disable-next-line no-await-in-loop
        processedDefs[id] = await cloneNode(definition, options, true);
      }
    }
  }
  const nodes = Object.values(processedDefs);
  if (nodes.length) {
    const ns = 'http://www.w3.org/1999/xhtml';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('xmlns', ns);
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.overflow = 'hidden';
    svg.style.display = 'none';
    const defs = document.createElementNS(ns, 'defs');
    svg.appendChild(defs);
    for (let i = 0; i < nodes.length; i++) {
      defs.appendChild(nodes[i]);
    }
    clone.appendChild(svg);
  }
  return clone;
}
async function cloneNode(node, options, isRoot) {
  if (!isRoot && options.filter && !options.filter(node)) {
    return null;
  }
  return Promise.resolve(node).then(clonedNode => cloneSingleNode(clonedNode, options)).then(clonedNode => cloneChildren(node, clonedNode, options)).then(clonedNode => decorate(node, clonedNode)).then(clonedNode => ensureSVGSymbols(clonedNode, options));
}

},{"./clone-pseudos":4,"./dataurl":5,"./mimes":10,"./util":11}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clonePseudoElements = clonePseudoElements;
var _util = require("./util");
function formatCSSText(style) {
  const content = style.getPropertyValue('content');
  return `${style.cssText} content: '${content.replace(/'|"/g, '')}';`;
}
function formatCSSProperties(style) {
  return (0, _util.toArray)(style).map(name => {
    const value = style.getPropertyValue(name);
    const priority = style.getPropertyPriority(name);
    return `${name}: ${value}${priority ? ' !important' : ''};`;
  }).join(' ');
}
function getPseudoElementStyle(className, pseudo, style) {
  const selector = `.${className}:${pseudo}`;
  const cssText = style.cssText ? formatCSSText(style) : formatCSSProperties(style);
  return document.createTextNode(`${selector}{${cssText}}`);
}
function clonePseudoElement(nativeNode, clonedNode, pseudo) {
  const style = window.getComputedStyle(nativeNode, pseudo);
  const content = style.getPropertyValue('content');
  if (content === '' || content === 'none') {
    return;
  }
  const className = (0, _util.uuid)();
  try {
    clonedNode.className = `${clonedNode.className} ${className}`;
  } catch (err) {
    return;
  }
  const styleElement = document.createElement('style');
  styleElement.appendChild(getPseudoElementStyle(className, pseudo, style));
  clonedNode.appendChild(styleElement);
}
function clonePseudoElements(nativeNode, clonedNode) {
  clonePseudoElement(nativeNode, clonedNode, ':before');
  clonePseudoElement(nativeNode, clonedNode, ':after');
}

},{"./util":11}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetchAsDataURL = fetchAsDataURL;
exports.isDataUrl = isDataUrl;
exports.makeDataUrl = makeDataUrl;
exports.resourceToDataURL = resourceToDataURL;
function getContentFromDataUrl(dataURL) {
  return dataURL.split(/,/)[1];
}
function isDataUrl(url) {
  return url.search(/^(data:)/) !== -1;
}
function makeDataUrl(content, mimeType) {
  return `data:${mimeType};base64,${content}`;
}
async function fetchAsDataURL(url, init, process) {
  const res = await fetch(url, init);
  if (res.status === 404) {
    throw new Error(`Resource "${res.url}" not found`);
  }
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onloadend = () => {
      try {
        resolve(process({
          res,
          result: reader.result
        }));
      } catch (error) {
        reject(error);
      }
    };
    reader.readAsDataURL(blob);
  });
}
const cache = {};
function getCacheKey(url, contentType, includeQueryParams) {
  let key = url.replace(/\?.*/, '');
  if (includeQueryParams) {
    key = url;
  }
  // font resource
  if (/ttf|otf|eot|woff2?/i.test(key)) {
    key = key.replace(/.*\//, '');
  }
  return contentType ? `[${contentType}]${key}` : key;
}
async function resourceToDataURL(resourceUrl, contentType, options) {
  const cacheKey = getCacheKey(resourceUrl, contentType, options.includeQueryParams);
  if (cache[cacheKey] != null) {
    return cache[cacheKey];
  }
  // ref: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
  if (options.cacheBust) {
    // eslint-disable-next-line no-param-reassign
    resourceUrl += (/\?/.test(resourceUrl) ? '&' : '?') + new Date().getTime();
  }
  let dataURL;
  try {
    const content = await fetchAsDataURL(resourceUrl, options.fetchRequestInit, ({
      res,
      result
    }) => {
      if (!contentType) {
        // eslint-disable-next-line no-param-reassign
        contentType = res.headers.get('Content-Type') || '';
      }
      return getContentFromDataUrl(result);
    });
    dataURL = makeDataUrl(content, contentType);
  } catch (error) {
    dataURL = options.imagePlaceholder || '';
    let msg = `Failed to fetch resource: ${resourceUrl}`;
    if (error) {
      msg = typeof error === 'string' ? error : error.message;
    }
    if (msg) {
      // console.warn(msg);
    }
  }
  cache[cacheKey] = dataURL;
  return dataURL;
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.embedImages = embedImages;
var _embedResources = require("./embed-resources");
var _util = require("./util");
var _dataurl = require("./dataurl");
var _mimes = require("./mimes");
async function embedBackground(clonedNode, options) {
  var _a;
  const background = (_a = clonedNode.style) === null || _a === void 0 ? void 0 : _a.getPropertyValue('background');
  if (background) {
    const cssString = await (0, _embedResources.embedResources)(background, null, options);
    clonedNode.style.setProperty('background', cssString, clonedNode.style.getPropertyPriority('background'));
  }
}
async function embedImageNode(clonedNode, options) {
  if (!(clonedNode instanceof HTMLImageElement && !(0, _dataurl.isDataUrl)(clonedNode.src)) && !(clonedNode instanceof SVGImageElement && !(0, _dataurl.isDataUrl)(clonedNode.href.baseVal))) {
    return;
  }
  const url = clonedNode instanceof HTMLImageElement ? clonedNode.src : clonedNode.href.baseVal;
  const dataURL = await (0, _dataurl.resourceToDataURL)(url, (0, _mimes.getMimeType)(url), options);
  await new Promise((resolve, reject) => {
    clonedNode.onload = resolve;
    clonedNode.onerror = reject;
    const image = clonedNode;
    if (image.decode) {
      image.decode = resolve;
    }
    if (clonedNode instanceof HTMLImageElement) {
      clonedNode.srcset = '';
      clonedNode.src = dataURL;
    } else {
      clonedNode.href.baseVal = dataURL;
    }
  });
}
async function embedChildren(clonedNode, options) {
  const children = (0, _util.toArray)(clonedNode.childNodes);
  const deferreds = children.map(child => embedImages(child, options));
  await Promise.all(deferreds).then(() => clonedNode);
}
async function embedImages(clonedNode, options) {
  if (clonedNode instanceof Element) {
    await embedBackground(clonedNode, options);
    await embedImageNode(clonedNode, options);
    await embedChildren(clonedNode, options);
  }
}

},{"./dataurl":5,"./embed-resources":7,"./mimes":10,"./util":11}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.embed = embed;
exports.embedResources = embedResources;
exports.parseURLs = parseURLs;
exports.shouldEmbed = shouldEmbed;
var _util = require("./util");
var _mimes = require("./mimes");
var _dataurl = require("./dataurl");
const URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
const URL_WITH_FORMAT_REGEX = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
const FONT_SRC_REGEX = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
function toRegex(url) {
  // eslint-disable-next-line no-useless-escape
  const escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
  return new RegExp(`(url\\(['"]?)(${escaped})(['"]?\\))`, 'g');
}
function parseURLs(cssText) {
  const urls = [];
  cssText.replace(URL_REGEX, (raw, quotation, url) => {
    urls.push(url);
    return raw;
  });
  return urls.filter(url => !(0, _dataurl.isDataUrl)(url));
}
async function embed(cssText, resourceURL, baseURL, options, getContentFromUrl) {
  try {
    const resolvedURL = baseURL ? (0, _util.resolveUrl)(resourceURL, baseURL) : resourceURL;
    const contentType = (0, _mimes.getMimeType)(resourceURL);
    let dataURL;
    if (getContentFromUrl) {
      const content = await getContentFromUrl(resolvedURL);
      dataURL = (0, _dataurl.makeDataUrl)(content, contentType);
    } else {
      dataURL = await (0, _dataurl.resourceToDataURL)(resolvedURL, contentType, options);
    }
    return cssText.replace(toRegex(resourceURL), `$1${dataURL}$3`);
  } catch (error) {
    // pass
  }
  return cssText;
}
function filterPreferredFontFormat(str, {
  preferredFontFormat
}) {
  return !preferredFontFormat ? str : str.replace(FONT_SRC_REGEX, match => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const [src,, format] = URL_WITH_FORMAT_REGEX.exec(match) || [];
      if (!format) {
        return '';
      }
      if (format === preferredFontFormat) {
        return `src: ${src};`;
      }
    }
  });
}
function shouldEmbed(url) {
  return url.search(URL_REGEX) !== -1;
}
async function embedResources(cssText, baseUrl, options) {
  if (!shouldEmbed(cssText)) {
    return cssText;
  }
  const filteredCSSText = filterPreferredFontFormat(cssText, options);
  const urls = parseURLs(filteredCSSText);
  return urls.reduce((deferred, url) => deferred.then(css => embed(css, url, baseUrl, options)), Promise.resolve(filteredCSSText));
}

},{"./dataurl":5,"./mimes":10,"./util":11}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.embedWebFonts = embedWebFonts;
exports.getWebFontCSS = getWebFontCSS;
var _util = require("./util");
var _dataurl = require("./dataurl");
var _embedResources = require("./embed-resources");
const cssFetchCache = {};
async function fetchCSS(url) {
  let cache = cssFetchCache[url];
  if (cache != null) {
    return cache;
  }
  const res = await fetch(url);
  const cssText = await res.text();
  cache = {
    url,
    cssText
  };
  cssFetchCache[url] = cache;
  return cache;
}
async function embedFonts(data, options) {
  let cssText = data.cssText;
  const regexUrl = /url\(["']?([^"')]+)["']?\)/g;
  const fontLocs = cssText.match(/url\([^)]+\)/g) || [];
  const loadFonts = fontLocs.map(async loc => {
    let url = loc.replace(regexUrl, '$1');
    if (!url.startsWith('https://')) {
      url = new URL(url, data.url).href;
    }
    return (0, _dataurl.fetchAsDataURL)(url, options.fetchRequestInit, ({
      result
    }) => {
      cssText = cssText.replace(loc, `url(${result})`);
      return [loc, result];
    });
  });
  return Promise.all(loadFonts).then(() => cssText);
}
function parseCSS(source) {
  if (source == null) {
    return [];
  }
  const result = [];
  const commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
  // strip out comments
  let cssText = source.replace(commentsRegex, '');
  // eslint-disable-next-line prefer-regex-literals
  const keyframesRegex = new RegExp('((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})', 'gi');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const matches = keyframesRegex.exec(cssText);
    if (matches === null) {
      break;
    }
    result.push(matches[0]);
  }
  cssText = cssText.replace(keyframesRegex, '');
  const importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
  // to match css & media queries together
  const combinedCSSRegex = '((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]' + '*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})';
  // unified regex
  const unifiedRegex = new RegExp(combinedCSSRegex, 'gi');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    let matches = importRegex.exec(cssText);
    if (matches === null) {
      matches = unifiedRegex.exec(cssText);
      if (matches === null) {
        break;
      } else {
        importRegex.lastIndex = unifiedRegex.lastIndex;
      }
    } else {
      unifiedRegex.lastIndex = importRegex.lastIndex;
    }
    result.push(matches[0]);
  }
  return result;
}
async function getCSSRules(styleSheets, options) {
  const ret = [];
  const deferreds = [];
  // First loop inlines imports
  styleSheets.forEach(sheet => {
    if ('cssRules' in sheet) {
      try {
        (0, _util.toArray)(sheet.cssRules || []).forEach((item, index) => {
          if (item.type === CSSRule.IMPORT_RULE) {
            let importIndex = index + 1;
            const url = item.href;
            const deferred = fetchCSS(url).then(metadata => embedFonts(metadata, options)).then(cssText => parseCSS(cssText).forEach(rule => {
              try {
                sheet.insertRule(rule, rule.startsWith('@import') ? importIndex += 1 : sheet.cssRules.length);
              } catch (error) {
                // console.error('Error inserting rule from remote css', {
                //   rule,
                //   error
                // });
              }
            })).catch(e => {
              // console.error('Error loading remote css', e.toString());
            });
            deferreds.push(deferred);
          }
        });
      } catch (e) {
        const inline = styleSheets.find(a => a.href == null) || document.styleSheets[0];
        if (sheet.href != null) {
          deferreds.push(fetchCSS(sheet.href).then(metadata => embedFonts(metadata, options)).then(cssText => parseCSS(cssText).forEach(rule => {
            inline.insertRule(rule, sheet.cssRules.length);
          })).catch(err => {
            // console.error('Error loading remote stylesheet', err.toString());
          }));
        }
        // console.error('Error inlining remote css file', e.toString());
      }
    }
  });
  return Promise.all(deferreds).then(() => {
    // Second loop parses rules
    styleSheets.forEach(sheet => {
      if ('cssRules' in sheet) {
        try {
          (0, _util.toArray)(sheet.cssRules || []).forEach(item => {
            ret.push(item);
          });
        } catch (e) {
          // console.error(`Error while reading CSS rules from ${sheet.href}`, e.toString());
        }
      }
    });
    return ret;
  });
}
function getWebFontRules(cssRules) {
  return cssRules.filter(rule => rule.type === CSSRule.FONT_FACE_RULE).filter(rule => (0, _embedResources.shouldEmbed)(rule.style.getPropertyValue('src')));
}
async function parseWebFontRules(node, options) {
  if (node.ownerDocument == null) {
    throw new Error('Provided element is not within a Document');
  }
  const styleSheets = (0, _util.toArray)(node.ownerDocument.styleSheets);
  const cssRules = await getCSSRules(styleSheets, options);
  return getWebFontRules(cssRules);
}
async function getWebFontCSS(node, options) {
  const rules = await parseWebFontRules(node, options);
  const cssTexts = await Promise.all(rules.map(rule => {
    const baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
    return (0, _embedResources.embedResources)(rule.cssText, baseUrl, options);
  }));
  return cssTexts.join('\n');
}
async function embedWebFonts(clonedNode, options) {
  const cssText = options.fontEmbedCSS != null ? options.fontEmbedCSS : options.skipFonts ? null : await getWebFontCSS(clonedNode, options);
  if (cssText) {
    const styleNode = document.createElement('style');
    const sytleContent = document.createTextNode(cssText);
    styleNode.appendChild(sytleContent);
    if (clonedNode.firstChild) {
      clonedNode.insertBefore(styleNode, clonedNode.firstChild);
    } else {
      clonedNode.appendChild(styleNode);
    }
  }
}

},{"./dataurl":5,"./embed-resources":7,"./util":11}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFontEmbedCSS = getFontEmbedCSS;
exports.toBlob = toBlob;
exports.toCanvas = toCanvas;
exports.toJpeg = toJpeg;
exports.toPixelData = toPixelData;
exports.toPng = toPng;
exports.toSvg = toSvg;
var _cloneNode = require("./clone-node");
var _embedImages = require("./embed-images");
var _applyStyle = require("./apply-style");
var _embedWebfonts = require("./embed-webfonts");
var _util = require("./util");
async function toSvg(node, options = {}) {
  const {
    width,
    height
  } = (0, _util.getImageSize)(node, options);
  const clonedNode = await (0, _cloneNode.cloneNode)(node, options, true);
  await (0, _embedWebfonts.embedWebFonts)(clonedNode, options);
  await (0, _embedImages.embedImages)(clonedNode, options);
  (0, _applyStyle.applyStyle)(clonedNode, options);
  const datauri = await (0, _util.nodeToDataURL)(clonedNode, width, height);
  return datauri;
}
async function toCanvas(node, options = {}) {
  const {
    width,
    height
  } = (0, _util.getImageSize)(node, options);
  const svg = await toSvg(node, options);
  const img = await (0, _util.createImage)(svg);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const ratio = options.pixelRatio || (0, _util.getPixelRatio)();
  const canvasWidth = options.canvasWidth || width;
  const canvasHeight = options.canvasHeight || height;
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
  if (!options.skipAutoScale) {
    (0, _util.checkCanvasDimensions)(canvas);
  }
  canvas.style.width = `${canvasWidth}`;
  canvas.style.height = `${canvasHeight}`;
  if (options.backgroundColor) {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}
async function toPixelData(node, options = {}) {
  const {
    width,
    height
  } = (0, _util.getImageSize)(node, options);
  const canvas = await toCanvas(node, options);
  const ctx = canvas.getContext('2d');
  return ctx.getImageData(0, 0, width, height).data;
}
async function toPng(node, options = {}) {
  const canvas = await toCanvas(node, options);
  return canvas.toDataURL();
}
async function toJpeg(node, options = {}) {
  const canvas = await toCanvas(node, options);
  return canvas.toDataURL('image/jpeg', options.quality || 1);
}
async function toBlob(node, options = {}) {
  const canvas = await toCanvas(node, options);
  const blob = await (0, _util.canvasToBlob)(canvas);
  return blob;
}
async function getFontEmbedCSS(node, options = {}) {
  return (0, _embedWebfonts.getWebFontCSS)(node, options);
}

},{"./apply-style":2,"./clone-node":3,"./embed-images":6,"./embed-webfonts":8,"./util":11}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMimeType = getMimeType;
const WOFF = 'application/font-woff';
const JPEG = 'image/jpeg';
const mimes = {
  woff: WOFF,
  woff2: WOFF,
  ttf: 'application/font-truetype',
  eot: 'application/vnd.ms-fontobject',
  png: 'image/png',
  jpg: JPEG,
  jpeg: JPEG,
  gif: 'image/gif',
  tiff: 'image/tiff',
  svg: 'image/svg+xml',
  webp: 'image/webp'
};
function getExtension(url) {
  const match = /\.([^./]*?)$/g.exec(url);
  return match ? match[1] : '';
}
function getMimeType(url) {
  const extension = getExtension(url).toLowerCase();
  return mimes[extension] || '';
}

},{}],11:[function(require,module,exports){
(function (process){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canvasToBlob = canvasToBlob;
exports.checkCanvasDimensions = checkCanvasDimensions;
exports.createImage = createImage;
exports.delay = delay;
exports.getImageSize = getImageSize;
exports.getPixelRatio = getPixelRatio;
exports.nodeToDataURL = nodeToDataURL;
exports.resolveUrl = resolveUrl;
exports.svgToDataURL = svgToDataURL;
exports.toArray = toArray;
exports.uuid = void 0;
function resolveUrl(url, baseUrl) {
  // url is absolute already
  if (url.match(/^[a-z]+:\/\//i)) {
    return url;
  }
  // url is absolute already, without protocol
  if (url.match(/^\/\//)) {
    return window.location.protocol + url;
  }
  // dataURI, mailto:, tel:, etc.
  if (url.match(/^[a-z]+:/i)) {
    return url;
  }
  const doc = document.implementation.createHTMLDocument();
  const base = doc.createElement('base');
  const a = doc.createElement('a');
  doc.head.appendChild(base);
  doc.body.appendChild(a);
  if (baseUrl) {
    base.href = baseUrl;
  }
  a.href = url;
  return a.href;
}
const uuid = (() => {
  // generate uuid for className of pseudo elements.
  // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
  let counter = 0;
  // ref: http://stackoverflow.com/a/6248722/2519373
  const random = () =>
  // eslint-disable-next-line no-bitwise
  `0000${(Math.random() * 36 ** 4 << 0).toString(36)}`.slice(-4);
  return () => {
    counter += 1;
    return `u${random()}${counter}`;
  };
})();
exports.uuid = uuid;
function delay(ms) {
  return args => new Promise(resolve => {
    setTimeout(() => resolve(args), ms);
  });
}
function toArray(arrayLike) {
  const arr = [];
  for (let i = 0, l = arrayLike.length; i < l; i++) {
    arr.push(arrayLike[i]);
  }
  return arr;
}
function px(node, styleProperty) {
  const win = node.ownerDocument.defaultView || window;
  const val = win.getComputedStyle(node).getPropertyValue(styleProperty);
  return val ? parseFloat(val.replace('px', '')) : 0;
}
function getNodeWidth(node) {
  const leftBorder = px(node, 'border-left-width');
  const rightBorder = px(node, 'border-right-width');
  return node.clientWidth + leftBorder + rightBorder;
}
function getNodeHeight(node) {
  const topBorder = px(node, 'border-top-width');
  const bottomBorder = px(node, 'border-bottom-width');
  return node.clientHeight + topBorder + bottomBorder;
}
function getImageSize(targetNode, options = {}) {
  const width = options.width || getNodeWidth(targetNode);
  const height = options.height || getNodeHeight(targetNode);
  return {
    width,
    height
  };
}
function getPixelRatio() {
  let ratio;
  let FINAL_PROCESS;
  try {
    FINAL_PROCESS = process;
  } catch (e) {
    // pass
  }
  const val = FINAL_PROCESS && FINAL_PROCESS.env ? FINAL_PROCESS.env.devicePixelRatio : null;
  if (val) {
    ratio = parseInt(val, 10);
    if (Number.isNaN(ratio)) {
      ratio = 1;
    }
  }
  return ratio || window.devicePixelRatio || 1;
}
// @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size
const canvasDimensionLimit = 16384;
function checkCanvasDimensions(canvas) {
  if (canvas.width > canvasDimensionLimit || canvas.height > canvasDimensionLimit) {
    if (canvas.width > canvasDimensionLimit && canvas.height > canvasDimensionLimit) {
      if (canvas.width > canvas.height) {
        canvas.height *= canvasDimensionLimit / canvas.width;
        canvas.width = canvasDimensionLimit;
      } else {
        canvas.width *= canvasDimensionLimit / canvas.height;
        canvas.height = canvasDimensionLimit;
      }
    } else if (canvas.width > canvasDimensionLimit) {
      canvas.height *= canvasDimensionLimit / canvas.width;
      canvas.width = canvasDimensionLimit;
    } else {
      canvas.width *= canvasDimensionLimit / canvas.height;
      canvas.height = canvasDimensionLimit;
    }
  }
}
function canvasToBlob(canvas, options = {}) {
  if (canvas.toBlob) {
    return new Promise(resolve => {
      canvas.toBlob(resolve, options.type ? options.type : 'image/png', options.quality ? options.quality : 1);
    });
  }
  return new Promise(resolve => {
    const binaryString = window.atob(canvas.toDataURL(options.type ? options.type : undefined, options.quality ? options.quality : undefined).split(',')[1]);
    const len = binaryString.length;
    const binaryArray = new Uint8Array(len);
    for (let i = 0; i < len; i += 1) {
      binaryArray[i] = binaryString.charCodeAt(i);
    }
    resolve(new Blob([binaryArray], {
      type: options.type ? options.type : 'image/png'
    }));
  });
}
function createImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decode = () => resolve(img);
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.src = url;
  });
}
async function svgToDataURL(svg) {
  return Promise.resolve().then(() => new XMLSerializer().serializeToString(svg)).then(encodeURIComponent).then(html => `data:image/svg+xml;charset=utf-8,${html}`);
}
async function nodeToDataURL(node, width, height) {
  const xmlns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(xmlns, 'svg');
  const foreignObject = document.createElementNS(xmlns, 'foreignObject');
  svg.setAttribute('width', `${width}`);
  svg.setAttribute('height', `${height}`);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  foreignObject.setAttribute('width', '100%');
  foreignObject.setAttribute('height', '100%');
  foreignObject.setAttribute('x', '0');
  foreignObject.setAttribute('y', '0');
  foreignObject.setAttribute('externalResourcesRequired', 'true');
  svg.appendChild(foreignObject);
  foreignObject.appendChild(node);
  return svgToDataURL(svg);
}

}).call(this)}).call(this,require('_process'))
},{"_process":12}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[1]);
