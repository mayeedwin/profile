(() => {
           'use strict';
           // No point without the measurement APIs we need (or polyfills thereof).
           if (!window.performance || !window.performance.mark ||
               !window.performance.measure) {
               return;
           }
           const prefix = '[WC] ';
           function makeMeasurement(operation, tagName, counter, cb) {
               const counterSuffix = counter == null ? '' : ` ${counter}`;
               const startMark = `${prefix}start ${operation} ${tagName}${counterSuffix}`;
               const endMark = `${prefix}end ${operation} ${tagName}${counterSuffix}`;
               const measure = `${prefix}${operation} ${tagName}${counterSuffix}`;
               window.performance.mark(startMark);
               try {
                   return cb();
               }
               finally {
                   window.performance.mark(endMark);
                   window.performance.measure(measure, startMark, endMark);
               }
           }
           ;
           const idSymbol = Symbol('id');
           const originalRegisterElement = document.registerElement;
           if (originalRegisterElement) {
               const boundRegisterElement = originalRegisterElement.bind(document);
               function wrappedRegisterElement(tagName, options) {
                   const maybeProto = options.prototype;
                   if (!maybeProto) {
                       return boundRegisterElement(tagName, options);
                   }
                   const proto = maybeProto;
                   let elementCounter = 0;
                   const originalCreate = proto.createdCallback || (() => undefined);
                   /**
                    * @param name Shorthand for the CE callback.
                    * @param fullName The property name of the CE callback.
                    */
                   function wrapCustomElementCallback(name, fullName) {
                       const original = proto[fullName] || (() => undefined);
                       proto[fullName] = function () {
                           const counter = this[idSymbol];
                           return makeMeasurement(name, tagName, counter, () => original.apply(this, arguments));
                       };
                   }
                   proto.createdCallback = function () {
                       const counter = elementCounter++;
                       this[idSymbol] = counter;
                       return makeMeasurement('created', tagName, counter, () => originalCreate.apply(this));
                   };
                   wrapCustomElementCallback('connected', 'attachedCallback');
                   wrapCustomElementCallback('disconnected', 'detachedCallback');
                   wrapCustomElementCallback('attributeChanged', 'attributeChangedCallback');
                   wrapCustomElementCallback('data', '_propertySetter');
                   wrapCustomElementCallback('data', 'notifyPath');
                   return makeMeasurement('registered', tagName, null, () => boundRegisterElement(tagName, options));
               }
               document.registerElement = wrappedRegisterElement;
           }
           if (window.customElements) {
               const originalDefine = window.customElements.define;
               const boundDefine = originalDefine.bind(window.customElements);
               const counterMap = new Map();
               window['HTMLElement'] = class extends HTMLElement {
                   constructor() {
                       super();
                       const tagName = this.tagName.toLowerCase();
                       let counter = counterMap.get(tagName) || 0;
                       this[idSymbol] = counter;
                       counterMap.set(tagName, counter + 1);
                   }
               };
               function wrappedDefineElement(tagName, constructor) {
                   let proto = constructor.prototype;
                   function wrapCustomElementCallback(name, fullName) {
                       const original = proto[fullName];
                       if (!original) {
                           return;
                       }
                       proto[fullName] = function () {
                           const counter = this[idSymbol];
                           return makeMeasurement(name, tagName, counter, () => original.apply(this, arguments));
                       };
                   }
                   wrapCustomElementCallback('connected', 'connectedCallback');
                   wrapCustomElementCallback('disconnected', 'disconnectedCallback');
                   wrapCustomElementCallback('attributeChanged', 'attributeChangedCallback');
                   wrapCustomElementCallback('data', '_propertySetter');
                   wrapCustomElementCallback('data', 'notifyPath');
                   counterMap.set(tagName.toLowerCase(), 0);
                   return makeMeasurement('registered', tagName, null, () => boundDefine(tagName, constructor));
               }
               window.customElements.define = wrappedDefineElement;
           }
           //
           // Polymer-specific patching
           //
           let _Polymer;
           let _PolymerCalled = false;
           let _PolymerWrapper = function () {
               if (!_PolymerCalled) {
                   _PolymerCalled = true;
                   // TODO(rictic): when incorporating zones, will need to patch
                   //     Polymer.Async and Polymer.RenderStatus.whenReady
               }
               if (_Polymer) {
                   return _Polymer.apply(this, arguments);
               }
           };
           // replace window.Polymer with accessors so we can wrap calls to
           //     Polymer()
           Object.defineProperty(window, 'Polymer', {
               set: function (p) {
                   if (p !== _PolymerWrapper) {
                       console.timeStamp('Polymer defined');
                       _Polymer = p;
                       if (typeof p === 'function') {
                           // Overwrite this getter/setter with just the newly set value.
                           Object.defineProperty(window, 'Polymer', {
                               value: _PolymerWrapper,
                               configurable: true,
                               writable: true,
                               enumerable: true
                           });
                       }
                   }
               },
               get: function () {
                   return _Polymer;
               },
               configurable: true,
               enumerable: true
           });
           window._getElementMeasures = function getElementMeasures() {
               const rawMeasures = window.performance.getEntriesByType('measure');
               return rawMeasures.filter(m => m.name.startsWith(prefix)).map((m) => {
                   const [, operation, tagName, elementId] = m.name.split(' ');
                   return {
                       tagName,
                       operation,
                       elementId: elementId == null ? undefined : parseInt(elementId, 10),
                       duration: m.duration,
                       start: m.startTime,
                       end: m.startTime + m.duration
                   };
               });
           };
           class ElementAverage {
               constructor() {
                   this.count = 0;
                   this.durations = new Map();
               }
               record(measurement) {
                   if (!this.durations.has(measurement.tagName)) {
                       this.durations.set(measurement.tagName, new Map());
                   }
                   const k = this.durations.get(measurement.tagName);
                   if (!k.has(measurement.operation)) {
                       k.set(measurement.operation, [0, 0]);
                   }
                   const countAndTotal = k.get(measurement.operation);
                   countAndTotal[0]++;
                   countAndTotal[1] += measurement.duration;
               }
               getTable() {
                   return Array.from(this.durations.entries()).map(([tag, map]) => {
                       const result = {
                           tag,
                           register: 0,
                           'register total': 0,
                           'register avg': 0,
                           create: 0,
                           'create total': 0,
                           'create avg': 0,
                           attached: 0,
                           'attached total': 0,
                           'attached avg': 0,
                           attributeChanged: 0,
                           'attributeChanged total': 0,
                           'attributeChanged avg': 0,
                       };
                       for (let entry of map.entries()) {
                           const key = entry[0];
                           const count = entry[1][0];
                           const total = entry[1][1];
                           result[key] = count;
                           result[`${key} total`] = total;
                           result[`${key} avg`] = total / count;
                       }
                       return result;
                   });
               }
           }
           window._printElementStats = () => {
               const measures = window._getElementMeasures();
               const averager = new ElementAverage();
               for (let measure of measures) {
                   averager.record(measure);
               }
               console.table(averager.getTable());
           };
           window._summarizeRange = function (start, end, threshold = 0.5) {
               const inRange = window._getElementMeasures().filter(m => m.start >= start && m.end <= end);
               const operations = [
                   'created', 'connected', 'disconnected', 'registered', 'data',
                   'attributeChanged'
               ];
               inRange.sort((a, b) => a.duration - b.duration);
               for (let m of inRange) {
                   if (m.duration < threshold) {
                       continue;
                   }
                   console.log(`${m.operation} ${m.tagName} – ${m.duration.toFixed(2)}`);
               }
               for (let operation of operations) {
                   const duration = inRange.reduce((v, m) => v + (m.operation === operation ? m.duration : 0), 0);
                   if (duration > 1) {
                       console.log(`Total ${operation} time: ${duration.toFixed(2)}`);
                   }
               }
           };
           // Listen for requests for timing data
           window.addEventListener('message', function (event) {
               if (event.data.messageType &&
                   (event.data.messageType === 'get-element-stats' ||
                       event.data.messageType === 'clear-element-stats')) {
                   if (event.data.messageType === 'clear-element-stats') {
                       window.performance.clearMarks();
                       window.performance.clearMeasures();
                   }
                   event.source.postMessage({ messageType: 'element-stats', data: window._getElementMeasures() }, '*');
               }
           });

       })();

       