(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.htmlToImage = {}));
})(this, (function (exports) { 'use strict';

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (g && (g = 0, op[0] && (_ = 0)), _) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

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
        var doc = document.implementation.createHTMLDocument();
        var base = doc.createElement('base');
        var a = doc.createElement('a');
        doc.head.appendChild(base);
        doc.body.appendChild(a);
        if (baseUrl) {
            base.href = baseUrl;
        }
        a.href = url;
        return a.href;
    }
    var uuid = (function () {
        // generate uuid for className of pseudo elements.
        // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
        var counter = 0;
        // ref: http://stackoverflow.com/a/6248722/2519373
        var random = function () {
            // eslint-disable-next-line no-bitwise
            return "0000".concat(((Math.random() * Math.pow(36, 4)) << 0).toString(36)).slice(-4);
        };
        return function () {
            counter += 1;
            return "u".concat(random()).concat(counter);
        };
    })();
    function toArray(arrayLike) {
        var arr = [];
        for (var i = 0, l = arrayLike.length; i < l; i++) {
            arr.push(arrayLike[i]);
        }
        return arr;
    }
    function px(node, styleProperty) {
        var win = node.ownerDocument.defaultView || window;
        var val = win.getComputedStyle(node).getPropertyValue(styleProperty);
        return val ? parseFloat(val.replace('px', '')) : 0;
    }
    function getNodeWidth(node) {
        var leftBorder = px(node, 'border-left-width');
        var rightBorder = px(node, 'border-right-width');
        return node.clientWidth + leftBorder + rightBorder;
    }
    function getNodeHeight(node) {
        var topBorder = px(node, 'border-top-width');
        var bottomBorder = px(node, 'border-bottom-width');
        return node.clientHeight + topBorder + bottomBorder;
    }
    function getImageSize(targetNode, options) {
        if (options === void 0) { options = {}; }
        var width = options.width || getNodeWidth(targetNode);
        var height = options.height || getNodeHeight(targetNode);
        return { width: width, height: height };
    }
    function getPixelRatio() {
        var ratio;
        var FINAL_PROCESS;
        try {
            FINAL_PROCESS = process;
        }
        catch (e) {
            // pass
        }
        var val = FINAL_PROCESS && FINAL_PROCESS.env
            ? FINAL_PROCESS.env.devicePixelRatio
            : null;
        if (val) {
            ratio = parseInt(val, 10);
            if (Number.isNaN(ratio)) {
                ratio = 1;
            }
        }
        return ratio || window.devicePixelRatio || 1;
    }
    // @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#maximum_canvas_size
    var canvasDimensionLimit = 16384;
    function checkCanvasDimensions(canvas) {
        if (canvas.width > canvasDimensionLimit ||
            canvas.height > canvasDimensionLimit) {
            if (canvas.width > canvasDimensionLimit &&
                canvas.height > canvasDimensionLimit) {
                if (canvas.width > canvas.height) {
                    canvas.height *= canvasDimensionLimit / canvas.width;
                    canvas.width = canvasDimensionLimit;
                }
                else {
                    canvas.width *= canvasDimensionLimit / canvas.height;
                    canvas.height = canvasDimensionLimit;
                }
            }
            else if (canvas.width > canvasDimensionLimit) {
                canvas.height *= canvasDimensionLimit / canvas.width;
                canvas.width = canvasDimensionLimit;
            }
            else {
                canvas.width *= canvasDimensionLimit / canvas.height;
                canvas.height = canvasDimensionLimit;
            }
        }
    }
    function canvasToBlob(canvas, options) {
        if (options === void 0) { options = {}; }
        if (canvas.toBlob) {
            return new Promise(function (resolve) {
                canvas.toBlob(resolve, options.type ? options.type : 'image/png', options.quality ? options.quality : 1);
            });
        }
        return new Promise(function (resolve) {
            var binaryString = window.atob(canvas
                .toDataURL(options.type ? options.type : undefined, options.quality ? options.quality : undefined)
                .split(',')[1]);
            var len = binaryString.length;
            var binaryArray = new Uint8Array(len);
            for (var i = 0; i < len; i += 1) {
                binaryArray[i] = binaryString.charCodeAt(i);
            }
            resolve(new Blob([binaryArray], {
                type: options.type ? options.type : 'image/png',
            }));
        });
    }
    function createImage(url) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.decode = function () { return resolve(img); };
            img.onload = function () { return resolve(img); };
            img.onerror = reject;
            img.crossOrigin = 'anonymous';
            img.decoding = 'async';
            img.src = url;
        });
    }
    function svgToDataURL(svg) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve()
                        .then(function () { return new XMLSerializer().serializeToString(svg); })
                        .then(encodeURIComponent)
                        .then(function (html) { return "data:image/svg+xml;charset=utf-8,".concat(html); })];
            });
        });
    }
    function nodeToDataURL(node, width, height) {
        return __awaiter(this, void 0, void 0, function () {
            var xmlns, svg, foreignObject;
            return __generator(this, function (_a) {
                xmlns = 'http://www.w3.org/2000/svg';
                svg = document.createElementNS(xmlns, 'svg');
                foreignObject = document.createElementNS(xmlns, 'foreignObject');
                svg.setAttribute('width', "".concat(width));
                svg.setAttribute('height', "".concat(height));
                svg.setAttribute('viewBox', "0 0 ".concat(width, " ").concat(height));
                foreignObject.setAttribute('width', '100%');
                foreignObject.setAttribute('height', '100%');
                foreignObject.setAttribute('x', '0');
                foreignObject.setAttribute('y', '0');
                foreignObject.setAttribute('externalResourcesRequired', 'true');
                svg.appendChild(foreignObject);
                foreignObject.appendChild(node);
                return [2 /*return*/, svgToDataURL(svg)];
            });
        });
    }
    var isInstanceOfElement = function (node, instance) {
        if (node instanceof instance)
            return true;
        var nodePrototype = Object.getPrototypeOf(node);
        if (nodePrototype === null)
            return false;
        return (nodePrototype.constructor.name === instance.name ||
            isInstanceOfElement(nodePrototype, instance));
    };

    function formatCSSText(style) {
        var content = style.getPropertyValue('content');
        return "".concat(style.cssText, " content: '").concat(content.replace(/'|"/g, ''), "';");
    }
    function formatCSSProperties(style) {
        return toArray(style)
            .map(function (name) {
            var value = style.getPropertyValue(name);
            var priority = style.getPropertyPriority(name);
            return "".concat(name, ": ").concat(value).concat(priority ? ' !important' : '', ";");
        })
            .join(' ');
    }
    function getPseudoElementStyle(className, pseudo, style) {
        var selector = ".".concat(className, ":").concat(pseudo);
        var cssText = style.cssText
            ? formatCSSText(style)
            : formatCSSProperties(style);
        return document.createTextNode("".concat(selector, "{").concat(cssText, "}"));
    }
    function clonePseudoElement(nativeNode, clonedNode, pseudo) {
        var style = window.getComputedStyle(nativeNode, pseudo);
        var content = style.getPropertyValue('content');
        if (content === '' || content === 'none') {
            return;
        }
        var className = uuid();
        try {
            clonedNode.className = "".concat(clonedNode.className, " ").concat(className);
        }
        catch (err) {
            return;
        }
        var styleElement = document.createElement('style');
        styleElement.appendChild(getPseudoElementStyle(className, pseudo, style));
        clonedNode.appendChild(styleElement);
    }
    function clonePseudoElements(nativeNode, clonedNode) {
        clonePseudoElement(nativeNode, clonedNode, ':before');
        clonePseudoElement(nativeNode, clonedNode, ':after');
    }

    var WOFF = 'application/font-woff';
    var JPEG = 'image/jpeg';
    var mimes = {
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
        webp: 'image/webp',
    };
    function getExtension(url) {
        var match = /\.([^./]*?)$/g.exec(url);
        return match ? match[1] : '';
    }
    function getMimeType(url) {
        var extension = getExtension(url).toLowerCase();
        return mimes[extension] || '';
    }

    function getContentFromDataUrl(dataURL) {
        return dataURL.split(/,/)[1];
    }
    function isDataUrl(url) {
        return url.search(/^(data:)/) !== -1;
    }
    function makeDataUrl(content, mimeType) {
        return "data:".concat(mimeType, ";base64,").concat(content);
    }
    function fetchAsDataURL(url, init, process) {
        return __awaiter(this, void 0, void 0, function () {
            var res, blob;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch(url, init)];
                    case 1:
                        res = _a.sent();
                        if (res.status === 404) {
                            throw new Error("Resource \"".concat(res.url, "\" not found"));
                        }
                        return [4 /*yield*/, res.blob()];
                    case 2:
                        blob = _a.sent();
                        if (blob.size === 0) {
                            throw new Error("Blob \"".concat(url, "\" is empty"));
                        }
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var reader = new FileReader();
                                reader.onerror = reject;
                                reader.onloadend = function () {
                                    try {
                                        resolve(process({ res: res, result: reader.result }));
                                    }
                                    catch (error) {
                                        reject(error);
                                    }
                                };
                                reader.readAsDataURL(blob);
                            })];
                }
            });
        });
    }
    var cache = {};
    function getCacheKey(url, contentType, includeQueryParams) {
        var key = url.replace(/\?.*/, '');
        if (includeQueryParams) {
            key = url;
        }
        // font resource
        if (/ttf|otf|eot|woff2?/i.test(key)) {
            key = key.replace(/.*\//, '');
        }
        return contentType ? "[".concat(contentType, "]").concat(key) : key;
    }
    function resourceToDataURL(resourceUrl, contentType, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, dataURL, content, error_1, msg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = getCacheKey(resourceUrl, contentType, options.includeQueryParams);
                        if (cache[cacheKey] != null) {
                            return [2 /*return*/, cache[cacheKey]];
                        }
                        // ref: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
                        if (options.cacheBust) {
                            // eslint-disable-next-line no-param-reassign
                            resourceUrl += (/\?/.test(resourceUrl) ? '&' : '?') + new Date().getTime();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, fetchAsDataURL(resourceUrl, options.fetchRequestInit, function (_a) {
                                var res = _a.res, result = _a.result;
                                if (!contentType) {
                                    // eslint-disable-next-line no-param-reassign
                                    contentType = res.headers.get('Content-Type') || '';
                                }
                                return getContentFromDataUrl(result);
                            })];
                    case 2:
                        content = _a.sent();
                        dataURL = makeDataUrl(content, contentType);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        dataURL = options.imagePlaceholder || '';
                        if (options.consoleLog) {
                            msg = "Failed to fetch resource: ".concat(resourceUrl);
                            if (error_1) {
                                msg = typeof error_1 === 'string' ? error_1 : error_1.message;
                            }
                            if (msg) {
                                console.warn(msg);
                            }
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        cache[cacheKey] = dataURL;
                        return [2 /*return*/, dataURL];
                }
            });
        });
    }

    function cloneCanvasElement(canvas) {
        return __awaiter(this, void 0, void 0, function () {
            var dataURL;
            return __generator(this, function (_a) {
                dataURL = canvas.toDataURL();
                if (dataURL === 'data:,') {
                    return [2 /*return*/, canvas.cloneNode(false)];
                }
                return [2 /*return*/, createImage(dataURL)];
            });
        });
    }
    function cloneVideoElement(video, options) {
        return __awaiter(this, void 0, void 0, function () {
            var canvas, ctx, dataURL_1, poster, contentType, dataURL;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (video.currentSrc) {
                            canvas = document.createElement('canvas');
                            ctx = canvas.getContext('2d');
                            canvas.width = video.clientWidth;
                            canvas.height = video.clientHeight;
                            ctx === null || ctx === void 0 ? void 0 : ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            dataURL_1 = canvas.toDataURL();
                            return [2 /*return*/, createImage(dataURL_1)];
                        }
                        poster = video.poster;
                        contentType = getMimeType(poster);
                        return [4 /*yield*/, resourceToDataURL(poster, contentType, options)];
                    case 1:
                        dataURL = _a.sent();
                        return [2 /*return*/, createImage(dataURL)];
                }
            });
        });
    }
    function cloneIFrameElement(iframe) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        if (!((_a = iframe === null || iframe === void 0 ? void 0 : iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.body)) return [3 /*break*/, 2];
                        return [4 /*yield*/, cloneNode(iframe.contentDocument.body, {}, true)];
                    case 1: return [2 /*return*/, (_c.sent())];
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, iframe.cloneNode(false)];
                }
            });
        });
    }
    function cloneSingleNode(node, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (isInstanceOfElement(node, HTMLCanvasElement)) {
                    return [2 /*return*/, cloneCanvasElement(node)];
                }
                if (isInstanceOfElement(node, HTMLVideoElement)) {
                    return [2 /*return*/, cloneVideoElement(node, options)];
                }
                if (isInstanceOfElement(node, HTMLIFrameElement)) {
                    return [2 /*return*/, cloneIFrameElement(node)];
                }
                return [2 /*return*/, node.cloneNode(false)];
            });
        });
    }
    var isSlotElement = function (node) {
        return node.tagName != null && node.tagName.toUpperCase() === 'SLOT';
    };
    function cloneChildren(nativeNode, clonedNode, options) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var children;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        children = [];
                        if (isSlotElement(nativeNode) && nativeNode.assignedNodes) {
                            children = toArray(nativeNode.assignedNodes());
                        }
                        else if (isInstanceOfElement(nativeNode, HTMLIFrameElement) &&
                            ((_a = nativeNode.contentDocument) === null || _a === void 0 ? void 0 : _a.body)) {
                            children = toArray(nativeNode.contentDocument.body.childNodes);
                        }
                        else {
                            children = toArray(((_b = nativeNode.shadowRoot) !== null && _b !== void 0 ? _b : nativeNode).childNodes);
                        }
                        if (children.length === 0 ||
                            isInstanceOfElement(nativeNode, HTMLVideoElement)) {
                            return [2 /*return*/, clonedNode];
                        }
                        return [4 /*yield*/, children.reduce(function (deferred, child) {
                                return deferred
                                    .then(function () { return cloneNode(child, options); })
                                    .then(function (clonedChild) {
                                    if (clonedChild) {
                                        clonedNode.appendChild(clonedChild);
                                    }
                                });
                            }, Promise.resolve())];
                    case 1:
                        _c.sent();
                        return [2 /*return*/, clonedNode];
                }
            });
        });
    }
    function cloneCSSStyle(nativeNode, clonedNode) {
        var targetStyle = clonedNode.style;
        if (!targetStyle) {
            return;
        }
        var sourceStyle = window.getComputedStyle(nativeNode);
        if (sourceStyle.cssText) {
            targetStyle.cssText = sourceStyle.cssText;
            targetStyle.transformOrigin = sourceStyle.transformOrigin;
        }
        else {
            toArray(sourceStyle).forEach(function (name) {
                var value = sourceStyle.getPropertyValue(name);
                if (name === 'font-size' && value.endsWith('px')) {
                    var reducedFont = Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
                    value = "".concat(reducedFont, "px");
                }
                if (name === 'd' && clonedNode.getAttribute('d')) {
                    value = "path(".concat(clonedNode.getAttribute('d'), ")");
                }
                if (isInstanceOfElement(nativeNode, HTMLIFrameElement) &&
                    name === 'display' &&
                    value === 'inline') {
                    value = 'block';
                }
                targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
            });
        }
    }
    function cloneInputValue(nativeNode, clonedNode) {
        if (isInstanceOfElement(nativeNode, HTMLTextAreaElement)) {
            clonedNode.innerHTML = nativeNode.value;
        }
        if (isInstanceOfElement(nativeNode, HTMLInputElement)) {
            clonedNode.setAttribute('value', nativeNode.value);
        }
    }
    function cloneSelectValue(nativeNode, clonedNode) {
        if (isInstanceOfElement(nativeNode, HTMLSelectElement)) {
            var clonedSelect = clonedNode;
            var selectedOption = Array.from(clonedSelect.children).find(function (child) { return nativeNode.value === child.getAttribute('value'); });
            if (selectedOption) {
                selectedOption.setAttribute('selected', '');
            }
        }
    }
    function decorate(nativeNode, clonedNode) {
        if (isInstanceOfElement(clonedNode, Element)) {
            cloneCSSStyle(nativeNode, clonedNode);
            clonePseudoElements(nativeNode, clonedNode);
            cloneInputValue(nativeNode, clonedNode);
            cloneSelectValue(nativeNode, clonedNode);
        }
        return clonedNode;
    }
    function ensureSVGSymbols(clone, options) {
        return __awaiter(this, void 0, void 0, function () {
            var uses, processedDefs, i, use, id, exist, definition, _a, _b, nodes, ns, svg, defs, i;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        uses = clone.querySelectorAll ? clone.querySelectorAll('use') : [];
                        if (uses.length === 0) {
                            return [2 /*return*/, clone];
                        }
                        processedDefs = {};
                        i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(i < uses.length)) return [3 /*break*/, 4];
                        use = uses[i];
                        id = use.getAttribute('xlink:href');
                        if (!id) return [3 /*break*/, 3];
                        exist = clone.querySelector(id);
                        definition = document.querySelector(id);
                        if (!(!exist && definition && !processedDefs[id])) return [3 /*break*/, 3];
                        // eslint-disable-next-line no-await-in-loop
                        _a = processedDefs;
                        _b = id;
                        return [4 /*yield*/, cloneNode(definition, options, true)];
                    case 2:
                        // eslint-disable-next-line no-await-in-loop
                        _a[_b] = (_c.sent());
                        _c.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        nodes = Object.values(processedDefs);
                        if (nodes.length) {
                            ns = 'http://www.w3.org/1999/xhtml';
                            svg = document.createElementNS(ns, 'svg');
                            svg.setAttribute('xmlns', ns);
                            svg.style.position = 'absolute';
                            svg.style.width = '0';
                            svg.style.height = '0';
                            svg.style.overflow = 'hidden';
                            svg.style.display = 'none';
                            defs = document.createElementNS(ns, 'defs');
                            svg.appendChild(defs);
                            for (i = 0; i < nodes.length; i++) {
                                defs.appendChild(nodes[i]);
                            }
                            clone.appendChild(svg);
                        }
                        return [2 /*return*/, clone];
                }
            });
        });
    }
    function cloneNode(node, options, isRoot) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!isRoot && options.filter && !options.filter(node)) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, Promise.resolve(node)
                        .then(function (clonedNode) { return cloneSingleNode(clonedNode, options); })
                        .then(function (clonedNode) { return cloneChildren(node, clonedNode, options); })
                        .then(function (clonedNode) { return decorate(node, clonedNode); })
                        .then(function (clonedNode) { return ensureSVGSymbols(clonedNode, options); })];
            });
        });
    }

    var URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;
    var URL_WITH_FORMAT_REGEX = /url\([^)]+\)\s*format\((["']?)([^"']+)\1\)/g;
    var FONT_SRC_REGEX = /src:\s*(?:url\([^)]+\)\s*format\([^)]+\)[,;]\s*)+/g;
    function toRegex(url) {
        // eslint-disable-next-line no-useless-escape
        var escaped = url.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
        return new RegExp("(url\\(['\"]?)(".concat(escaped, ")(['\"]?\\))"), 'g');
    }
    function parseURLs(cssText) {
        var urls = [];
        cssText.replace(URL_REGEX, function (raw, quotation, url) {
            urls.push(url);
            return raw;
        });
        return urls.filter(function (url) { return !isDataUrl(url); });
    }
    function embed(cssText, resourceURL, baseURL, options, getContentFromUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvedURL, contentType, dataURL, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;
                        contentType = getMimeType(resourceURL);
                        dataURL = void 0;
                        if (!getContentFromUrl) return [3 /*break*/, 2];
                        return [4 /*yield*/, getContentFromUrl(resolvedURL)];
                    case 1:
                        content = _a.sent();
                        dataURL = makeDataUrl(content, contentType);
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, resourceToDataURL(resolvedURL, contentType, options)];
                    case 3:
                        dataURL = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, cssText.replace(toRegex(resourceURL), "$1".concat(dataURL, "$3"))];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/, cssText];
                }
            });
        });
    }
    function filterPreferredFontFormat(str, _a) {
        var preferredFontFormat = _a.preferredFontFormat;
        return !preferredFontFormat
            ? str
            : str.replace(FONT_SRC_REGEX, function (match) {
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    var _a = URL_WITH_FORMAT_REGEX.exec(match) || [], src = _a[0], format = _a[2];
                    if (!format) {
                        return '';
                    }
                    if (format === preferredFontFormat) {
                        return "src: ".concat(src, ";");
                    }
                }
            });
    }
    function shouldEmbed(url) {
        return url.search(URL_REGEX) !== -1;
    }
    function embedResources(cssText, baseUrl, options) {
        return __awaiter(this, void 0, void 0, function () {
            var filteredCSSText, urls;
            return __generator(this, function (_a) {
                if (!shouldEmbed(cssText)) {
                    return [2 /*return*/, cssText];
                }
                filteredCSSText = filterPreferredFontFormat(cssText, options);
                urls = parseURLs(filteredCSSText);
                return [2 /*return*/, urls.reduce(function (deferred, url) {
                        return deferred.then(function (css) { return embed(css, url, baseUrl, options); });
                    }, Promise.resolve(filteredCSSText))];
            });
        });
    }

    function embedBackground(clonedNode, options) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var background, cssString;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        background = (_a = clonedNode.style) === null || _a === void 0 ? void 0 : _a.getPropertyValue('background');
                        if (!background) return [3 /*break*/, 2];
                        return [4 /*yield*/, embedResources(background, null, options)];
                    case 1:
                        cssString = _b.sent();
                        clonedNode.style.setProperty('background', cssString, clonedNode.style.getPropertyPriority('background'));
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    }
    function embedImageNode(clonedNode, options) {
        return __awaiter(this, void 0, void 0, function () {
            var isImageElement, promise, url, dataURL;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        isImageElement = isInstanceOfElement(clonedNode, HTMLImageElement);
                        if (!(isImageElement && !isDataUrl(clonedNode.src)) &&
                            !(isInstanceOfElement(clonedNode, SVGImageElement) &&
                                !isDataUrl(clonedNode.href.baseVal))) {
                            return [2 /*return*/];
                        }
                        promise = new Promise(function (resolve) {
                            clonedNode.onload = resolve;
                            clonedNode.onerror = resolve;
                            var image = clonedNode;
                            if (image.decode) {
                                image.decode = resolve;
                            }
                            if (image.loading === 'lazy') {
                                image.loading = 'eager';
                            }
                        });
                        url = isImageElement ? clonedNode.src : clonedNode.href.baseVal;
                        return [4 /*yield*/, resourceToDataURL(url, getMimeType(url), options)];
                    case 1:
                        dataURL = _a.sent();
                        if (!dataURL || dataURL === '') {
                            return [2 /*return*/];
                        }
                        if (isImageElement) {
                            clonedNode.srcset = '';
                            clonedNode.src = dataURL;
                        }
                        else {
                            clonedNode.href.baseVal = dataURL;
                        }
                        return [4 /*yield*/, promise];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function embedChildren(clonedNode, options) {
        return __awaiter(this, void 0, void 0, function () {
            var children, deferreds;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        children = toArray(clonedNode.childNodes);
                        deferreds = children.map(function (child) { return embedImages(child, options); });
                        return [4 /*yield*/, Promise.all(deferreds).then(function () { return clonedNode; })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function embedImages(clonedNode, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isInstanceOfElement(clonedNode, Element)) return [3 /*break*/, 4];
                        return [4 /*yield*/, embedBackground(clonedNode, options)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, embedImageNode(clonedNode, options)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, embedChildren(clonedNode, options)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    }

    function applyStyle(node, options) {
        var style = node.style;
        if (options.backgroundColor) {
            style.backgroundColor = options.backgroundColor;
        }
        if (options.width) {
            style.width = "".concat(options.width, "px");
        }
        if (options.height) {
            style.height = "".concat(options.height, "px");
        }
        var manual = options.style;
        if (manual != null) {
            Object.keys(manual).forEach(function (key) {
                style[key] = manual[key];
            });
        }
        return node;
    }

    var cssFetchCache = {};
    function fetchCSS(url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cache, res, cssText;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cache = cssFetchCache[url];
                        if (cache != null) {
                            return [2 /*return*/, cache];
                        }
                        return [4 /*yield*/, fetch(url, options.fetchRequestInit)];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.text()];
                    case 2:
                        cssText = _a.sent();
                        if (!cssText || cssText.length === 0) {
                            throw new Error("Text \"".concat(url, "\" is empty"));
                        }
                        cache = { url: url, cssText: cssText };
                        cssFetchCache[url] = cache;
                        return [2 /*return*/, cache];
                }
            });
        });
    }
    function embedFonts(data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cssText, regexUrl, fontLocs, loadFonts;
            var _this = this;
            return __generator(this, function (_a) {
                cssText = data.cssText;
                regexUrl = /url\(["']?([^"')]+)["']?\)/g;
                fontLocs = cssText.match(/url\([^)]+\)/g) || [];
                loadFonts = fontLocs.map(function (loc) { return __awaiter(_this, void 0, void 0, function () {
                    var url;
                    return __generator(this, function (_a) {
                        url = loc.replace(regexUrl, '$1');
                        if (!url.startsWith('https://')) {
                            url = new URL(url, data.url).href;
                        }
                        return [2 /*return*/, fetchAsDataURL(url, options.fetchRequestInit, function (_a) {
                                var result = _a.result;
                                cssText = cssText.replace(loc, "url(".concat(result, ")"));
                                return [loc, result];
                            })];
                    });
                }); });
                return [2 /*return*/, Promise.all(loadFonts).then(function () { return cssText; })];
            });
        });
    }
    function parseCSS(source) {
        if (source == null) {
            return [];
        }
        var result = [];
        var commentsRegex = /(\/\*[\s\S]*?\*\/)/gi;
        // strip out comments
        var cssText = source.replace(commentsRegex, '');
        // eslint-disable-next-line prefer-regex-literals
        var keyframesRegex = new RegExp('((@.*?keyframes [\\s\\S]*?){([\\s\\S]*?}\\s*?)})', 'gi');
        // eslint-disable-next-line no-constant-condition
        while (true) {
            var matches = keyframesRegex.exec(cssText);
            if (matches === null) {
                break;
            }
            result.push(matches[0]);
        }
        cssText = cssText.replace(keyframesRegex, '');
        var importRegex = /@import[\s\S]*?url\([^)]*\)[\s\S]*?;/gi;
        // to match css & media queries together
        var combinedCSSRegex = '((\\s*?(?:\\/\\*[\\s\\S]*?\\*\\/)?\\s*?@media[\\s\\S]' +
            '*?){([\\s\\S]*?)}\\s*?})|(([\\s\\S]*?){([\\s\\S]*?)})';
        // unified regex
        var unifiedRegex = new RegExp(combinedCSSRegex, 'gi');
        // eslint-disable-next-line no-constant-condition
        while (true) {
            var matches = importRegex.exec(cssText);
            if (matches === null) {
                matches = unifiedRegex.exec(cssText);
                if (matches === null) {
                    break;
                }
                else {
                    importRegex.lastIndex = unifiedRegex.lastIndex;
                }
            }
            else {
                unifiedRegex.lastIndex = importRegex.lastIndex;
            }
            result.push(matches[0]);
        }
        return result;
    }
    function getCSSRules(styleSheets, options) {
        return __awaiter(this, void 0, void 0, function () {
            var ret, deferreds;
            return __generator(this, function (_a) {
                ret = [];
                deferreds = [];
                // First loop inlines imports
                styleSheets.forEach(function (sheet) {
                    if ('cssRules' in sheet) {
                        try {
                            toArray(sheet.cssRules || []).forEach(function (item, index) {
                                if (item.type === CSSRule.IMPORT_RULE) {
                                    var importIndex_1 = index + 1;
                                    var url = item.href;
                                    var deferred = fetchCSS(url, options)
                                        .then(function (metadata) { return embedFonts(metadata, options); })
                                        .then(function (cssText) {
                                        return parseCSS(cssText).forEach(function (rule) {
                                            try {
                                                sheet.insertRule(rule, rule.startsWith('@import')
                                                    ? (importIndex_1 += 1)
                                                    : sheet.cssRules.length);
                                            }
                                            catch (error) {
                                                if (options.consoleLog) {
                                                    console.error('Error inserting rule from remote css', {
                                                        rule: rule,
                                                        error: error,
                                                    });
                                                }
                                            }
                                        });
                                    })
                                        .catch(function (e) {
                                        if (options.consoleLog) {
                                            console.error('Error loading remote css', e.toString());
                                        }
                                    });
                                    deferreds.push(deferred);
                                }
                            });
                        }
                        catch (e) {
                            var inline_1 = styleSheets.find(function (a) { return a.href == null; }) || document.styleSheets[0];
                            if (sheet.href != null) {
                                deferreds.push(fetchCSS(sheet.href, options)
                                    .then(function (metadata) { return embedFonts(metadata, options); })
                                    .then(function (cssText) {
                                    return parseCSS(cssText).forEach(function (rule) {
                                        inline_1.insertRule(rule, sheet.cssRules.length);
                                    });
                                })
                                    .catch(function (err) {
                                    if (options.consoleLog) {
                                        console.error('Error loading remote stylesheet', err.toString());
                                    }
                                }));
                            }
                            if (options.consoleLog) {
                                console.error('Error inlining remote css file', e.toString());
                            }
                        }
                    }
                });
                return [2 /*return*/, Promise.all(deferreds).then(function () {
                        // Second loop parses rules
                        styleSheets.forEach(function (sheet) {
                            if ('cssRules' in sheet) {
                                try {
                                    toArray(sheet.cssRules || []).forEach(function (item) {
                                        ret.push(item);
                                    });
                                }
                                catch (e) {
                                    if (options.consoleLog) {
                                        console.error("Error while reading CSS rules from ".concat(sheet.href), e.toString());
                                    }
                                }
                            }
                        });
                        return ret;
                    })];
            });
        });
    }
    function getWebFontRules(cssRules) {
        return cssRules
            .filter(function (rule) { return rule.type === CSSRule.FONT_FACE_RULE; })
            .filter(function (rule) { return shouldEmbed(rule.style.getPropertyValue('src')); });
    }
    function parseWebFontRules(node, options) {
        return __awaiter(this, void 0, void 0, function () {
            var styleSheets, cssRules;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (node.ownerDocument == null) {
                            throw new Error('Provided element is not within a Document');
                        }
                        styleSheets = toArray(node.ownerDocument.styleSheets);
                        return [4 /*yield*/, getCSSRules(styleSheets, options)];
                    case 1:
                        cssRules = _a.sent();
                        return [2 /*return*/, getWebFontRules(cssRules)];
                }
            });
        });
    }
    function getWebFontCSS(node, options) {
        return __awaiter(this, void 0, void 0, function () {
            var rules, cssTexts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parseWebFontRules(node, options)];
                    case 1:
                        rules = _a.sent();
                        return [4 /*yield*/, Promise.all(rules.map(function (rule) {
                                var baseUrl = rule.parentStyleSheet ? rule.parentStyleSheet.href : null;
                                return embedResources(rule.cssText, baseUrl, options);
                            }))];
                    case 2:
                        cssTexts = _a.sent();
                        return [2 /*return*/, cssTexts.join('\n')];
                }
            });
        });
    }
    function embedWebFonts(clonedNode, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cssText, _a, _b, styleNode, sytleContent;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!(options.fontEmbedCSS != null)) return [3 /*break*/, 1];
                        _a = options.fontEmbedCSS;
                        return [3 /*break*/, 5];
                    case 1:
                        if (!options.skipFonts) return [3 /*break*/, 2];
                        _b = null;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, getWebFontCSS(clonedNode, options)];
                    case 3:
                        _b = _c.sent();
                        _c.label = 4;
                    case 4:
                        _a = _b;
                        _c.label = 5;
                    case 5:
                        cssText = _a;
                        if (cssText) {
                            styleNode = document.createElement('style');
                            sytleContent = document.createTextNode(cssText);
                            styleNode.appendChild(sytleContent);
                            if (clonedNode.firstChild) {
                                clonedNode.insertBefore(styleNode, clonedNode.firstChild);
                            }
                            else {
                                clonedNode.appendChild(styleNode);
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    }

    function toSvg(node, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, width, height, clonedNode, datauri;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = getImageSize(node, options), width = _a.width, height = _a.height;
                        return [4 /*yield*/, cloneNode(node, options, true)];
                    case 1:
                        clonedNode = (_b.sent());
                        return [4 /*yield*/, embedWebFonts(clonedNode, options)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, embedImages(clonedNode, options)];
                    case 3:
                        _b.sent();
                        applyStyle(clonedNode, options);
                        return [4 /*yield*/, nodeToDataURL(clonedNode, width, height)];
                    case 4:
                        datauri = _b.sent();
                        return [2 /*return*/, datauri];
                }
            });
        });
    }
    function toCanvas(node, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, width, height, svg, img, canvas, context, ratio, canvasWidth, canvasHeight;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = getImageSize(node, options), width = _a.width, height = _a.height;
                        return [4 /*yield*/, toSvg(node, options)];
                    case 1:
                        svg = _b.sent();
                        return [4 /*yield*/, createImage(svg)];
                    case 2:
                        img = _b.sent();
                        canvas = document.createElement('canvas');
                        context = canvas.getContext('2d');
                        ratio = options.pixelRatio || getPixelRatio();
                        canvasWidth = options.canvasWidth || width;
                        canvasHeight = options.canvasHeight || height;
                        canvas.width = canvasWidth * ratio;
                        canvas.height = canvasHeight * ratio;
                        if (!options.skipAutoScale) {
                            checkCanvasDimensions(canvas);
                        }
                        canvas.style.width = "".concat(canvasWidth);
                        canvas.style.height = "".concat(canvasHeight);
                        if (options.backgroundColor) {
                            context.fillStyle = options.backgroundColor;
                            context.fillRect(0, 0, canvas.width, canvas.height);
                        }
                        context.drawImage(img, 0, 0, canvas.width, canvas.height);
                        return [2 /*return*/, canvas];
                }
            });
        });
    }
    function toPixelData(node, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, width, height, canvas, ctx;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = getImageSize(node, options), width = _a.width, height = _a.height;
                        return [4 /*yield*/, toCanvas(node, options)];
                    case 1:
                        canvas = _b.sent();
                        ctx = canvas.getContext('2d');
                        return [2 /*return*/, ctx.getImageData(0, 0, width, height).data];
                }
            });
        });
    }
    function toPng(node, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var canvas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, toCanvas(node, options)];
                    case 1:
                        canvas = _a.sent();
                        return [2 /*return*/, canvas.toDataURL()];
                }
            });
        });
    }
    function toJpeg(node, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var canvas;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, toCanvas(node, options)];
                    case 1:
                        canvas = _a.sent();
                        return [2 /*return*/, canvas.toDataURL('image/jpeg', options.quality || 1)];
                }
            });
        });
    }
    function toBlob(node, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var canvas, blob;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, toCanvas(node, options)];
                    case 1:
                        canvas = _a.sent();
                        return [4 /*yield*/, canvasToBlob(canvas)];
                    case 2:
                        blob = _a.sent();
                        return [2 /*return*/, blob];
                }
            });
        });
    }
    function getFontEmbedCSS(node, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, getWebFontCSS(node, options)];
            });
        });
    }

    exports.getFontEmbedCSS = getFontEmbedCSS;
    exports.toBlob = toBlob;
    exports.toCanvas = toCanvas;
    exports.toJpeg = toJpeg;
    exports.toPixelData = toPixelData;
    exports.toPng = toPng;
    exports.toSvg = toSvg;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbC10by1pbWFnZS5qcyIsInNvdXJjZXMiOlsiLi4vbm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsIi4uL3NyYy91dGlsLnRzIiwiLi4vc3JjL2Nsb25lLXBzZXVkb3MudHMiLCIuLi9zcmMvbWltZXMudHMiLCIuLi9zcmMvZGF0YXVybC50cyIsIi4uL3NyYy9jbG9uZS1ub2RlLnRzIiwiLi4vc3JjL2VtYmVkLXJlc291cmNlcy50cyIsIi4uL3NyYy9lbWJlZC1pbWFnZXMudHMiLCIuLi9zcmMvYXBwbHktc3R5bGUudHMiLCIuLi9zcmMvZW1iZWQtd2ViZm9udHMudHMiLCIuLi9zcmMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xyXG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XHJcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcclxuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xyXG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcclxuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XHJcbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCB2YXIgX19jcmVhdGVCaW5kaW5nID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xyXG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcclxuICAgIHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihtLCBrKTtcclxuICAgIGlmICghZGVzYyB8fCAoXCJnZXRcIiBpbiBkZXNjID8gIW0uX19lc01vZHVsZSA6IGRlc2Mud3JpdGFibGUgfHwgZGVzYy5jb25maWd1cmFibGUpKSB7XHJcbiAgICAgICAgZGVzYyA9IHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfTtcclxuICAgIH1cclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkSW4oc3RhdGUsIHJlY2VpdmVyKSB7XHJcbiAgICBpZiAocmVjZWl2ZXIgPT09IG51bGwgfHwgKHR5cGVvZiByZWNlaXZlciAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVjZWl2ZXIgIT09IFwiZnVuY3Rpb25cIikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdXNlICdpbicgb3BlcmF0b3Igb24gbm9uLW9iamVjdFwiKTtcclxuICAgIHJldHVybiB0eXBlb2Ygc3RhdGUgPT09IFwiZnVuY3Rpb25cIiA/IHJlY2VpdmVyID09PSBzdGF0ZSA6IHN0YXRlLmhhcyhyZWNlaXZlcik7XHJcbn1cclxuIiwiaW1wb3J0IHR5cGUgeyBPcHRpb25zIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVVcmwodXJsOiBzdHJpbmcsIGJhc2VVcmw6IHN0cmluZyB8IG51bGwpOiBzdHJpbmcge1xuICAvLyB1cmwgaXMgYWJzb2x1dGUgYWxyZWFkeVxuICBpZiAodXJsLm1hdGNoKC9eW2Etel0rOlxcL1xcLy9pKSkge1xuICAgIHJldHVybiB1cmxcbiAgfVxuXG4gIC8vIHVybCBpcyBhYnNvbHV0ZSBhbHJlYWR5LCB3aXRob3V0IHByb3RvY29sXG4gIGlmICh1cmwubWF0Y2goL15cXC9cXC8vKSkge1xuICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24ucHJvdG9jb2wgKyB1cmxcbiAgfVxuXG4gIC8vIGRhdGFVUkksIG1haWx0bzosIHRlbDosIGV0Yy5cbiAgaWYgKHVybC5tYXRjaCgvXlthLXpdKzovaSkpIHtcbiAgICByZXR1cm4gdXJsXG4gIH1cblxuICBjb25zdCBkb2MgPSBkb2N1bWVudC5pbXBsZW1lbnRhdGlvbi5jcmVhdGVIVE1MRG9jdW1lbnQoKVxuICBjb25zdCBiYXNlID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2Jhc2UnKVxuICBjb25zdCBhID0gZG9jLmNyZWF0ZUVsZW1lbnQoJ2EnKVxuXG4gIGRvYy5oZWFkLmFwcGVuZENoaWxkKGJhc2UpXG4gIGRvYy5ib2R5LmFwcGVuZENoaWxkKGEpXG5cbiAgaWYgKGJhc2VVcmwpIHtcbiAgICBiYXNlLmhyZWYgPSBiYXNlVXJsXG4gIH1cblxuICBhLmhyZWYgPSB1cmxcblxuICByZXR1cm4gYS5ocmVmXG59XG5cbmV4cG9ydCBjb25zdCB1dWlkID0gKCgpID0+IHtcbiAgLy8gZ2VuZXJhdGUgdXVpZCBmb3IgY2xhc3NOYW1lIG9mIHBzZXVkbyBlbGVtZW50cy5cbiAgLy8gV2Ugc2hvdWxkIG5vdCB1c2UgR1VJRHMsIG90aGVyd2lzZSBwc2V1ZG8gZWxlbWVudHMgc29tZXRpbWVzIGNhbm5vdCBiZSBjYXB0dXJlZC5cbiAgbGV0IGNvdW50ZXIgPSAwXG5cbiAgLy8gcmVmOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS82MjQ4NzIyLzI1MTkzNzNcbiAgY29uc3QgcmFuZG9tID0gKCkgPT5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tYml0d2lzZVxuICAgIGAwMDAwJHsoKE1hdGgucmFuZG9tKCkgKiAzNiAqKiA0KSA8PCAwKS50b1N0cmluZygzNil9YC5zbGljZSgtNClcblxuICByZXR1cm4gKCkgPT4ge1xuICAgIGNvdW50ZXIgKz0gMVxuICAgIHJldHVybiBgdSR7cmFuZG9tKCl9JHtjb3VudGVyfWBcbiAgfVxufSkoKVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsYXk8VD4obXM6IG51bWJlcikge1xuICByZXR1cm4gKGFyZ3M6IFQpID0+XG4gICAgbmV3IFByb21pc2U8VD4oKHJlc29sdmUpID0+IHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gcmVzb2x2ZShhcmdzKSwgbXMpXG4gICAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvQXJyYXk8VD4oYXJyYXlMaWtlOiBhbnkpOiBUW10ge1xuICBjb25zdCBhcnI6IFRbXSA9IFtdXG5cbiAgZm9yIChsZXQgaSA9IDAsIGwgPSBhcnJheUxpa2UubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgYXJyLnB1c2goYXJyYXlMaWtlW2ldKVxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiBweChub2RlOiBIVE1MRWxlbWVudCwgc3R5bGVQcm9wZXJ0eTogc3RyaW5nKSB7XG4gIGNvbnN0IHdpbiA9IG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldyB8fCB3aW5kb3dcbiAgY29uc3QgdmFsID0gd2luLmdldENvbXB1dGVkU3R5bGUobm9kZSkuZ2V0UHJvcGVydHlWYWx1ZShzdHlsZVByb3BlcnR5KVxuICByZXR1cm4gdmFsID8gcGFyc2VGbG9hdCh2YWwucmVwbGFjZSgncHgnLCAnJykpIDogMFxufVxuXG5mdW5jdGlvbiBnZXROb2RlV2lkdGgobm9kZTogSFRNTEVsZW1lbnQpIHtcbiAgY29uc3QgbGVmdEJvcmRlciA9IHB4KG5vZGUsICdib3JkZXItbGVmdC13aWR0aCcpXG4gIGNvbnN0IHJpZ2h0Qm9yZGVyID0gcHgobm9kZSwgJ2JvcmRlci1yaWdodC13aWR0aCcpXG4gIHJldHVybiBub2RlLmNsaWVudFdpZHRoICsgbGVmdEJvcmRlciArIHJpZ2h0Qm9yZGVyXG59XG5cbmZ1bmN0aW9uIGdldE5vZGVIZWlnaHQobm9kZTogSFRNTEVsZW1lbnQpIHtcbiAgY29uc3QgdG9wQm9yZGVyID0gcHgobm9kZSwgJ2JvcmRlci10b3Atd2lkdGgnKVxuICBjb25zdCBib3R0b21Cb3JkZXIgPSBweChub2RlLCAnYm9yZGVyLWJvdHRvbS13aWR0aCcpXG4gIHJldHVybiBub2RlLmNsaWVudEhlaWdodCArIHRvcEJvcmRlciArIGJvdHRvbUJvcmRlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SW1hZ2VTaXplKHRhcmdldE5vZGU6IEhUTUxFbGVtZW50LCBvcHRpb25zOiBPcHRpb25zID0ge30pIHtcbiAgY29uc3Qgd2lkdGggPSBvcHRpb25zLndpZHRoIHx8IGdldE5vZGVXaWR0aCh0YXJnZXROb2RlKVxuICBjb25zdCBoZWlnaHQgPSBvcHRpb25zLmhlaWdodCB8fCBnZXROb2RlSGVpZ2h0KHRhcmdldE5vZGUpXG5cbiAgcmV0dXJuIHsgd2lkdGgsIGhlaWdodCB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQaXhlbFJhdGlvKCkge1xuICBsZXQgcmF0aW9cblxuICBsZXQgRklOQUxfUFJPQ0VTU1xuICB0cnkge1xuICAgIEZJTkFMX1BST0NFU1MgPSBwcm9jZXNzXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICAvLyBwYXNzXG4gIH1cblxuICBjb25zdCB2YWwgPVxuICAgIEZJTkFMX1BST0NFU1MgJiYgRklOQUxfUFJPQ0VTUy5lbnZcbiAgICAgID8gRklOQUxfUFJPQ0VTUy5lbnYuZGV2aWNlUGl4ZWxSYXRpb1xuICAgICAgOiBudWxsXG4gIGlmICh2YWwpIHtcbiAgICByYXRpbyA9IHBhcnNlSW50KHZhbCwgMTApXG4gICAgaWYgKE51bWJlci5pc05hTihyYXRpbykpIHtcbiAgICAgIHJhdGlvID0gMVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmF0aW8gfHwgd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMVxufVxuXG4vLyBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0hUTUwvRWxlbWVudC9jYW52YXMjbWF4aW11bV9jYW52YXNfc2l6ZVxuY29uc3QgY2FudmFzRGltZW5zaW9uTGltaXQgPSAxNjM4NFxuXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tDYW52YXNEaW1lbnNpb25zKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgaWYgKFxuICAgIGNhbnZhcy53aWR0aCA+IGNhbnZhc0RpbWVuc2lvbkxpbWl0IHx8XG4gICAgY2FudmFzLmhlaWdodCA+IGNhbnZhc0RpbWVuc2lvbkxpbWl0XG4gICkge1xuICAgIGlmIChcbiAgICAgIGNhbnZhcy53aWR0aCA+IGNhbnZhc0RpbWVuc2lvbkxpbWl0ICYmXG4gICAgICBjYW52YXMuaGVpZ2h0ID4gY2FudmFzRGltZW5zaW9uTGltaXRcbiAgICApIHtcbiAgICAgIGlmIChjYW52YXMud2lkdGggPiBjYW52YXMuaGVpZ2h0KSB7XG4gICAgICAgIGNhbnZhcy5oZWlnaHQgKj0gY2FudmFzRGltZW5zaW9uTGltaXQgLyBjYW52YXMud2lkdGhcbiAgICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzRGltZW5zaW9uTGltaXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbnZhcy53aWR0aCAqPSBjYW52YXNEaW1lbnNpb25MaW1pdCAvIGNhbnZhcy5oZWlnaHRcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0RpbWVuc2lvbkxpbWl0XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjYW52YXMud2lkdGggPiBjYW52YXNEaW1lbnNpb25MaW1pdCkge1xuICAgICAgY2FudmFzLmhlaWdodCAqPSBjYW52YXNEaW1lbnNpb25MaW1pdCAvIGNhbnZhcy53aWR0aFxuICAgICAgY2FudmFzLndpZHRoID0gY2FudmFzRGltZW5zaW9uTGltaXRcbiAgICB9IGVsc2Uge1xuICAgICAgY2FudmFzLndpZHRoICo9IGNhbnZhc0RpbWVuc2lvbkxpbWl0IC8gY2FudmFzLmhlaWdodFxuICAgICAgY2FudmFzLmhlaWdodCA9IGNhbnZhc0RpbWVuc2lvbkxpbWl0XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjYW52YXNUb0Jsb2IoXG4gIGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQsXG4gIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSxcbik6IFByb21pc2U8QmxvYiB8IG51bGw+IHtcbiAgaWYgKGNhbnZhcy50b0Jsb2IpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGNhbnZhcy50b0Jsb2IoXG4gICAgICAgIHJlc29sdmUsXG4gICAgICAgIG9wdGlvbnMudHlwZSA/IG9wdGlvbnMudHlwZSA6ICdpbWFnZS9wbmcnLFxuICAgICAgICBvcHRpb25zLnF1YWxpdHkgPyBvcHRpb25zLnF1YWxpdHkgOiAxLFxuICAgICAgKVxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICBjb25zdCBiaW5hcnlTdHJpbmcgPSB3aW5kb3cuYXRvYihcbiAgICAgIGNhbnZhc1xuICAgICAgICAudG9EYXRhVVJMKFxuICAgICAgICAgIG9wdGlvbnMudHlwZSA/IG9wdGlvbnMudHlwZSA6IHVuZGVmaW5lZCxcbiAgICAgICAgICBvcHRpb25zLnF1YWxpdHkgPyBvcHRpb25zLnF1YWxpdHkgOiB1bmRlZmluZWQsXG4gICAgICAgIClcbiAgICAgICAgLnNwbGl0KCcsJylbMV0sXG4gICAgKVxuICAgIGNvbnN0IGxlbiA9IGJpbmFyeVN0cmluZy5sZW5ndGhcbiAgICBjb25zdCBiaW5hcnlBcnJheSA9IG5ldyBVaW50OEFycmF5KGxlbilcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgIGJpbmFyeUFycmF5W2ldID0gYmluYXJ5U3RyaW5nLmNoYXJDb2RlQXQoaSlcbiAgICB9XG5cbiAgICByZXNvbHZlKFxuICAgICAgbmV3IEJsb2IoW2JpbmFyeUFycmF5XSwge1xuICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGUgPyBvcHRpb25zLnR5cGUgOiAnaW1hZ2UvcG5nJyxcbiAgICAgIH0pLFxuICAgIClcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUltYWdlKHVybDogc3RyaW5nKTogUHJvbWlzZTxIVE1MSW1hZ2VFbGVtZW50PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3QgaW1nID0gbmV3IEltYWdlKClcbiAgICBpbWcuZGVjb2RlID0gKCkgPT4gcmVzb2x2ZShpbWcpIGFzIGFueVxuICAgIGltZy5vbmxvYWQgPSAoKSA9PiByZXNvbHZlKGltZylcbiAgICBpbWcub25lcnJvciA9IHJlamVjdFxuICAgIGltZy5jcm9zc09yaWdpbiA9ICdhbm9ueW1vdXMnXG4gICAgaW1nLmRlY29kaW5nID0gJ2FzeW5jJ1xuICAgIGltZy5zcmMgPSB1cmxcbiAgfSlcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN2Z1RvRGF0YVVSTChzdmc6IFNWR0VsZW1lbnQpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKClcbiAgICAudGhlbigoKSA9PiBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKHN2ZykpXG4gICAgLnRoZW4oZW5jb2RlVVJJQ29tcG9uZW50KVxuICAgIC50aGVuKChodG1sKSA9PiBgZGF0YTppbWFnZS9zdmcreG1sO2NoYXJzZXQ9dXRmLTgsJHtodG1sfWApXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBub2RlVG9EYXRhVVJMKFxuICBub2RlOiBIVE1MRWxlbWVudCxcbiAgd2lkdGg6IG51bWJlcixcbiAgaGVpZ2h0OiBudW1iZXIsXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCB4bWxucyA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZydcbiAgY29uc3Qgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHhtbG5zLCAnc3ZnJylcbiAgY29uc3QgZm9yZWlnbk9iamVjdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh4bWxucywgJ2ZvcmVpZ25PYmplY3QnKVxuXG4gIHN2Zy5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgYCR7d2lkdGh9YClcbiAgc3ZnLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgYCR7aGVpZ2h0fWApXG4gIHN2Zy5zZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnLCBgMCAwICR7d2lkdGh9ICR7aGVpZ2h0fWApXG5cbiAgZm9yZWlnbk9iamVjdC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgJzEwMCUnKVxuICBmb3JlaWduT2JqZWN0LnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgJzEwMCUnKVxuICBmb3JlaWduT2JqZWN0LnNldEF0dHJpYnV0ZSgneCcsICcwJylcbiAgZm9yZWlnbk9iamVjdC5zZXRBdHRyaWJ1dGUoJ3knLCAnMCcpXG4gIGZvcmVpZ25PYmplY3Quc2V0QXR0cmlidXRlKCdleHRlcm5hbFJlc291cmNlc1JlcXVpcmVkJywgJ3RydWUnKVxuXG4gIHN2Zy5hcHBlbmRDaGlsZChmb3JlaWduT2JqZWN0KVxuICBmb3JlaWduT2JqZWN0LmFwcGVuZENoaWxkKG5vZGUpXG5cbiAgcmV0dXJuIHN2Z1RvRGF0YVVSTChzdmcpXG59XG5cbmV4cG9ydCBjb25zdCBpc0luc3RhbmNlT2ZFbGVtZW50ID0gPFxuICBUIGV4dGVuZHMgdHlwZW9mIEVsZW1lbnQgfCB0eXBlb2YgSFRNTEVsZW1lbnQgfCB0eXBlb2YgU1ZHSW1hZ2VFbGVtZW50LFxuPihcbiAgbm9kZTogRWxlbWVudCB8IEhUTUxFbGVtZW50IHwgU1ZHSW1hZ2VFbGVtZW50LFxuICBpbnN0YW5jZTogVCxcbik6IG5vZGUgaXMgVFsncHJvdG90eXBlJ10gPT4ge1xuICBpZiAobm9kZSBpbnN0YW5jZW9mIGluc3RhbmNlKSByZXR1cm4gdHJ1ZVxuXG4gIGNvbnN0IG5vZGVQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yobm9kZSlcblxuICBpZiAobm9kZVByb3RvdHlwZSA9PT0gbnVsbCkgcmV0dXJuIGZhbHNlXG5cbiAgcmV0dXJuIChcbiAgICBub2RlUHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWUgPT09IGluc3RhbmNlLm5hbWUgfHxcbiAgICBpc0luc3RhbmNlT2ZFbGVtZW50KG5vZGVQcm90b3R5cGUsIGluc3RhbmNlKVxuICApXG59XG4iLCJpbXBvcnQgeyB1dWlkLCB0b0FycmF5IH0gZnJvbSAnLi91dGlsJ1xuXG50eXBlIFBzZXVkbyA9ICc6YmVmb3JlJyB8ICc6YWZ0ZXInXG5cbmZ1bmN0aW9uIGZvcm1hdENTU1RleHQoc3R5bGU6IENTU1N0eWxlRGVjbGFyYXRpb24pIHtcbiAgY29uc3QgY29udGVudCA9IHN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2NvbnRlbnQnKVxuICByZXR1cm4gYCR7c3R5bGUuY3NzVGV4dH0gY29udGVudDogJyR7Y29udGVudC5yZXBsYWNlKC8nfFwiL2csICcnKX0nO2Bcbn1cblxuZnVuY3Rpb24gZm9ybWF0Q1NTUHJvcGVydGllcyhzdHlsZTogQ1NTU3R5bGVEZWNsYXJhdGlvbikge1xuICByZXR1cm4gdG9BcnJheTxzdHJpbmc+KHN0eWxlKVxuICAgIC5tYXAoKG5hbWUpID0+IHtcbiAgICAgIGNvbnN0IHZhbHVlID0gc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKVxuICAgICAgY29uc3QgcHJpb3JpdHkgPSBzdHlsZS5nZXRQcm9wZXJ0eVByaW9yaXR5KG5hbWUpXG5cbiAgICAgIHJldHVybiBgJHtuYW1lfTogJHt2YWx1ZX0ke3ByaW9yaXR5ID8gJyAhaW1wb3J0YW50JyA6ICcnfTtgXG4gICAgfSlcbiAgICAuam9pbignICcpXG59XG5cbmZ1bmN0aW9uIGdldFBzZXVkb0VsZW1lbnRTdHlsZShcbiAgY2xhc3NOYW1lOiBzdHJpbmcsXG4gIHBzZXVkbzogUHNldWRvLFxuICBzdHlsZTogQ1NTU3R5bGVEZWNsYXJhdGlvbixcbik6IFRleHQge1xuICBjb25zdCBzZWxlY3RvciA9IGAuJHtjbGFzc05hbWV9OiR7cHNldWRvfWBcbiAgY29uc3QgY3NzVGV4dCA9IHN0eWxlLmNzc1RleHRcbiAgICA/IGZvcm1hdENTU1RleHQoc3R5bGUpXG4gICAgOiBmb3JtYXRDU1NQcm9wZXJ0aWVzKHN0eWxlKVxuXG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShgJHtzZWxlY3Rvcn17JHtjc3NUZXh0fX1gKVxufVxuXG5mdW5jdGlvbiBjbG9uZVBzZXVkb0VsZW1lbnQ8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgbmF0aXZlTm9kZTogVCxcbiAgY2xvbmVkTm9kZTogVCxcbiAgcHNldWRvOiBQc2V1ZG8sXG4pIHtcbiAgY29uc3Qgc3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShuYXRpdmVOb2RlLCBwc2V1ZG8pXG4gIGNvbnN0IGNvbnRlbnQgPSBzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdjb250ZW50JylcbiAgaWYgKGNvbnRlbnQgPT09ICcnIHx8IGNvbnRlbnQgPT09ICdub25lJykge1xuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgY2xhc3NOYW1lID0gdXVpZCgpXG4gIHRyeSB7XG4gICAgY2xvbmVkTm9kZS5jbGFzc05hbWUgPSBgJHtjbG9uZWROb2RlLmNsYXNzTmFtZX0gJHtjbGFzc05hbWV9YFxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IHN0eWxlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3N0eWxlJylcbiAgc3R5bGVFbGVtZW50LmFwcGVuZENoaWxkKGdldFBzZXVkb0VsZW1lbnRTdHlsZShjbGFzc05hbWUsIHBzZXVkbywgc3R5bGUpKVxuICBjbG9uZWROb2RlLmFwcGVuZENoaWxkKHN0eWxlRWxlbWVudClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lUHNldWRvRWxlbWVudHM8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgbmF0aXZlTm9kZTogVCxcbiAgY2xvbmVkTm9kZTogVCxcbikge1xuICBjbG9uZVBzZXVkb0VsZW1lbnQobmF0aXZlTm9kZSwgY2xvbmVkTm9kZSwgJzpiZWZvcmUnKVxuICBjbG9uZVBzZXVkb0VsZW1lbnQobmF0aXZlTm9kZSwgY2xvbmVkTm9kZSwgJzphZnRlcicpXG59XG4iLCJjb25zdCBXT0ZGID0gJ2FwcGxpY2F0aW9uL2ZvbnQtd29mZidcbmNvbnN0IEpQRUcgPSAnaW1hZ2UvanBlZydcbmNvbnN0IG1pbWVzOiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB9ID0ge1xuICB3b2ZmOiBXT0ZGLFxuICB3b2ZmMjogV09GRixcbiAgdHRmOiAnYXBwbGljYXRpb24vZm9udC10cnVldHlwZScsXG4gIGVvdDogJ2FwcGxpY2F0aW9uL3ZuZC5tcy1mb250b2JqZWN0JyxcbiAgcG5nOiAnaW1hZ2UvcG5nJyxcbiAganBnOiBKUEVHLFxuICBqcGVnOiBKUEVHLFxuICBnaWY6ICdpbWFnZS9naWYnLFxuICB0aWZmOiAnaW1hZ2UvdGlmZicsXG4gIHN2ZzogJ2ltYWdlL3N2Zyt4bWwnLFxuICB3ZWJwOiAnaW1hZ2Uvd2VicCcsXG59XG5cbmZ1bmN0aW9uIGdldEV4dGVuc2lvbih1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IG1hdGNoID0gL1xcLihbXi4vXSo/KSQvZy5leGVjKHVybClcbiAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiAnJ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TWltZVR5cGUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICBjb25zdCBleHRlbnNpb24gPSBnZXRFeHRlbnNpb24odXJsKS50b0xvd2VyQ2FzZSgpXG4gIHJldHVybiBtaW1lc1tleHRlbnNpb25dIHx8ICcnXG59XG4iLCJpbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi90eXBlcydcblxuZnVuY3Rpb24gZ2V0Q29udGVudEZyb21EYXRhVXJsKGRhdGFVUkw6IHN0cmluZykge1xuICByZXR1cm4gZGF0YVVSTC5zcGxpdCgvLC8pWzFdXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGFVcmwodXJsOiBzdHJpbmcpIHtcbiAgcmV0dXJuIHVybC5zZWFyY2goL14oZGF0YTopLykgIT09IC0xXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYWtlRGF0YVVybChjb250ZW50OiBzdHJpbmcsIG1pbWVUeXBlOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGBkYXRhOiR7bWltZVR5cGV9O2Jhc2U2NCwke2NvbnRlbnR9YFxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmV0Y2hBc0RhdGFVUkw8VD4oXG4gIHVybDogc3RyaW5nLFxuICBpbml0OiBSZXF1ZXN0SW5pdCB8IHVuZGVmaW5lZCxcbiAgcHJvY2VzczogKGRhdGE6IHsgcmVzdWx0OiBzdHJpbmc7IHJlczogUmVzcG9uc2UgfSkgPT4gVCxcbik6IFByb21pc2U8VD4ge1xuICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaCh1cmwsIGluaXQpXG4gIGlmIChyZXMuc3RhdHVzID09PSA0MDQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFJlc291cmNlIFwiJHtyZXMudXJsfVwiIG5vdCBmb3VuZGApXG4gIH1cbiAgY29uc3QgYmxvYiA9IGF3YWl0IHJlcy5ibG9iKClcbiAgaWYgKGJsb2Iuc2l6ZSA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQmxvYiBcIiR7dXJsfVwiIGlzIGVtcHR5YClcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2U8VD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIub25lcnJvciA9IHJlamVjdFxuICAgIHJlYWRlci5vbmxvYWRlbmQgPSAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICByZXNvbHZlKHByb2Nlc3MoeyByZXMsIHJlc3VsdDogcmVhZGVyLnJlc3VsdCBhcyBzdHJpbmcgfSkpXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVhZGVyLnJlYWRBc0RhdGFVUkwoYmxvYilcbiAgfSlcbn1cblxuY29uc3QgY2FjaGU6IHsgW3VybDogc3RyaW5nXTogc3RyaW5nIH0gPSB7fVxuXG5mdW5jdGlvbiBnZXRDYWNoZUtleShcbiAgdXJsOiBzdHJpbmcsXG4gIGNvbnRlbnRUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIGluY2x1ZGVRdWVyeVBhcmFtczogYm9vbGVhbiB8IHVuZGVmaW5lZCxcbikge1xuICBsZXQga2V5ID0gdXJsLnJlcGxhY2UoL1xcPy4qLywgJycpXG5cbiAgaWYgKGluY2x1ZGVRdWVyeVBhcmFtcykge1xuICAgIGtleSA9IHVybFxuICB9XG5cbiAgLy8gZm9udCByZXNvdXJjZVxuICBpZiAoL3R0ZnxvdGZ8ZW90fHdvZmYyPy9pLnRlc3Qoa2V5KSkge1xuICAgIGtleSA9IGtleS5yZXBsYWNlKC8uKlxcLy8sICcnKVxuICB9XG5cbiAgcmV0dXJuIGNvbnRlbnRUeXBlID8gYFske2NvbnRlbnRUeXBlfV0ke2tleX1gIDoga2V5XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXNvdXJjZVRvRGF0YVVSTChcbiAgcmVzb3VyY2VVcmw6IHN0cmluZyxcbiAgY29udGVudFR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbikge1xuICBjb25zdCBjYWNoZUtleSA9IGdldENhY2hlS2V5KFxuICAgIHJlc291cmNlVXJsLFxuICAgIGNvbnRlbnRUeXBlLFxuICAgIG9wdGlvbnMuaW5jbHVkZVF1ZXJ5UGFyYW1zLFxuICApXG5cbiAgaWYgKGNhY2hlW2NhY2hlS2V5XSAhPSBudWxsKSB7XG4gICAgcmV0dXJuIGNhY2hlW2NhY2hlS2V5XVxuICB9XG5cbiAgLy8gcmVmOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9kb2NzL1dlYi9BUEkvWE1MSHR0cFJlcXVlc3QvVXNpbmdfWE1MSHR0cFJlcXVlc3QjQnlwYXNzaW5nX3RoZV9jYWNoZVxuICBpZiAob3B0aW9ucy5jYWNoZUJ1c3QpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcGFyYW0tcmVhc3NpZ25cbiAgICByZXNvdXJjZVVybCArPSAoL1xcPy8udGVzdChyZXNvdXJjZVVybCkgPyAnJicgOiAnPycpICsgbmV3IERhdGUoKS5nZXRUaW1lKClcbiAgfVxuXG4gIGxldCBkYXRhVVJMOiBzdHJpbmdcbiAgdHJ5IHtcbiAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZmV0Y2hBc0RhdGFVUkwoXG4gICAgICByZXNvdXJjZVVybCxcbiAgICAgIG9wdGlvbnMuZmV0Y2hSZXF1ZXN0SW5pdCxcbiAgICAgICh7IHJlcywgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgaWYgKCFjb250ZW50VHlwZSkge1xuICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wYXJhbS1yZWFzc2lnblxuICAgICAgICAgIGNvbnRlbnRUeXBlID0gcmVzLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKSB8fCAnJ1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnZXRDb250ZW50RnJvbURhdGFVcmwocmVzdWx0KVxuICAgICAgfSxcbiAgICApXG4gICAgZGF0YVVSTCA9IG1ha2VEYXRhVXJsKGNvbnRlbnQsIGNvbnRlbnRUeXBlISlcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBkYXRhVVJMID0gb3B0aW9ucy5pbWFnZVBsYWNlaG9sZGVyIHx8ICcnXG5cbiAgICBpZiAob3B0aW9ucy5jb25zb2xlTG9nKSB7XG4gICAgICBsZXQgbXNnID0gYEZhaWxlZCB0byBmZXRjaCByZXNvdXJjZTogJHtyZXNvdXJjZVVybH1gXG4gICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgbXNnID0gdHlwZW9mIGVycm9yID09PSAnc3RyaW5nJyA/IGVycm9yIDogZXJyb3IubWVzc2FnZVxuICAgICAgfVxuXG4gICAgICBpZiAobXNnKSB7XG4gICAgICAgIGNvbnNvbGUud2Fybihtc2cpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY2FjaGVbY2FjaGVLZXldID0gZGF0YVVSTFxuICByZXR1cm4gZGF0YVVSTFxufVxuIiwiaW1wb3J0IHR5cGUgeyBPcHRpb25zIH0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IGNsb25lUHNldWRvRWxlbWVudHMgfSBmcm9tICcuL2Nsb25lLXBzZXVkb3MnXG5pbXBvcnQgeyBjcmVhdGVJbWFnZSwgdG9BcnJheSwgaXNJbnN0YW5jZU9mRWxlbWVudCB9IGZyb20gJy4vdXRpbCdcbmltcG9ydCB7IGdldE1pbWVUeXBlIH0gZnJvbSAnLi9taW1lcydcbmltcG9ydCB7IHJlc291cmNlVG9EYXRhVVJMIH0gZnJvbSAnLi9kYXRhdXJsJ1xuXG5hc3luYyBmdW5jdGlvbiBjbG9uZUNhbnZhc0VsZW1lbnQoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCkge1xuICBjb25zdCBkYXRhVVJMID0gY2FudmFzLnRvRGF0YVVSTCgpXG4gIGlmIChkYXRhVVJMID09PSAnZGF0YTosJykge1xuICAgIHJldHVybiBjYW52YXMuY2xvbmVOb2RlKGZhbHNlKSBhcyBIVE1MQ2FudmFzRWxlbWVudFxuICB9XG4gIHJldHVybiBjcmVhdGVJbWFnZShkYXRhVVJMKVxufVxuXG5hc3luYyBmdW5jdGlvbiBjbG9uZVZpZGVvRWxlbWVudCh2aWRlbzogSFRNTFZpZGVvRWxlbWVudCwgb3B0aW9uczogT3B0aW9ucykge1xuICBpZiAodmlkZW8uY3VycmVudFNyYykge1xuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpXG4gICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJylcbiAgICBjYW52YXMud2lkdGggPSB2aWRlby5jbGllbnRXaWR0aFxuICAgIGNhbnZhcy5oZWlnaHQgPSB2aWRlby5jbGllbnRIZWlnaHRcbiAgICBjdHg/LmRyYXdJbWFnZSh2aWRlbywgMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KVxuICAgIGNvbnN0IGRhdGFVUkwgPSBjYW52YXMudG9EYXRhVVJMKClcbiAgICByZXR1cm4gY3JlYXRlSW1hZ2UoZGF0YVVSTClcbiAgfVxuXG4gIGNvbnN0IHBvc3RlciA9IHZpZGVvLnBvc3RlclxuICBjb25zdCBjb250ZW50VHlwZSA9IGdldE1pbWVUeXBlKHBvc3RlcilcbiAgY29uc3QgZGF0YVVSTCA9IGF3YWl0IHJlc291cmNlVG9EYXRhVVJMKHBvc3RlciwgY29udGVudFR5cGUsIG9wdGlvbnMpXG4gIHJldHVybiBjcmVhdGVJbWFnZShkYXRhVVJMKVxufVxuXG5hc3luYyBmdW5jdGlvbiBjbG9uZUlGcmFtZUVsZW1lbnQoaWZyYW1lOiBIVE1MSUZyYW1lRWxlbWVudCkge1xuICB0cnkge1xuICAgIGlmIChpZnJhbWU/LmNvbnRlbnREb2N1bWVudD8uYm9keSkge1xuICAgICAgcmV0dXJuIChhd2FpdCBjbG9uZU5vZGUoXG4gICAgICAgIGlmcmFtZS5jb250ZW50RG9jdW1lbnQuYm9keSxcbiAgICAgICAge30sXG4gICAgICAgIHRydWUsXG4gICAgICApKSBhcyBIVE1MQm9keUVsZW1lbnRcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIEZhaWxlZCB0byBjbG9uZSBpZnJhbWVcbiAgfVxuXG4gIHJldHVybiBpZnJhbWUuY2xvbmVOb2RlKGZhbHNlKSBhcyBIVE1MSUZyYW1lRWxlbWVudFxufVxuXG5hc3luYyBmdW5jdGlvbiBjbG9uZVNpbmdsZU5vZGU8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgbm9kZTogVCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbik6IFByb21pc2U8SFRNTEVsZW1lbnQ+IHtcbiAgaWYgKGlzSW5zdGFuY2VPZkVsZW1lbnQobm9kZSwgSFRNTENhbnZhc0VsZW1lbnQpKSB7XG4gICAgcmV0dXJuIGNsb25lQ2FudmFzRWxlbWVudChub2RlKVxuICB9XG5cbiAgaWYgKGlzSW5zdGFuY2VPZkVsZW1lbnQobm9kZSwgSFRNTFZpZGVvRWxlbWVudCkpIHtcbiAgICByZXR1cm4gY2xvbmVWaWRlb0VsZW1lbnQobm9kZSwgb3B0aW9ucylcbiAgfVxuXG4gIGlmIChpc0luc3RhbmNlT2ZFbGVtZW50KG5vZGUsIEhUTUxJRnJhbWVFbGVtZW50KSkge1xuICAgIHJldHVybiBjbG9uZUlGcmFtZUVsZW1lbnQobm9kZSlcbiAgfVxuXG4gIHJldHVybiBub2RlLmNsb25lTm9kZShmYWxzZSkgYXMgVFxufVxuXG5jb25zdCBpc1Nsb3RFbGVtZW50ID0gKG5vZGU6IEhUTUxFbGVtZW50KTogbm9kZSBpcyBIVE1MU2xvdEVsZW1lbnQgPT5cbiAgbm9kZS50YWdOYW1lICE9IG51bGwgJiYgbm9kZS50YWdOYW1lLnRvVXBwZXJDYXNlKCkgPT09ICdTTE9UJ1xuXG5hc3luYyBmdW5jdGlvbiBjbG9uZUNoaWxkcmVuPFQgZXh0ZW5kcyBIVE1MRWxlbWVudD4oXG4gIG5hdGl2ZU5vZGU6IFQsXG4gIGNsb25lZE5vZGU6IFQsXG4gIG9wdGlvbnM6IE9wdGlvbnMsXG4pOiBQcm9taXNlPFQ+IHtcbiAgbGV0IGNoaWxkcmVuOiBUW10gPSBbXVxuXG4gIGlmIChpc1Nsb3RFbGVtZW50KG5hdGl2ZU5vZGUpICYmIG5hdGl2ZU5vZGUuYXNzaWduZWROb2Rlcykge1xuICAgIGNoaWxkcmVuID0gdG9BcnJheTxUPihuYXRpdmVOb2RlLmFzc2lnbmVkTm9kZXMoKSlcbiAgfSBlbHNlIGlmIChcbiAgICBpc0luc3RhbmNlT2ZFbGVtZW50KG5hdGl2ZU5vZGUsIEhUTUxJRnJhbWVFbGVtZW50KSAmJlxuICAgIG5hdGl2ZU5vZGUuY29udGVudERvY3VtZW50Py5ib2R5XG4gICkge1xuICAgIGNoaWxkcmVuID0gdG9BcnJheTxUPihuYXRpdmVOb2RlLmNvbnRlbnREb2N1bWVudC5ib2R5LmNoaWxkTm9kZXMpXG4gIH0gZWxzZSB7XG4gICAgY2hpbGRyZW4gPSB0b0FycmF5PFQ+KChuYXRpdmVOb2RlLnNoYWRvd1Jvb3QgPz8gbmF0aXZlTm9kZSkuY2hpbGROb2RlcylcbiAgfVxuXG4gIGlmIChcbiAgICBjaGlsZHJlbi5sZW5ndGggPT09IDAgfHxcbiAgICBpc0luc3RhbmNlT2ZFbGVtZW50KG5hdGl2ZU5vZGUsIEhUTUxWaWRlb0VsZW1lbnQpXG4gICkge1xuICAgIHJldHVybiBjbG9uZWROb2RlXG4gIH1cblxuICBhd2FpdCBjaGlsZHJlbi5yZWR1Y2UoXG4gICAgKGRlZmVycmVkLCBjaGlsZCkgPT5cbiAgICAgIGRlZmVycmVkXG4gICAgICAgIC50aGVuKCgpID0+IGNsb25lTm9kZShjaGlsZCwgb3B0aW9ucykpXG4gICAgICAgIC50aGVuKChjbG9uZWRDaGlsZDogSFRNTEVsZW1lbnQgfCBudWxsKSA9PiB7XG4gICAgICAgICAgaWYgKGNsb25lZENoaWxkKSB7XG4gICAgICAgICAgICBjbG9uZWROb2RlLmFwcGVuZENoaWxkKGNsb25lZENoaWxkKVxuICAgICAgICAgIH1cbiAgICAgICAgfSksXG4gICAgUHJvbWlzZS5yZXNvbHZlKCksXG4gIClcblxuICByZXR1cm4gY2xvbmVkTm9kZVxufVxuXG5mdW5jdGlvbiBjbG9uZUNTU1N0eWxlPFQgZXh0ZW5kcyBIVE1MRWxlbWVudD4obmF0aXZlTm9kZTogVCwgY2xvbmVkTm9kZTogVCkge1xuICBjb25zdCB0YXJnZXRTdHlsZSA9IGNsb25lZE5vZGUuc3R5bGVcbiAgaWYgKCF0YXJnZXRTdHlsZSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3Qgc291cmNlU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShuYXRpdmVOb2RlKVxuICBpZiAoc291cmNlU3R5bGUuY3NzVGV4dCkge1xuICAgIHRhcmdldFN0eWxlLmNzc1RleHQgPSBzb3VyY2VTdHlsZS5jc3NUZXh0XG4gICAgdGFyZ2V0U3R5bGUudHJhbnNmb3JtT3JpZ2luID0gc291cmNlU3R5bGUudHJhbnNmb3JtT3JpZ2luXG4gIH0gZWxzZSB7XG4gICAgdG9BcnJheTxzdHJpbmc+KHNvdXJjZVN0eWxlKS5mb3JFYWNoKChuYW1lKSA9PiB7XG4gICAgICBsZXQgdmFsdWUgPSBzb3VyY2VTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpXG4gICAgICBpZiAobmFtZSA9PT0gJ2ZvbnQtc2l6ZScgJiYgdmFsdWUuZW5kc1dpdGgoJ3B4JykpIHtcbiAgICAgICAgY29uc3QgcmVkdWNlZEZvbnQgPVxuICAgICAgICAgIE1hdGguZmxvb3IocGFyc2VGbG9hdCh2YWx1ZS5zdWJzdHJpbmcoMCwgdmFsdWUubGVuZ3RoIC0gMikpKSAtIDAuMVxuICAgICAgICB2YWx1ZSA9IGAke3JlZHVjZWRGb250fXB4YFxuICAgICAgfVxuICAgICAgaWYgKG5hbWUgPT09ICdkJyAmJiBjbG9uZWROb2RlLmdldEF0dHJpYnV0ZSgnZCcpKSB7XG4gICAgICAgIHZhbHVlID0gYHBhdGgoJHtjbG9uZWROb2RlLmdldEF0dHJpYnV0ZSgnZCcpfSlgXG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIGlzSW5zdGFuY2VPZkVsZW1lbnQobmF0aXZlTm9kZSwgSFRNTElGcmFtZUVsZW1lbnQpICYmXG4gICAgICAgIG5hbWUgPT09ICdkaXNwbGF5JyAmJlxuICAgICAgICB2YWx1ZSA9PT0gJ2lubGluZSdcbiAgICAgICkge1xuICAgICAgICB2YWx1ZSA9ICdibG9jaydcbiAgICAgIH1cbiAgICAgIHRhcmdldFN0eWxlLnNldFByb3BlcnR5KFxuICAgICAgICBuYW1lLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgc291cmNlU3R5bGUuZ2V0UHJvcGVydHlQcmlvcml0eShuYW1lKSxcbiAgICAgIClcbiAgICB9KVxuICB9XG59XG5cbmZ1bmN0aW9uIGNsb25lSW5wdXRWYWx1ZTxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KG5hdGl2ZU5vZGU6IFQsIGNsb25lZE5vZGU6IFQpIHtcbiAgaWYgKGlzSW5zdGFuY2VPZkVsZW1lbnQobmF0aXZlTm9kZSwgSFRNTFRleHRBcmVhRWxlbWVudCkpIHtcbiAgICBjbG9uZWROb2RlLmlubmVySFRNTCA9IG5hdGl2ZU5vZGUudmFsdWVcbiAgfVxuXG4gIGlmIChpc0luc3RhbmNlT2ZFbGVtZW50KG5hdGl2ZU5vZGUsIEhUTUxJbnB1dEVsZW1lbnQpKSB7XG4gICAgY2xvbmVkTm9kZS5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgbmF0aXZlTm9kZS52YWx1ZSlcbiAgfVxufVxuXG5mdW5jdGlvbiBjbG9uZVNlbGVjdFZhbHVlPFQgZXh0ZW5kcyBIVE1MRWxlbWVudD4obmF0aXZlTm9kZTogVCwgY2xvbmVkTm9kZTogVCkge1xuICBpZiAoaXNJbnN0YW5jZU9mRWxlbWVudChuYXRpdmVOb2RlLCBIVE1MU2VsZWN0RWxlbWVudCkpIHtcbiAgICBjb25zdCBjbG9uZWRTZWxlY3QgPSBjbG9uZWROb2RlIGFzIGFueSBhcyBIVE1MU2VsZWN0RWxlbWVudFxuICAgIGNvbnN0IHNlbGVjdGVkT3B0aW9uID0gQXJyYXkuZnJvbShjbG9uZWRTZWxlY3QuY2hpbGRyZW4pLmZpbmQoXG4gICAgICAoY2hpbGQpID0+IG5hdGl2ZU5vZGUudmFsdWUgPT09IGNoaWxkLmdldEF0dHJpYnV0ZSgndmFsdWUnKSxcbiAgICApXG5cbiAgICBpZiAoc2VsZWN0ZWRPcHRpb24pIHtcbiAgICAgIHNlbGVjdGVkT3B0aW9uLnNldEF0dHJpYnV0ZSgnc2VsZWN0ZWQnLCAnJylcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZGVjb3JhdGU8VCBleHRlbmRzIEhUTUxFbGVtZW50PihuYXRpdmVOb2RlOiBULCBjbG9uZWROb2RlOiBUKTogVCB7XG4gIGlmIChpc0luc3RhbmNlT2ZFbGVtZW50KGNsb25lZE5vZGUsIEVsZW1lbnQpKSB7XG4gICAgY2xvbmVDU1NTdHlsZShuYXRpdmVOb2RlLCBjbG9uZWROb2RlKVxuICAgIGNsb25lUHNldWRvRWxlbWVudHMobmF0aXZlTm9kZSwgY2xvbmVkTm9kZSlcbiAgICBjbG9uZUlucHV0VmFsdWUobmF0aXZlTm9kZSwgY2xvbmVkTm9kZSlcbiAgICBjbG9uZVNlbGVjdFZhbHVlKG5hdGl2ZU5vZGUsIGNsb25lZE5vZGUpXG4gIH1cblxuICByZXR1cm4gY2xvbmVkTm9kZVxufVxuXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVTVkdTeW1ib2xzPFQgZXh0ZW5kcyBIVE1MRWxlbWVudD4oXG4gIGNsb25lOiBULFxuICBvcHRpb25zOiBPcHRpb25zLFxuKSB7XG4gIGNvbnN0IHVzZXMgPSBjbG9uZS5xdWVyeVNlbGVjdG9yQWxsID8gY2xvbmUucXVlcnlTZWxlY3RvckFsbCgndXNlJykgOiBbXVxuICBpZiAodXNlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gY2xvbmVcbiAgfVxuXG4gIGNvbnN0IHByb2Nlc3NlZERlZnM6IHsgW2tleTogc3RyaW5nXTogSFRNTEVsZW1lbnQgfSA9IHt9XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgdXNlcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IHVzZSA9IHVzZXNbaV1cbiAgICBjb25zdCBpZCA9IHVzZS5nZXRBdHRyaWJ1dGUoJ3hsaW5rOmhyZWYnKVxuICAgIGlmIChpZCkge1xuICAgICAgY29uc3QgZXhpc3QgPSBjbG9uZS5xdWVyeVNlbGVjdG9yKGlkKVxuICAgICAgY29uc3QgZGVmaW5pdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpIGFzIEhUTUxFbGVtZW50XG4gICAgICBpZiAoIWV4aXN0ICYmIGRlZmluaXRpb24gJiYgIXByb2Nlc3NlZERlZnNbaWRdKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG4gICAgICAgIHByb2Nlc3NlZERlZnNbaWRdID0gKGF3YWl0IGNsb25lTm9kZShkZWZpbml0aW9uLCBvcHRpb25zLCB0cnVlKSkhXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgbm9kZXMgPSBPYmplY3QudmFsdWVzKHByb2Nlc3NlZERlZnMpXG4gIGlmIChub2Rlcy5sZW5ndGgpIHtcbiAgICBjb25zdCBucyA9ICdodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sJ1xuICAgIGNvbnN0IHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhucywgJ3N2ZycpXG4gICAgc3ZnLnNldEF0dHJpYnV0ZSgneG1sbnMnLCBucylcbiAgICBzdmcuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnXG4gICAgc3ZnLnN0eWxlLndpZHRoID0gJzAnXG4gICAgc3ZnLnN0eWxlLmhlaWdodCA9ICcwJ1xuICAgIHN2Zy5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nXG4gICAgc3ZnLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSdcblxuICAgIGNvbnN0IGRlZnMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobnMsICdkZWZzJylcbiAgICBzdmcuYXBwZW5kQ2hpbGQoZGVmcylcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbm9kZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGRlZnMuYXBwZW5kQ2hpbGQobm9kZXNbaV0pXG4gICAgfVxuXG4gICAgY2xvbmUuYXBwZW5kQ2hpbGQoc3ZnKVxuICB9XG5cbiAgcmV0dXJuIGNsb25lXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjbG9uZU5vZGU8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgbm9kZTogVCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbiAgaXNSb290PzogYm9vbGVhbixcbik6IFByb21pc2U8VCB8IG51bGw+IHtcbiAgaWYgKCFpc1Jvb3QgJiYgb3B0aW9ucy5maWx0ZXIgJiYgIW9wdGlvbnMuZmlsdGVyKG5vZGUpKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUobm9kZSlcbiAgICAudGhlbigoY2xvbmVkTm9kZSkgPT4gY2xvbmVTaW5nbGVOb2RlKGNsb25lZE5vZGUsIG9wdGlvbnMpIGFzIFByb21pc2U8VD4pXG4gICAgLnRoZW4oKGNsb25lZE5vZGUpID0+IGNsb25lQ2hpbGRyZW4obm9kZSwgY2xvbmVkTm9kZSwgb3B0aW9ucykpXG4gICAgLnRoZW4oKGNsb25lZE5vZGUpID0+IGRlY29yYXRlKG5vZGUsIGNsb25lZE5vZGUpKVxuICAgIC50aGVuKChjbG9uZWROb2RlKSA9PiBlbnN1cmVTVkdTeW1ib2xzKGNsb25lZE5vZGUsIG9wdGlvbnMpKVxufVxuIiwiaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyByZXNvbHZlVXJsIH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgZ2V0TWltZVR5cGUgfSBmcm9tICcuL21pbWVzJ1xuaW1wb3J0IHsgaXNEYXRhVXJsLCBtYWtlRGF0YVVybCwgcmVzb3VyY2VUb0RhdGFVUkwgfSBmcm9tICcuL2RhdGF1cmwnXG5cbmNvbnN0IFVSTF9SRUdFWCA9IC91cmxcXCgoWydcIl0/KShbXidcIl0rPylcXDFcXCkvZ1xuY29uc3QgVVJMX1dJVEhfRk9STUFUX1JFR0VYID0gL3VybFxcKFteKV0rXFwpXFxzKmZvcm1hdFxcKChbXCInXT8pKFteXCInXSspXFwxXFwpL2dcbmNvbnN0IEZPTlRfU1JDX1JFR0VYID0gL3NyYzpcXHMqKD86dXJsXFwoW14pXStcXClcXHMqZm9ybWF0XFwoW14pXStcXClbLDtdXFxzKikrL2dcblxuZnVuY3Rpb24gdG9SZWdleCh1cmw6IHN0cmluZyk6IFJlZ0V4cCB7XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWVzY2FwZVxuICBjb25zdCBlc2NhcGVkID0gdXJsLnJlcGxhY2UoLyhbLiorP14ke30oKXxcXFtcXF1cXC9cXFxcXSkvZywgJ1xcXFwkMScpXG4gIHJldHVybiBuZXcgUmVnRXhwKGAodXJsXFxcXChbJ1wiXT8pKCR7ZXNjYXBlZH0pKFsnXCJdP1xcXFwpKWAsICdnJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVVJMcyhjc3NUZXh0OiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIGNvbnN0IHVybHM6IHN0cmluZ1tdID0gW11cblxuICBjc3NUZXh0LnJlcGxhY2UoVVJMX1JFR0VYLCAocmF3LCBxdW90YXRpb24sIHVybCkgPT4ge1xuICAgIHVybHMucHVzaCh1cmwpXG4gICAgcmV0dXJuIHJhd1xuICB9KVxuXG4gIHJldHVybiB1cmxzLmZpbHRlcigodXJsKSA9PiAhaXNEYXRhVXJsKHVybCkpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbWJlZChcbiAgY3NzVGV4dDogc3RyaW5nLFxuICByZXNvdXJjZVVSTDogc3RyaW5nLFxuICBiYXNlVVJMOiBzdHJpbmcgfCBudWxsLFxuICBvcHRpb25zOiBPcHRpb25zLFxuICBnZXRDb250ZW50RnJvbVVybD86ICh1cmw6IHN0cmluZykgPT4gUHJvbWlzZTxzdHJpbmc+LFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCByZXNvbHZlZFVSTCA9IGJhc2VVUkwgPyByZXNvbHZlVXJsKHJlc291cmNlVVJMLCBiYXNlVVJMKSA6IHJlc291cmNlVVJMXG4gICAgY29uc3QgY29udGVudFR5cGUgPSBnZXRNaW1lVHlwZShyZXNvdXJjZVVSTClcbiAgICBsZXQgZGF0YVVSTDogc3RyaW5nXG4gICAgaWYgKGdldENvbnRlbnRGcm9tVXJsKSB7XG4gICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgZ2V0Q29udGVudEZyb21VcmwocmVzb2x2ZWRVUkwpXG4gICAgICBkYXRhVVJMID0gbWFrZURhdGFVcmwoY29udGVudCwgY29udGVudFR5cGUpXG4gICAgfSBlbHNlIHtcbiAgICAgIGRhdGFVUkwgPSBhd2FpdCByZXNvdXJjZVRvRGF0YVVSTChyZXNvbHZlZFVSTCwgY29udGVudFR5cGUsIG9wdGlvbnMpXG4gICAgfVxuICAgIHJldHVybiBjc3NUZXh0LnJlcGxhY2UodG9SZWdleChyZXNvdXJjZVVSTCksIGAkMSR7ZGF0YVVSTH0kM2ApXG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgLy8gcGFzc1xuICB9XG4gIHJldHVybiBjc3NUZXh0XG59XG5cbmZ1bmN0aW9uIGZpbHRlclByZWZlcnJlZEZvbnRGb3JtYXQoXG4gIHN0cjogc3RyaW5nLFxuICB7IHByZWZlcnJlZEZvbnRGb3JtYXQgfTogT3B0aW9ucyxcbik6IHN0cmluZyB7XG4gIHJldHVybiAhcHJlZmVycmVkRm9udEZvcm1hdFxuICAgID8gc3RyXG4gICAgOiBzdHIucmVwbGFjZShGT05UX1NSQ19SRUdFWCwgKG1hdGNoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGNvbnN0IFtzcmMsICwgZm9ybWF0XSA9IFVSTF9XSVRIX0ZPUk1BVF9SRUdFWC5leGVjKG1hdGNoKSB8fCBbXVxuICAgICAgICAgIGlmICghZm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gJydcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZm9ybWF0ID09PSBwcmVmZXJyZWRGb250Rm9ybWF0KSB7XG4gICAgICAgICAgICByZXR1cm4gYHNyYzogJHtzcmN9O2BcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG91bGRFbWJlZCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gdXJsLnNlYXJjaChVUkxfUkVHRVgpICE9PSAtMVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW1iZWRSZXNvdXJjZXMoXG4gIGNzc1RleHQ6IHN0cmluZyxcbiAgYmFzZVVybDogc3RyaW5nIHwgbnVsbCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGlmICghc2hvdWxkRW1iZWQoY3NzVGV4dCkpIHtcbiAgICByZXR1cm4gY3NzVGV4dFxuICB9XG5cbiAgY29uc3QgZmlsdGVyZWRDU1NUZXh0ID0gZmlsdGVyUHJlZmVycmVkRm9udEZvcm1hdChjc3NUZXh0LCBvcHRpb25zKVxuICBjb25zdCB1cmxzID0gcGFyc2VVUkxzKGZpbHRlcmVkQ1NTVGV4dClcbiAgcmV0dXJuIHVybHMucmVkdWNlKFxuICAgIChkZWZlcnJlZCwgdXJsKSA9PlxuICAgICAgZGVmZXJyZWQudGhlbigoY3NzKSA9PiBlbWJlZChjc3MsIHVybCwgYmFzZVVybCwgb3B0aW9ucykpLFxuICAgIFByb21pc2UucmVzb2x2ZShmaWx0ZXJlZENTU1RleHQpLFxuICApXG59XG4iLCJpbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi90eXBlcydcbmltcG9ydCB7IGVtYmVkUmVzb3VyY2VzIH0gZnJvbSAnLi9lbWJlZC1yZXNvdXJjZXMnXG5pbXBvcnQgeyB0b0FycmF5LCBpc0luc3RhbmNlT2ZFbGVtZW50IH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgaXNEYXRhVXJsLCByZXNvdXJjZVRvRGF0YVVSTCB9IGZyb20gJy4vZGF0YXVybCdcbmltcG9ydCB7IGdldE1pbWVUeXBlIH0gZnJvbSAnLi9taW1lcydcblxuYXN5bmMgZnVuY3Rpb24gZW1iZWRCYWNrZ3JvdW5kPFQgZXh0ZW5kcyBIVE1MRWxlbWVudD4oXG4gIGNsb25lZE5vZGU6IFQsXG4gIG9wdGlvbnM6IE9wdGlvbnMsXG4pIHtcbiAgY29uc3QgYmFja2dyb3VuZCA9IGNsb25lZE5vZGUuc3R5bGU/LmdldFByb3BlcnR5VmFsdWUoJ2JhY2tncm91bmQnKVxuICBpZiAoYmFja2dyb3VuZCkge1xuICAgIGNvbnN0IGNzc1N0cmluZyA9IGF3YWl0IGVtYmVkUmVzb3VyY2VzKGJhY2tncm91bmQsIG51bGwsIG9wdGlvbnMpXG4gICAgY2xvbmVkTm9kZS5zdHlsZS5zZXRQcm9wZXJ0eShcbiAgICAgICdiYWNrZ3JvdW5kJyxcbiAgICAgIGNzc1N0cmluZyxcbiAgICAgIGNsb25lZE5vZGUuc3R5bGUuZ2V0UHJvcGVydHlQcmlvcml0eSgnYmFja2dyb3VuZCcpLFxuICAgIClcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBlbWJlZEltYWdlTm9kZTxUIGV4dGVuZHMgSFRNTEVsZW1lbnQgfCBTVkdJbWFnZUVsZW1lbnQ+KFxuICBjbG9uZWROb2RlOiBULFxuICBvcHRpb25zOiBPcHRpb25zLFxuKSB7XG4gIGNvbnN0IGlzSW1hZ2VFbGVtZW50ID0gaXNJbnN0YW5jZU9mRWxlbWVudChjbG9uZWROb2RlLCBIVE1MSW1hZ2VFbGVtZW50KVxuXG4gIGlmIChcbiAgICAhKGlzSW1hZ2VFbGVtZW50ICYmICFpc0RhdGFVcmwoY2xvbmVkTm9kZS5zcmMpKSAmJlxuICAgICEoXG4gICAgICBpc0luc3RhbmNlT2ZFbGVtZW50KGNsb25lZE5vZGUsIFNWR0ltYWdlRWxlbWVudCkgJiZcbiAgICAgICFpc0RhdGFVcmwoY2xvbmVkTm9kZS5ocmVmLmJhc2VWYWwpXG4gICAgKVxuICApIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IHByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGNsb25lZE5vZGUub25sb2FkID0gcmVzb2x2ZVxuICAgIGNsb25lZE5vZGUub25lcnJvciA9IHJlc29sdmVcblxuICAgIGNvbnN0IGltYWdlID0gY2xvbmVkTm9kZSBhcyBIVE1MSW1hZ2VFbGVtZW50XG4gICAgaWYgKGltYWdlLmRlY29kZSkge1xuICAgICAgaW1hZ2UuZGVjb2RlID0gcmVzb2x2ZSBhcyBhbnlcbiAgICB9XG5cbiAgICBpZiAoaW1hZ2UubG9hZGluZyA9PT0gJ2xhenknKSB7XG4gICAgICBpbWFnZS5sb2FkaW5nID0gJ2VhZ2VyJ1xuICAgIH1cbiAgfSlcblxuICBjb25zdCB1cmwgPSBpc0ltYWdlRWxlbWVudCA/IGNsb25lZE5vZGUuc3JjIDogY2xvbmVkTm9kZS5ocmVmLmJhc2VWYWxcblxuICBjb25zdCBkYXRhVVJMID0gYXdhaXQgcmVzb3VyY2VUb0RhdGFVUkwodXJsLCBnZXRNaW1lVHlwZSh1cmwpLCBvcHRpb25zKVxuICBpZiAoIWRhdGFVUkwgfHwgZGF0YVVSTCA9PT0gJycpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChpc0ltYWdlRWxlbWVudCkge1xuICAgIGNsb25lZE5vZGUuc3Jjc2V0ID0gJydcbiAgICBjbG9uZWROb2RlLnNyYyA9IGRhdGFVUkxcbiAgfSBlbHNlIHtcbiAgICBjbG9uZWROb2RlLmhyZWYuYmFzZVZhbCA9IGRhdGFVUkxcbiAgfVxuXG4gIGF3YWl0IHByb21pc2Vcbn1cblxuYXN5bmMgZnVuY3Rpb24gZW1iZWRDaGlsZHJlbjxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KFxuICBjbG9uZWROb2RlOiBULFxuICBvcHRpb25zOiBPcHRpb25zLFxuKSB7XG4gIGNvbnN0IGNoaWxkcmVuID0gdG9BcnJheTxIVE1MRWxlbWVudD4oY2xvbmVkTm9kZS5jaGlsZE5vZGVzKVxuICBjb25zdCBkZWZlcnJlZHMgPSBjaGlsZHJlbi5tYXAoKGNoaWxkKSA9PiBlbWJlZEltYWdlcyhjaGlsZCwgb3B0aW9ucykpXG4gIGF3YWl0IFByb21pc2UuYWxsKGRlZmVycmVkcykudGhlbigoKSA9PiBjbG9uZWROb2RlKVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW1iZWRJbWFnZXM8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgY2xvbmVkTm9kZTogVCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbikge1xuICBpZiAoaXNJbnN0YW5jZU9mRWxlbWVudChjbG9uZWROb2RlLCBFbGVtZW50KSkge1xuICAgIGF3YWl0IGVtYmVkQmFja2dyb3VuZChjbG9uZWROb2RlLCBvcHRpb25zKVxuICAgIGF3YWl0IGVtYmVkSW1hZ2VOb2RlKGNsb25lZE5vZGUsIG9wdGlvbnMpXG4gICAgYXdhaXQgZW1iZWRDaGlsZHJlbihjbG9uZWROb2RlLCBvcHRpb25zKVxuICB9XG59XG4iLCJpbXBvcnQgeyBPcHRpb25zIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5U3R5bGU8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgbm9kZTogVCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbik6IFQge1xuICBjb25zdCB7IHN0eWxlIH0gPSBub2RlXG5cbiAgaWYgKG9wdGlvbnMuYmFja2dyb3VuZENvbG9yKSB7XG4gICAgc3R5bGUuYmFja2dyb3VuZENvbG9yID0gb3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3JcbiAgfVxuXG4gIGlmIChvcHRpb25zLndpZHRoKSB7XG4gICAgc3R5bGUud2lkdGggPSBgJHtvcHRpb25zLndpZHRofXB4YFxuICB9XG5cbiAgaWYgKG9wdGlvbnMuaGVpZ2h0KSB7XG4gICAgc3R5bGUuaGVpZ2h0ID0gYCR7b3B0aW9ucy5oZWlnaHR9cHhgXG4gIH1cblxuICBjb25zdCBtYW51YWwgPSBvcHRpb25zLnN0eWxlXG4gIGlmIChtYW51YWwgIT0gbnVsbCkge1xuICAgIE9iamVjdC5rZXlzKG1hbnVhbCkuZm9yRWFjaCgoa2V5OiBhbnkpID0+IHtcbiAgICAgIHN0eWxlW2tleV0gPSBtYW51YWxba2V5XSBhcyBzdHJpbmdcbiAgICB9KVxuICB9XG5cbiAgcmV0dXJuIG5vZGVcbn1cbiIsImltcG9ydCB0eXBlIHsgT3B0aW9ucyB9IGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyB0b0FycmF5IH0gZnJvbSAnLi91dGlsJ1xuaW1wb3J0IHsgZmV0Y2hBc0RhdGFVUkwgfSBmcm9tICcuL2RhdGF1cmwnXG5pbXBvcnQgeyBzaG91bGRFbWJlZCwgZW1iZWRSZXNvdXJjZXMgfSBmcm9tICcuL2VtYmVkLXJlc291cmNlcydcblxuaW50ZXJmYWNlIE1ldGFkYXRhIHtcbiAgdXJsOiBzdHJpbmdcbiAgY3NzVGV4dDogc3RyaW5nXG59XG5cbmNvbnN0IGNzc0ZldGNoQ2FjaGU6IHsgW2hyZWY6IHN0cmluZ106IE1ldGFkYXRhIH0gPSB7fVxuXG5hc3luYyBmdW5jdGlvbiBmZXRjaENTUyh1cmw6IHN0cmluZywgb3B0aW9uczogT3B0aW9ucykge1xuICBsZXQgY2FjaGUgPSBjc3NGZXRjaENhY2hlW3VybF1cbiAgaWYgKGNhY2hlICE9IG51bGwpIHtcbiAgICByZXR1cm4gY2FjaGVcbiAgfVxuXG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKHVybCwgb3B0aW9ucy5mZXRjaFJlcXVlc3RJbml0KVxuICBjb25zdCBjc3NUZXh0ID0gYXdhaXQgcmVzLnRleHQoKVxuICBpZiAoIWNzc1RleHQgfHwgY3NzVGV4dC5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFRleHQgXCIke3VybH1cIiBpcyBlbXB0eWApXG4gIH1cbiAgY2FjaGUgPSB7IHVybCwgY3NzVGV4dCB9XG5cbiAgY3NzRmV0Y2hDYWNoZVt1cmxdID0gY2FjaGVcblxuICByZXR1cm4gY2FjaGVcbn1cblxuYXN5bmMgZnVuY3Rpb24gZW1iZWRGb250cyhkYXRhOiBNZXRhZGF0YSwgb3B0aW9uczogT3B0aW9ucyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIGxldCBjc3NUZXh0ID0gZGF0YS5jc3NUZXh0XG4gIGNvbnN0IHJlZ2V4VXJsID0gL3VybFxcKFtcIiddPyhbXlwiJyldKylbXCInXT9cXCkvZ1xuICBjb25zdCBmb250TG9jcyA9IGNzc1RleHQubWF0Y2goL3VybFxcKFteKV0rXFwpL2cpIHx8IFtdXG4gIGNvbnN0IGxvYWRGb250cyA9IGZvbnRMb2NzLm1hcChhc3luYyAobG9jOiBzdHJpbmcpID0+IHtcbiAgICBsZXQgdXJsID0gbG9jLnJlcGxhY2UocmVnZXhVcmwsICckMScpXG4gICAgaWYgKCF1cmwuc3RhcnRzV2l0aCgnaHR0cHM6Ly8nKSkge1xuICAgICAgdXJsID0gbmV3IFVSTCh1cmwsIGRhdGEudXJsKS5ocmVmXG4gICAgfVxuXG4gICAgcmV0dXJuIGZldGNoQXNEYXRhVVJMPFtzdHJpbmcsIHN0cmluZ10+KFxuICAgICAgdXJsLFxuICAgICAgb3B0aW9ucy5mZXRjaFJlcXVlc3RJbml0LFxuICAgICAgKHsgcmVzdWx0IH0pID0+IHtcbiAgICAgICAgY3NzVGV4dCA9IGNzc1RleHQucmVwbGFjZShsb2MsIGB1cmwoJHtyZXN1bHR9KWApXG4gICAgICAgIHJldHVybiBbbG9jLCByZXN1bHRdXG4gICAgICB9LFxuICAgIClcbiAgfSlcblxuICByZXR1cm4gUHJvbWlzZS5hbGwobG9hZEZvbnRzKS50aGVuKCgpID0+IGNzc1RleHQpXG59XG5cbmZ1bmN0aW9uIHBhcnNlQ1NTKHNvdXJjZTogc3RyaW5nKSB7XG4gIGlmIChzb3VyY2UgPT0gbnVsbCkge1xuICAgIHJldHVybiBbXVxuICB9XG5cbiAgY29uc3QgcmVzdWx0OiBzdHJpbmdbXSA9IFtdXG4gIGNvbnN0IGNvbW1lbnRzUmVnZXggPSAvKFxcL1xcKltcXHNcXFNdKj9cXCpcXC8pL2dpXG4gIC8vIHN0cmlwIG91dCBjb21tZW50c1xuICBsZXQgY3NzVGV4dCA9IHNvdXJjZS5yZXBsYWNlKGNvbW1lbnRzUmVnZXgsICcnKVxuXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItcmVnZXgtbGl0ZXJhbHNcbiAgY29uc3Qga2V5ZnJhbWVzUmVnZXggPSBuZXcgUmVnRXhwKFxuICAgICcoKEAuKj9rZXlmcmFtZXMgW1xcXFxzXFxcXFNdKj8peyhbXFxcXHNcXFxcU10qP31cXFxccyo/KX0pJyxcbiAgICAnZ2knLFxuICApXG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGNvbnN0IG1hdGNoZXMgPSBrZXlmcmFtZXNSZWdleC5leGVjKGNzc1RleHQpXG4gICAgaWYgKG1hdGNoZXMgPT09IG51bGwpIHtcbiAgICAgIGJyZWFrXG4gICAgfVxuICAgIHJlc3VsdC5wdXNoKG1hdGNoZXNbMF0pXG4gIH1cbiAgY3NzVGV4dCA9IGNzc1RleHQucmVwbGFjZShrZXlmcmFtZXNSZWdleCwgJycpXG5cbiAgY29uc3QgaW1wb3J0UmVnZXggPSAvQGltcG9ydFtcXHNcXFNdKj91cmxcXChbXildKlxcKVtcXHNcXFNdKj87L2dpXG4gIC8vIHRvIG1hdGNoIGNzcyAmIG1lZGlhIHF1ZXJpZXMgdG9nZXRoZXJcbiAgY29uc3QgY29tYmluZWRDU1NSZWdleCA9XG4gICAgJygoXFxcXHMqPyg/OlxcXFwvXFxcXCpbXFxcXHNcXFxcU10qP1xcXFwqXFxcXC8pP1xcXFxzKj9AbWVkaWFbXFxcXHNcXFxcU10nICtcbiAgICAnKj8peyhbXFxcXHNcXFxcU10qPyl9XFxcXHMqP30pfCgoW1xcXFxzXFxcXFNdKj8peyhbXFxcXHNcXFxcU10qPyl9KSdcbiAgLy8gdW5pZmllZCByZWdleFxuICBjb25zdCB1bmlmaWVkUmVnZXggPSBuZXcgUmVnRXhwKGNvbWJpbmVkQ1NTUmVnZXgsICdnaScpXG5cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIGxldCBtYXRjaGVzID0gaW1wb3J0UmVnZXguZXhlYyhjc3NUZXh0KVxuICAgIGlmIChtYXRjaGVzID09PSBudWxsKSB7XG4gICAgICBtYXRjaGVzID0gdW5pZmllZFJlZ2V4LmV4ZWMoY3NzVGV4dClcbiAgICAgIGlmIChtYXRjaGVzID09PSBudWxsKSB7XG4gICAgICAgIGJyZWFrXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbXBvcnRSZWdleC5sYXN0SW5kZXggPSB1bmlmaWVkUmVnZXgubGFzdEluZGV4XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHVuaWZpZWRSZWdleC5sYXN0SW5kZXggPSBpbXBvcnRSZWdleC5sYXN0SW5kZXhcbiAgICB9XG4gICAgcmVzdWx0LnB1c2gobWF0Y2hlc1swXSlcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0Q1NTUnVsZXMoXG4gIHN0eWxlU2hlZXRzOiBDU1NTdHlsZVNoZWV0W10sXG4gIG9wdGlvbnM6IE9wdGlvbnMsXG4pOiBQcm9taXNlPENTU1N0eWxlUnVsZVtdPiB7XG4gIGNvbnN0IHJldDogQ1NTU3R5bGVSdWxlW10gPSBbXVxuICBjb25zdCBkZWZlcnJlZHM6IFByb21pc2U8bnVtYmVyIHwgdm9pZD5bXSA9IFtdXG5cbiAgLy8gRmlyc3QgbG9vcCBpbmxpbmVzIGltcG9ydHNcbiAgc3R5bGVTaGVldHMuZm9yRWFjaCgoc2hlZXQpID0+IHtcbiAgICBpZiAoJ2Nzc1J1bGVzJyBpbiBzaGVldCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdG9BcnJheTxDU1NSdWxlPihzaGVldC5jc3NSdWxlcyB8fCBbXSkuZm9yRWFjaCgoaXRlbSwgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoaXRlbS50eXBlID09PSBDU1NSdWxlLklNUE9SVF9SVUxFKSB7XG4gICAgICAgICAgICBsZXQgaW1wb3J0SW5kZXggPSBpbmRleCArIDFcbiAgICAgICAgICAgIGNvbnN0IHVybCA9IChpdGVtIGFzIENTU0ltcG9ydFJ1bGUpLmhyZWZcbiAgICAgICAgICAgIGNvbnN0IGRlZmVycmVkID0gZmV0Y2hDU1ModXJsLCBvcHRpb25zKVxuICAgICAgICAgICAgICAudGhlbigobWV0YWRhdGEpID0+IGVtYmVkRm9udHMobWV0YWRhdGEsIG9wdGlvbnMpKVxuICAgICAgICAgICAgICAudGhlbigoY3NzVGV4dCkgPT5cbiAgICAgICAgICAgICAgICBwYXJzZUNTUyhjc3NUZXh0KS5mb3JFYWNoKChydWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBzaGVldC5pbnNlcnRSdWxlKFxuICAgICAgICAgICAgICAgICAgICAgIHJ1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgcnVsZS5zdGFydHNXaXRoKCdAaW1wb3J0JylcbiAgICAgICAgICAgICAgICAgICAgICAgID8gKGltcG9ydEluZGV4ICs9IDEpXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHNoZWV0LmNzc1J1bGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29uc29sZUxvZykge1xuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGluc2VydGluZyBydWxlIGZyb20gcmVtb3RlIGNzcycsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcixcbiAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgLmNhdGNoKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY29uc29sZUxvZykge1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgbG9hZGluZyByZW1vdGUgY3NzJywgZS50b1N0cmluZygpKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgZGVmZXJyZWRzLnB1c2goZGVmZXJyZWQpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zdCBpbmxpbmUgPVxuICAgICAgICAgIHN0eWxlU2hlZXRzLmZpbmQoKGEpID0+IGEuaHJlZiA9PSBudWxsKSB8fCBkb2N1bWVudC5zdHlsZVNoZWV0c1swXVxuICAgICAgICBpZiAoc2hlZXQuaHJlZiAhPSBudWxsKSB7XG4gICAgICAgICAgZGVmZXJyZWRzLnB1c2goXG4gICAgICAgICAgICBmZXRjaENTUyhzaGVldC5ocmVmLCBvcHRpb25zKVxuICAgICAgICAgICAgICAudGhlbigobWV0YWRhdGEpID0+IGVtYmVkRm9udHMobWV0YWRhdGEsIG9wdGlvbnMpKVxuICAgICAgICAgICAgICAudGhlbigoY3NzVGV4dCkgPT5cbiAgICAgICAgICAgICAgICBwYXJzZUNTUyhjc3NUZXh0KS5mb3JFYWNoKChydWxlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpbmxpbmUuaW5zZXJ0UnVsZShydWxlLCBzaGVldC5jc3NSdWxlcy5sZW5ndGgpXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5jb25zb2xlTG9nKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgICAgICAgICAnRXJyb3IgbG9hZGluZyByZW1vdGUgc3R5bGVzaGVldCcsXG4gICAgICAgICAgICAgICAgICAgIGVyci50b1N0cmluZygpLFxuICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmNvbnNvbGVMb2cpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBpbmxpbmluZyByZW1vdGUgY3NzIGZpbGUnLCBlLnRvU3RyaW5nKCkpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0pXG5cbiAgcmV0dXJuIFByb21pc2UuYWxsKGRlZmVycmVkcykudGhlbigoKSA9PiB7XG4gICAgLy8gU2Vjb25kIGxvb3AgcGFyc2VzIHJ1bGVzXG4gICAgc3R5bGVTaGVldHMuZm9yRWFjaCgoc2hlZXQpID0+IHtcbiAgICAgIGlmICgnY3NzUnVsZXMnIGluIHNoZWV0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdG9BcnJheTxDU1NTdHlsZVJ1bGU+KHNoZWV0LmNzc1J1bGVzIHx8IFtdKS5mb3JFYWNoKChpdGVtKSA9PiB7XG4gICAgICAgICAgICByZXQucHVzaChpdGVtKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBpZiAob3B0aW9ucy5jb25zb2xlTG9nKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFxuICAgICAgICAgICAgICBgRXJyb3Igd2hpbGUgcmVhZGluZyBDU1MgcnVsZXMgZnJvbSAke3NoZWV0LmhyZWZ9YCxcbiAgICAgICAgICAgICAgZS50b1N0cmluZygpLFxuICAgICAgICAgICAgKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gcmV0XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGdldFdlYkZvbnRSdWxlcyhjc3NSdWxlczogQ1NTU3R5bGVSdWxlW10pOiBDU1NTdHlsZVJ1bGVbXSB7XG4gIHJldHVybiBjc3NSdWxlc1xuICAgIC5maWx0ZXIoKHJ1bGUpID0+IHJ1bGUudHlwZSA9PT0gQ1NTUnVsZS5GT05UX0ZBQ0VfUlVMRSlcbiAgICAuZmlsdGVyKChydWxlKSA9PiBzaG91bGRFbWJlZChydWxlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ3NyYycpKSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gcGFyc2VXZWJGb250UnVsZXM8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgbm9kZTogVCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbikge1xuICBpZiAobm9kZS5vd25lckRvY3VtZW50ID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Byb3ZpZGVkIGVsZW1lbnQgaXMgbm90IHdpdGhpbiBhIERvY3VtZW50JylcbiAgfVxuXG4gIGNvbnN0IHN0eWxlU2hlZXRzID0gdG9BcnJheTxDU1NTdHlsZVNoZWV0Pihub2RlLm93bmVyRG9jdW1lbnQuc3R5bGVTaGVldHMpXG4gIGNvbnN0IGNzc1J1bGVzID0gYXdhaXQgZ2V0Q1NTUnVsZXMoc3R5bGVTaGVldHMsIG9wdGlvbnMpXG5cbiAgcmV0dXJuIGdldFdlYkZvbnRSdWxlcyhjc3NSdWxlcylcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFdlYkZvbnRDU1M8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgbm9kZTogVCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIGNvbnN0IHJ1bGVzID0gYXdhaXQgcGFyc2VXZWJGb250UnVsZXMobm9kZSwgb3B0aW9ucylcbiAgY29uc3QgY3NzVGV4dHMgPSBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBydWxlcy5tYXAoKHJ1bGUpID0+IHtcbiAgICAgIGNvbnN0IGJhc2VVcmwgPSBydWxlLnBhcmVudFN0eWxlU2hlZXQgPyBydWxlLnBhcmVudFN0eWxlU2hlZXQuaHJlZiA6IG51bGxcbiAgICAgIHJldHVybiBlbWJlZFJlc291cmNlcyhydWxlLmNzc1RleHQsIGJhc2VVcmwsIG9wdGlvbnMpXG4gICAgfSksXG4gIClcblxuICByZXR1cm4gY3NzVGV4dHMuam9pbignXFxuJylcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVtYmVkV2ViRm9udHM8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgY2xvbmVkTm9kZTogVCxcbiAgb3B0aW9uczogT3B0aW9ucyxcbikge1xuICBjb25zdCBjc3NUZXh0ID1cbiAgICBvcHRpb25zLmZvbnRFbWJlZENTUyAhPSBudWxsXG4gICAgICA/IG9wdGlvbnMuZm9udEVtYmVkQ1NTXG4gICAgICA6IG9wdGlvbnMuc2tpcEZvbnRzXG4gICAgICA/IG51bGxcbiAgICAgIDogYXdhaXQgZ2V0V2ViRm9udENTUyhjbG9uZWROb2RlLCBvcHRpb25zKVxuXG4gIGlmIChjc3NUZXh0KSB7XG4gICAgY29uc3Qgc3R5bGVOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKVxuICAgIGNvbnN0IHN5dGxlQ29udGVudCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNzc1RleHQpXG5cbiAgICBzdHlsZU5vZGUuYXBwZW5kQ2hpbGQoc3l0bGVDb250ZW50KVxuXG4gICAgaWYgKGNsb25lZE5vZGUuZmlyc3RDaGlsZCkge1xuICAgICAgY2xvbmVkTm9kZS5pbnNlcnRCZWZvcmUoc3R5bGVOb2RlLCBjbG9uZWROb2RlLmZpcnN0Q2hpbGQpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNsb25lZE5vZGUuYXBwZW5kQ2hpbGQoc3R5bGVOb2RlKVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHsgT3B0aW9ucyB9IGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyBjbG9uZU5vZGUgfSBmcm9tICcuL2Nsb25lLW5vZGUnXG5pbXBvcnQgeyBlbWJlZEltYWdlcyB9IGZyb20gJy4vZW1iZWQtaW1hZ2VzJ1xuaW1wb3J0IHsgYXBwbHlTdHlsZSB9IGZyb20gJy4vYXBwbHktc3R5bGUnXG5pbXBvcnQgeyBlbWJlZFdlYkZvbnRzLCBnZXRXZWJGb250Q1NTIH0gZnJvbSAnLi9lbWJlZC13ZWJmb250cydcbmltcG9ydCB7XG4gIGdldEltYWdlU2l6ZSxcbiAgZ2V0UGl4ZWxSYXRpbyxcbiAgY3JlYXRlSW1hZ2UsXG4gIGNhbnZhc1RvQmxvYixcbiAgbm9kZVRvRGF0YVVSTCxcbiAgY2hlY2tDYW52YXNEaW1lbnNpb25zLFxufSBmcm9tICcuL3V0aWwnXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b1N2ZzxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KFxuICBub2RlOiBULFxuICBvcHRpb25zOiBPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCB7IHdpZHRoLCBoZWlnaHQgfSA9IGdldEltYWdlU2l6ZShub2RlLCBvcHRpb25zKVxuICBjb25zdCBjbG9uZWROb2RlID0gKGF3YWl0IGNsb25lTm9kZShub2RlLCBvcHRpb25zLCB0cnVlKSkgYXMgSFRNTEVsZW1lbnRcbiAgYXdhaXQgZW1iZWRXZWJGb250cyhjbG9uZWROb2RlLCBvcHRpb25zKVxuICBhd2FpdCBlbWJlZEltYWdlcyhjbG9uZWROb2RlLCBvcHRpb25zKVxuICBhcHBseVN0eWxlKGNsb25lZE5vZGUsIG9wdGlvbnMpXG4gIGNvbnN0IGRhdGF1cmkgPSBhd2FpdCBub2RlVG9EYXRhVVJMKGNsb25lZE5vZGUsIHdpZHRoLCBoZWlnaHQpXG4gIHJldHVybiBkYXRhdXJpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b0NhbnZhczxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KFxuICBub2RlOiBULFxuICBvcHRpb25zOiBPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPEhUTUxDYW52YXNFbGVtZW50PiB7XG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gZ2V0SW1hZ2VTaXplKG5vZGUsIG9wdGlvbnMpXG4gIGNvbnN0IHN2ZyA9IGF3YWl0IHRvU3ZnKG5vZGUsIG9wdGlvbnMpXG4gIGNvbnN0IGltZyA9IGF3YWl0IGNyZWF0ZUltYWdlKHN2ZylcblxuICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKVxuICBjb25zdCBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJykhXG4gIGNvbnN0IHJhdGlvID0gb3B0aW9ucy5waXhlbFJhdGlvIHx8IGdldFBpeGVsUmF0aW8oKVxuICBjb25zdCBjYW52YXNXaWR0aCA9IG9wdGlvbnMuY2FudmFzV2lkdGggfHwgd2lkdGhcbiAgY29uc3QgY2FudmFzSGVpZ2h0ID0gb3B0aW9ucy5jYW52YXNIZWlnaHQgfHwgaGVpZ2h0XG5cbiAgY2FudmFzLndpZHRoID0gY2FudmFzV2lkdGggKiByYXRpb1xuICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzSGVpZ2h0ICogcmF0aW9cblxuICBpZiAoIW9wdGlvbnMuc2tpcEF1dG9TY2FsZSkge1xuICAgIGNoZWNrQ2FudmFzRGltZW5zaW9ucyhjYW52YXMpXG4gIH1cbiAgY2FudmFzLnN0eWxlLndpZHRoID0gYCR7Y2FudmFzV2lkdGh9YFxuICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gYCR7Y2FudmFzSGVpZ2h0fWBcblxuICBpZiAob3B0aW9ucy5iYWNrZ3JvdW5kQ29sb3IpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IG9wdGlvbnMuYmFja2dyb3VuZENvbG9yXG4gICAgY29udGV4dC5maWxsUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpXG4gIH1cblxuICBjb250ZXh0LmRyYXdJbWFnZShpbWcsIDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodClcblxuICByZXR1cm4gY2FudmFzXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b1BpeGVsRGF0YTxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KFxuICBub2RlOiBULFxuICBvcHRpb25zOiBPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPFVpbnQ4Q2xhbXBlZEFycmF5PiB7XG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gZ2V0SW1hZ2VTaXplKG5vZGUsIG9wdGlvbnMpXG4gIGNvbnN0IGNhbnZhcyA9IGF3YWl0IHRvQ2FudmFzKG5vZGUsIG9wdGlvbnMpXG4gIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpIVxuICByZXR1cm4gY3R4LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KS5kYXRhXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b1BuZzxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KFxuICBub2RlOiBULFxuICBvcHRpb25zOiBPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBjYW52YXMgPSBhd2FpdCB0b0NhbnZhcyhub2RlLCBvcHRpb25zKVxuICByZXR1cm4gY2FudmFzLnRvRGF0YVVSTCgpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b0pwZWc8VCBleHRlbmRzIEhUTUxFbGVtZW50PihcbiAgbm9kZTogVCxcbiAgb3B0aW9uczogT3B0aW9ucyA9IHt9LFxuKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgY29uc3QgY2FudmFzID0gYXdhaXQgdG9DYW52YXMobm9kZSwgb3B0aW9ucylcbiAgcmV0dXJuIGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL2pwZWcnLCBvcHRpb25zLnF1YWxpdHkgfHwgMSlcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHRvQmxvYjxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KFxuICBub2RlOiBULFxuICBvcHRpb25zOiBPcHRpb25zID0ge30sXG4pOiBQcm9taXNlPEJsb2IgfCBudWxsPiB7XG4gIGNvbnN0IGNhbnZhcyA9IGF3YWl0IHRvQ2FudmFzKG5vZGUsIG9wdGlvbnMpXG4gIGNvbnN0IGJsb2IgPSBhd2FpdCBjYW52YXNUb0Jsb2IoY2FudmFzKVxuICByZXR1cm4gYmxvYlxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0Rm9udEVtYmVkQ1NTPFQgZXh0ZW5kcyBIVE1MRWxlbWVudD4oXG4gIG5vZGU6IFQsXG4gIG9wdGlvbnM6IE9wdGlvbnMgPSB7fSxcbik6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBnZXRXZWJGb250Q1NTKG5vZGUsIG9wdGlvbnMpXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0lBQUE7SUFDQTtBQUNBO0lBQ0E7SUFDQTtBQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtBQXVEQTtJQUNPLFNBQVMsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRTtJQUM3RCxJQUFJLFNBQVMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLE9BQU8sS0FBSyxZQUFZLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsVUFBVSxPQUFPLEVBQUUsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtJQUNoSCxJQUFJLE9BQU8sS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLE9BQU8sQ0FBQyxFQUFFLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtJQUMvRCxRQUFRLFNBQVMsU0FBUyxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDbkcsUUFBUSxTQUFTLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7SUFDdEcsUUFBUSxTQUFTLElBQUksQ0FBQyxNQUFNLEVBQUUsRUFBRSxNQUFNLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLEVBQUU7SUFDdEgsUUFBUSxJQUFJLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsVUFBVSxJQUFJLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7SUFDOUUsS0FBSyxDQUFDLENBQUM7SUFDUCxDQUFDO0FBQ0Q7SUFDTyxTQUFTLFdBQVcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFO0lBQzNDLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNySCxJQUFJLE9BQU8sQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPLE1BQU0sS0FBSyxVQUFVLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxXQUFXLEVBQUUsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzdKLElBQUksU0FBUyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDdEUsSUFBSSxTQUFTLElBQUksQ0FBQyxFQUFFLEVBQUU7SUFDdEIsUUFBUSxJQUFJLENBQUMsRUFBRSxNQUFNLElBQUksU0FBUyxDQUFDLGlDQUFpQyxDQUFDLENBQUM7SUFDdEUsUUFBUSxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSTtJQUN0RCxZQUFZLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pLLFlBQVksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUNwRCxZQUFZLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QixnQkFBZ0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTTtJQUM5QyxnQkFBZ0IsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsT0FBTyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxDQUFDO0lBQ3hFLGdCQUFnQixLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTO0lBQ2pFLGdCQUFnQixLQUFLLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxTQUFTO0lBQ2pFLGdCQUFnQjtJQUNoQixvQkFBb0IsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRTtJQUNoSSxvQkFBb0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRTtJQUMxRyxvQkFBb0IsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FB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
