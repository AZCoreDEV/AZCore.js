/**
 * NAME: AZCore
 * DESCRIPTION: AZCore JavaScript FrameWork Designed To Simplify Development.
 * VERSION: v0.0.0
 * AUTHOR: Rivan Morin
 * CONTACT: rivanmorin@azcore.dev
 * WEBSITE: https://azcore.dev
 * GITHUB: https://github.com/AZCoreDEV/AZCore.js
 * LICENSE: MIT LICENSE
 */
(function(GLOBAL, FACTORY) {
        if (typeof module === 'object' && typeof module.exports === 'object') {
                module.exports = FACTORY();
        } else if (typeof define === 'function' && define.amd) {
                define([], FACTORY);
        } else {
                GLOBAL.AZC = FACTORY();
                GLOBAL.AZC$ = FACTORY();
                GLOBAL.AZCore = FACTORY();
                GLOBAL.AZE = FACTORY().AZElement;
                GLOBAL.AZE$ = FACTORY().AZElement;
                GLOBAL.AZElement = FACTORY().AZElement;
                GLOBAL.AZF = FACTORY().AZFragment;
                GLOBAL.AZF$ = FACTORY().AZFragment;
                GLOBAL.AZFragment = FACTORY().AZFragment;
                GLOBAL.AZP = FACTORY().AZProgress;
                GLOBAL.AZP$ = FACTORY().AZProgress;
                GLOBAL.AZProgress = FACTORY().AZProgress;
                GLOBAL.AZR = FACTORY().AZRouter;
                GLOBAL.AZR$ = FACTORY().AZRouter;
                GLOBAL.AZRouter = FACTORY().AZRouter;
        }
})(typeof window !== 'undefined' ? window : this, function() {
        /**
         * AZElement : Creates a DOM element with specified attributes, text content, and children.
         *
         * @param {string} tag
         * @param {Object} [attributes={}]
         * @param {string} [attributes.className]
         * @param {Object} [attributes.style]
         * @param {Object} [attributes.dataset]
         * @param {Function} [attributes.on<EventName>]
         * @param {string} [attributes.innerHTML]
         * @param {any} [attributes.<attributeName>] 
         * @param {string} [textContent='']
         * @param {Array<string|Node|Object>} [children=[]]
         * @param {boolean} [isSVG=false]
         * @returns {HTMLElement|SVGElement}
         * @throws {Error}
         * @throws {Error}
         */
        function AZElement(tag, attributes = {}, textContent = '', children = [], isSVG = false) {
                if (typeof tag !== 'string' || !tag.trim()) {
                        throw new Error('INVALID OR EMPTY TAG NAME PROVIDED.');
                }
                const namespace = 'http://www.w3.org/2000/svg';
                const element = isSVG ? document.createElementNS(namespace, tag) : document.createElement(tag);
                for (const [key, value] of Object.entries(attributes)) {
                        if (key === 'className') element.className = value;
                        else if (key === 'style' && typeof value === 'object') Object.assign(element.style, value);
                        else if (key.startsWith('on') && typeof value === 'function') element.addEventListener(key.slice(2).toLowerCase(), value);
                        else if (key === 'dataset' && typeof value === 'object') Object.entries(value).forEach(([k, v]) => (element.dataset[k] = v));
                        else if (key === 'innerHTML') element.innerHTML = value;
                        else if (value !== undefined && value !== null) element.setAttribute(key, value);
                }
                if (textContent && !attributes.innerHTML) element.textContent = textContent;
                children.forEach(child => {
                        if (typeof child === 'string') element.appendChild(document.createTextNode(child));
                        else if (child instanceof Node) element.appendChild(child);
                        else if (typeof child === 'object' && child.tag) element.appendChild(AZElement(child.tag, child.attributes, child.textContent, child.children, child.isSVG));
                        else throw new Error('INVALID CHILD ELEMENT PROVIDED.');
                });
                return element;
        }
        /**
         * AZFragment : Creates a `DocumentFragment` containing the specified child nodes or elements.
         *
         * @param {(Node | string | { tag: string, attributes?: object, textContent?: string, children?: Array, isSVG?: boolean })[]} children
         * @returns {DocumentFragment}
         * @throws {Error}
         */
        function AZFragment(children = []) {
                const fragment = document.createDocumentFragment();
                children.forEach(child => {
                        if (child instanceof Node) fragment.appendChild(child);
                        else if (typeof child === 'string') fragment.appendChild(document.createTextNode(child));
                        else if (typeof child === 'object' && child.tag) fragment.appendChild(AZElement(child.tag, child.attributes, child.textContent, child.children, child.isSVG));
                        else throw new Error('INVALID CHILD PROVIDED.');
                });
                return fragment;
        }
        /**
         * AZState : Creates a state manager with built-in features for subscribing to state changes...
         *
         * @param {Object} [initialState={}]
         * @returns {Object}
         */
        function AZState(initialState = {}) {
                let state = { ...initialState };
                const actions = {};
                const listeners = new Set();
                function getState() {
                        return { ...state };
                }
                function setState(updater) {
                        const prevState = { ...state };
                        let newState = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
                        
                        if (JSON.stringify(newState) !== JSON.stringify(prevState)) {
                                state = newState;
                                listeners.forEach(listener => listener(state)); // Notify subscribers
                        }
                }
                async function dispatch(actionNameOrFunction, ...args) {
                        if (typeof actionNameOrFunction === "function") {
                                // Direct function dispatch
                                return await actionNameOrFunction({ getState, setState, dispatch }, ...args);
                        } else if (typeof actionNameOrFunction === "string" && actions[actionNameOrFunction]) {
                                // Named action dispatch
                                return await actions[actionNameOrFunction]({ getState, setState, dispatch }, ...args);
                        } else {
                                throw new Error(`DISPATCH ERROR: Invalid action "${actionNameOrFunction}".`);
                        }
                }
                function subscribe(listener) {
                        if (typeof listener !== 'function') {
                                throw new Error("SUBSCRIBE REQUIRES A FUNCTION.");
                        }
                        listeners.add(listener);
                        return () => listeners.delete(listener); // Return unsubscribe function
                }
                function register(actionName, actionFunction) {
                        if (typeof actionName !== "string" || typeof actionFunction !== "function") {
                                throw new Error("REGISTER ACTION REQUIRES A STRING NAME AND FUNCTION.");
                        }
                        actions[actionName] = actionFunction;
                }
                return {
                        getState,
                        setState,
                        dispatch,
                        subscribe,
                        register
                        
                };
        }
        /**
         * diffAndPatch : Incrementally updates the DOM using a diffing algorithm.
         * 
         * @param {HTMLElement} parent
         * @param {Node} oldNode
         * @param {Node} newNode
         * @param {Array} [preserve]
         */
        function diffAndPatch(parent, oldNode, newNode, preserve = []) {
                if (!oldNode) {
                        parent.appendChild(newNode);
                        return;
                }
                if (!newNode) {
                        if (!preserve.some(selector => oldNode.matches?.(selector))) {
                                parent.removeChild(oldNode);
                        }
                        return;
                }
                // **Preserve Global Elements**
                if (preserve.some(selector => oldNode.matches?.(selector))) {
                        if (!parent.contains(oldNode)) {
                                parent.appendChild(oldNode);
                        }
                        return;
                }
                // **Replace Node If It’s Completely Different**
                if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
                        parent.replaceChild(newNode, oldNode);
                        return;
                }
                // **Update Text Nodes If Needed**
                if (oldNode.nodeType === Node.TEXT_NODE) {
                        if (oldNode.textContent !== newNode.textContent) {
                                oldNode.textContent = newNode.textContent;
                        }
                        return;
                }
                // **Handle Element Nodes**
                if (oldNode.nodeType === Node.ELEMENT_NODE) {
                        // **Efficient Attribute Updates**
                        const oldAttrs = oldNode.attributes;
                        const newAttrs = newNode.attributes;
                        // Update existing attributes & add new ones
                        for (const { name, value } of newAttrs) {
                                if (oldNode.getAttribute(name) !== value) {
                                        oldNode.setAttribute(name, value);
                                }
                        }
                        // Remove attributes that no longer exist
                        for (const { name } of [...oldAttrs]) {
                                if (!newNode.hasAttribute(name)) {
                                        oldNode.removeAttribute(name);
                                }
                        }
                        // **Boolean Attributes (checked, disabled, etc.)**
                        ['checked', 'disabled', 'selected'].forEach(attr => {
                                oldNode[attr] = newNode.hasAttribute(attr);
                        });
                        // **Efficient Child Diffing**
                        const oldChildren = Array.from(oldNode.childNodes);
                        const newChildren = Array.from(newNode.childNodes);
                        let oldIndex = 0, newIndex = 0;
                        while (oldIndex < oldChildren.length || newIndex < newChildren.length) {
                                const oldChild = oldChildren[oldIndex];
                                const newChild = newChildren[newIndex];
                                // If there's no old child, append the new child
                                if (!oldChild) {
                                        oldNode.appendChild(newChild);
                                        newIndex++;
                                        continue;
                                }
                                // If there's no new child, remove the old one (unless preserved)
                                if (!newChild) {
                                        if (!preserve.some(selector => oldChild.matches?.(selector))) {
                                                oldNode.removeChild(oldChild);
                                        }
                                        oldIndex++;
                                        continue;
                                }
                                // **Preserve Global Elements**
                                if (preserve.some(selector => oldChild.matches?.(selector))) {
                                        oldIndex++;
                                        continue;
                                }
                                // **If Nodes Are Similar, Diff Their Contents**
                                if (oldChild.nodeType === newChild.nodeType && oldChild.nodeName === newChild.nodeName) {
                                        diffAndPatch(oldNode, oldChild, newChild, preserve);
                                        oldIndex++;
                                        newIndex++;
                                        continue;
                                }
                                // **Else, Replace The Old Child with The New One**
                                oldNode.replaceChild(newChild, oldChild);
                                oldIndex++;
                                newIndex++;
                        }
                }
        }
        async function onAFFIX(AFFIX, PARAMS) {
                try {
                        // Resolve promises
                        if (AFFIX instanceof Promise) {
                                AFFIX = await AFFIX;
                        }
                        // Return directly if it's a DOM element
                        if (AFFIX instanceof Element || AFFIX instanceof SVGElement) {
                                return AFFIX;
                        }
                        // Handle functions
                        if (typeof AFFIX === 'function') {
                                return onAFFIX(await AFFIX(PARAMS), PARAMS);
                        }
                        // Handle objects and arrays recursively
                        if (typeof AFFIX === 'object' && AFFIX !== null) {
                                const RESULT = Array.isArray(AFFIX) ? [] : {};
                                for (const KEY in AFFIX) {
                                        if (Object.prototype.hasOwnProperty.call(AFFIX, KEY)) {
                                                RESULT[KEY] = await onAFFIX(AFFIX[KEY], PARAMS);
                                        }
                                }
                                return RESULT;
                        }
                        return AFFIX;
                } catch (ERROR) {
                        console.error('ERROR:', ERROR);
                }
        }
        /**
         * AZProgress : visible work perimeter...
         */
        class AZProgress {
                static settings = {
                        minimum: 0.08,
                        easing: 'ease',
                        positionUsing: '',
                        speed: 200,
                        trickle: true,
                        trickleRate: 0.02,
                        trickleSpeed: 800,
                        showSpinner: true,
                        barSelector: '[role="bar"]',
                        spinnerSelector: '[role="spinner"]',
                        parent: 'body',
                        template: `<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>`,
                };
                static status = null;
                static configure(options = {}) {
                        Object.assign(this.settings, options);
                        return this;
                }
                static set(n) {
                        const started = this.isStarted();
                        n = this._clamp(n, this.settings.minimum, 1);
                        this.status = n === 1 ? null : n;
                        const progress = this._render(!started);
                        const bar = progress.querySelector(this.settings.barSelector);
                        const { speed, easing } = this.settings;
                        requestAnimationFrame(() => {
                                this._applyStyles(bar, this._barPositionCSS(n, speed, easing));
                                if (n === 1) {
                                        setTimeout(() => {
                                                this._applyStyles(progress, { opacity: 0 });
                                                setTimeout(() => {
                                                        this.remove();
                                                }, speed);
                                        }, speed);
                                }
                        });
                        return this;
                }
                static isStarted() {
                        return typeof this.status === 'number';
                }
                static start() {
                        if (!this.status) this.set(0);
                        if (this.settings.trickle) {
                                const trickleLoop = () => {
                                        if (!this.status) return;
                                        this.trickle();
                                        setTimeout(trickleLoop, this.settings.trickleSpeed);
                                };
                                trickleLoop();
                        }
                        return this;
                }
                static done(force = false) {
                        if (!force && !this.status) return this;
                        return this.inc(0.3 + 0.5 * Math.random()).set(1);
                }
                static inc(amount) {
                        let { status } = AZProgress;
                        if (!status) return this.start();
                        if (typeof amount !== 'number') {
                                amount = (1 - status) * this._clamp(Math.random() * status, 0.1, 0.95);
                        }
                        status = this._clamp(status + amount, 0, 0.994);
                        return this.set(status);
                }
                static trickle() {
                        return this.inc(Math.random() * this.settings.trickleRate);
                }
                static remove() {
                        document.documentElement.classList.remove('azprogress-busy');
                        document.querySelector(this.settings.parent)?.classList.remove('azprogress-custom-parent');
                        document.getElementById('azprogress')?.remove();
                }
                static _render(fromStart = false) {
                        if (document.getElementById('azprogress')) return document.getElementById('azprogress');
                        document.documentElement.classList.add('azprogress-busy');
                        const progress = document.createElement('div');
                        progress.id = 'azprogress';
                        progress.innerHTML = this.settings.template;
                        const bar = progress.querySelector(this.settings.barSelector);
                        this._applyStyles(bar, { transform: `translateX(${fromStart ? '-100' : this._toBarPerc(this.status || 0)}%)` });
                        if (!this.settings.showSpinner) {
                                progress.querySelector(this.settings.spinnerSelector)?.remove();
                        }
                        document.querySelector(this.settings.parent)?.appendChild(progress);
                        return progress;
                }
                static _applyStyles(element, styles) {
                        Object.assign(element.style, styles);
                }
                static _barPositionCSS(n, speed, ease) {
                        const translateValue = `${this._toBarPerc(n)}%`;
                        return {
                                transform: `translate3d(${translateValue}, 0, 0)`,transition: `all ${speed}ms ${ease}`,
                        };
                }
                static _toBarPerc(n) {
                        return (-1 + n) * 100;
                }
                static _clamp(n, min, max) {
                        return Math.max(min, Math.min(max, n));
                }
        }
        /**
         * AZRouter : Manage routes and update the document dynamically
         */
        class AZRouter {
                constructor(routes, options = {}) {
                        this.routes = routes;
                        this.onDEV = options.onDEV || 'OFF';
                        this.onAPP = options.onAPP || '#app';
                        this.onROOT = options.onROOT || '/';
                        this.on404 = options.on404 || '/404';
                        this.onMODE = options.onMODE || 'history';
                        this.onBEFORE = options.onBEFORE || [];
                        this.onERROR = {
                                META: options.onERROR?.META || 'META',
                                VIEW: options.onERROR?.VIEW?.VIEW || 'VIEW',
                                STAY: options.onERROR?.VIEW?.STAY || ['[azcore]'],
                        };
                        this.onPROGRESS = {
                                PROGRESS: options.onPROGRESS?.PROGRESS || 'ON',
                                SELECTOR: options.onPROGRESS?.SELECTOR || 'body',
                        };
                        this.onTRANSITION = {
                                IN: options.onTRANSITION?.IN || 'AZ-FADE-IN',
                                OUT: options.onTRANSITION?.OUT || 'AZ-FADE-OUT',
                                TRANSITION: options.onTRANSITION?.TRANSITION || 'ON',
                        };
                        this.onSCROLL = {
                                RESTORE: options.onSCROLL?.RESTORE || 'ON',
                                BEHAVIOR: options.onSCROLL?.BEHAVIOR || 'SMOOTH',
                                STORAGE: { x: 0, y: 0, on: '' }
                        };
                        this.onCLEAN = options.onCLEAN || 'OFF';
                        this.onPREVIOUS = {
                                AFFIXES: null,
                                PARAMS: null
                        };
                        this.init();
                }
                init() {
                        this.onDEVM();
                        this.onLINK();
                        this.onPROCESS(this.onURL());
                        window.addEventListener('popstate', () => this.onPROCESS(this.onURL()));
                }
                onDEVM() {
                        if (this.onDEV === "ON") {
                                // GLOBAL AFFIX LOG...
                                console.log('onDEV = ', this.onDEV)
                                console.log('onAPP = ', this.onAPP)
                                console.log('onROOT = ', this.onROOT)
                                console.log('on404 = ', this.on404)
                                console.log('onMODE = ', this.onMODE)
                                console.log('onBEFORE = ', this.onBEFORE)
                                console.log('onERROR = ', this.onERROR)
                                console.log('onPROGRESS = ', this.onPROGRESS)
                                console.log('onSCROLL = ', this.onSCROLL)
                                console.log('onTRANSITION = ', this.onTRANSITION)
                                console.log('onCLEAN = ', this.onCLEAN)
                        }
                }
                onLINK() {
                        document.addEventListener('click', (event) => {
                                const anchor = event.target.closest('a[href^="/"]');
                                if (anchor) {
                                        event.preventDefault();
                                        this.navigateTo(anchor.getAttribute('href'));
                                }
                        });
                }
                navigateTo(url, options = { replace: false, state: {} }) {
                        const onURL = this.onMODE === 'hash' ? '#' + url.replace(this.onROOT, '') : this.onROOT + url.replace(this.onROOT, '');
                        history[options.replace ? 'replaceState' : 'pushState'](options.state, '', onURL);
                        this.onPROCESS(onURL);
                }
                async onPROCESS(onURL) {
                        const AFFIXES = this.onMATCH(onURL) || this.navigateTo(this.on404);
                        const PARAMS = this.onPARAMS(AFFIXES.on, onURL);
                        try {
                                // RESOLVE
                                const onVIEW = await onAFFIX(AFFIXES.onVIEW, PARAMS);
                                // AFFIX: onPROGRESS START
                                await this.onPROGRESSSTART(AFFIXES?.onPROGRESS || this.onPROGRESS);
                                // AFFIX: onSCROLL STORE
                                await this.onSCROLLstore(this.onPREVIOUS?.PARAMS);
                                // AFFIX: onBEFORE
                                await this.onBEFOREX(this.onBEFORE, AFFIXES?.onBEFORE, PARAMS);
                                // AFFIX: onREDIRECT
                                await this.onREDIRECT(AFFIXES?.onREDIRECT, PARAMS);
                                // AFFIX: onLEAVE for previous one...
                                await this.onLEAVE(this.onPREVIOUS.AFFIXES?.onLEAVE, this.onPREVIOUS?.PARAMS);
                                // AFFIX: onTRANSITION OUT
                                await this.transitionOUT(this.onPREVIOUS.AFFIXES, this.onPREVIOUS.AFFIXES?.onTRANSITION || this.onPREVIOUS.AFFIXES, this.onTRANSITION);
                                // AFFIX: onVIEW RENDERER
                                await this.onRENDERER(onVIEW);
                                // AFFIXES: onTRANSITION IN
                                await this.transitionIN(onVIEW.VIEW, AFFIXES.onTRANSITION || onVIEW.VIEW, this.onTRANSITION);
                                // AFFIX: onSCROLL RESTORE
                                await this.onSCROLLY(AFFIXES.onSCROLL, PARAMS || this.onSCROLL, PARAMS);
                                // AFFIX: onPROGRESS END
                                await this.onPROGRESSEND(AFFIXES?.onPROGRESS || this.onPROGRESS);
                                // AFFIX: onLOADED
                                await this.onLOADED(AFFIXES.onLOADED, PARAMS);
                                // UPDATE: onPREVIOUS
                                this.onPREVIOUS.AFFIXES = AFFIXES, this.onPREVIOUS.PARAMS = PARAMS;
                        } catch (ERROR) {
                                console.error('onPROCESS:', ERROR);
                        }
                }
                async onBEFOREX(onBEFOREG, onBEFORER, PARAMS) {
                        if (onBEFOREG) {
                                await onAFFIX(onBEFOREG, PARAMS)
                        }
                        if (onBEFORER) {
                                await onAFFIX(onBEFORER, PARAMS)
                        }
                }
                async onREDIRECT(onREDIRECT, PARAMS) {
                        if (onREDIRECT) {
                                const onREDIRECTINFO = await onAFFIX(onREDIRECT, PARAMS);
                                const ON = onREDIRECTINFO?.ON || null;
                                const REDIRECT = onREDIRECTINFO?.REDIRECT || 'OFF';
                                if (REDIRECT === 'ON' && ON !== null) {
                                        this.navigateTo(ON);
                                }
                        }
                }
                async onPROGRESSSTART(onPROGRESS) {
                        const PROGRESS = onPROGRESS?.PROGRESS || this.onPROGRESS.PROGRESS;
                        const SELECTOR = onPROGRESS?.SELECTOR || this.onPROGRESS.SELECTOR;
                        if ('ON' === PROGRESS) {
                                AZProgress.configure({
                                        // showSpinner: false,
                                        easing: 'ease',
                                        speed: 500,
                                        trickle: true,
                                        trickleSpeed: 200
                                });
                                AZProgress.start();
                        }
                }
                async onPROGRESSEND(onPROGRESS) {
                        const PROGRESS = onPROGRESS?.PROGRESS || this.onPROGRESS.PROGRESS;
                        const SELECTOR = onPROGRESS?.SELECTOR || this.onPROGRESS.SELECTOR;
                        if ('ON' === PROGRESS) {
                                AZProgress.configure({
                                        // showSpinner: false,
                                        easing: 'ease',
                                        speed: 500,
                                        trickle: true,
                                        trickleSpeed: 200
                                });
                                AZProgress.done();
                        }
                }
                async onLOADED(onLOADED, PARAMS) {
                        if (onLOADED) {
                                await onAFFIX(onLOADED, PARAMS);
                        }
                }
                async onLEAVE(onLEAVE, PARAMS) {
                        if (onLEAVE) {
                                await onAFFIX(onLEAVE, PARAMS);
                        }
                }
                async onSCROLLstore(onPREVIOUS) {
                        if (onPREVIOUS) {
                                this.onSCROLL.STORAGE = {
                                        x: window.scrollX,
                                        y: window.scrollY,
                                        on: onPREVIOUS.on,
                                };
                        }
                }
                async onSCROLLY(onSCROLL, PARAMS) {
                        const RESTORE = onSCROLL?.RESTORE || this.onSCROLL.RESTORE;
                        const BEHAVIOR = onSCROLL?.BEHAVIOR || this.onSCROLL.BEHAVIOR;
                        if ('ON' === RESTORE) {
                                if (PARAMS.on === this.onSCROLL.STORAGE.on) {
                                        window.scrollTo({
                                                top: this.onSCROLL.STORAGE.y,
                                                left: this.onSCROLL.STORAGE.x,
                                                behavior: this.onSCROLL.BEHAVIOR.toLowerCase(),
                                        });
                                } else {
                                        window.scrollTo({ top: 0, left: 0 });
                                }
                        } else {}
                }
                transitionOUT(onPREVIOUS, onTRANSITION) {
                        if (onPREVIOUS) {
                                const OUT = onTRANSITION?.OUT || this.onTRANSITION.OUT;
                                const TRANSITION = onTRANSITION?.TRANSITION || this.onTRANSITION.TRANSITION;
                                const CONTAINER = document.querySelector(this.onAPP);
                                if ('ON' === TRANSITION) {
                                        if (CONTAINER.classList.contains(OUT)) {
                                                setTimeout(() => {
                                                        CONTAINER.classList.remove(OUT);
                                                }, 500)
                                        } else {
                                                CONTAINER.classList.add(OUT);
                                                setTimeout(() => {
                                                        CONTAINER.classList.remove(OUT);
                                                }, 500)
                                        }
                                }
                        }
                }
                onRENDERER(onVIEW) {
                        const STAY = onVIEW?.STAY || ['[azcore]'];
                        const META = onVIEW?.META || document.head;
                        diffAndPatch(document.firstElementChild, document.head, META, STAY);
                        diffAndPatch(document.body, document.querySelector(this.onAPP), onVIEW.VIEW, STAY);
                        // document.querySelector(this.onAPP).innerHTML = '';
                        // document.querySelector(this.onAPP).appendChild(onVIEW.VIEW);
                }
                transitionIN(onVIEW, onTRANSITION) {
                        const IN = onTRANSITION?.IN || this.onTRANSITION.IN;
                        const TRANSITION = onTRANSITION?.TRANSITION || this.onTRANSITION.TRANSITION;
                        const CONTAINER = document.querySelector(this.onAPP);
                        if ('ON' === TRANSITION) {
                                if (CONTAINER.classList.contains(IN)) {
                                        setTimeout(() => {
                                                CONTAINER.classList.remove(IN);
                                        }, 500)
                                } else {
                                        CONTAINER.classList.add(IN);
                                        setTimeout(() => {
                                                CONTAINER.classList.remove(IN);
                                        }, 500)
                                }
                        }
                }
                onMATCH(onURL) {
                        return this.routes.find(route => {
                                return route.on.split('/').length === onURL.split('/').length && route.on.split('/').every((seg, i) => seg.startsWith(':') || seg === onURL.split('/')[i]);
                        })
                }
                onPARAMS(on, onURL) {
                        const current = onURL.split('?')[0];
                        const queryParams = Object.fromEntries(new URLSearchParams(onURL.split('?')[1] || ''));
                        return on.split('/').reduce((result, seg, i) => {
                                if (seg.startsWith(':')) result[seg.slice(1)] = onURL.split('/')[i].split('?')[0];
                                return result;
                        }, { on: current, ...queryParams });
                }
                onURL() {
                        return this.onMODE === 'history' ? window.location.pathname + window.location.search : window.location.hash.slice(1);
                }
                go(delta) {
                        window.history.go(delta);
                }
                back() {
                        window.history.back();
                }
                forward() {
                        window.history.forward();
                }
        }
        return {
                AZElement,
                AZFragment,
                AZProgress,
                AZRouter
        };
});