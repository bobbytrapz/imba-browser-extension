(function () {
	'use strict';

	class Flags {
		
		
		constructor(dom){
			
			this.dom = dom;
			this.string = "";
		}
		
		contains(ref){
			
			return this.dom.classList.contains(ref);
		}
		
		add(ref){
			
			if (this.contains(ref)) { return this }		this.string += (this.string ? ' ' : '') + ref;
			this.dom.classList.add(ref);
			// sync!
			return this;
		}
		
		remove(ref){
			
			if (!(this.contains(ref))) { return this }		var regex = new RegExp('(^|\\s)*' + ref + '(\\s|$)*','g');
			this.string = this.string.replace(regex,'');
			this.dom.classList.remove(ref);
			// sync!
			return this;
		}
		
		toggle(ref,bool){
			
			if (bool == undefined) { bool = !(this.contains(ref)); }		return bool ? this.add(ref) : this.remove(ref);
		}
		
		valueOf(){
			
			return this.string;
		}
		
		toString(){
			
			return this.string;
		}
		
		sync(){
			
			return this.dom.flagSync$();
		}
	}

	function iter$(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }var raf = (typeof requestAnimationFrame !== 'undefined') ? requestAnimationFrame : (function(blk) { return setTimeout(blk,1000 / 60); });

	// Scheduler
	class Scheduler {
		
		constructor(){
			var self = this;
			
			this.queue = [];
			this.stage = -1;
			this.batch = 0;
			this.scheduled = false;
			this.listeners = {};
			
			this.__ticker = function(e) {
				
				self.scheduled = false;
				return self.tick(e);
			};
		}
		
		add(item,force){
			
			if (force || this.queue.indexOf(item) == -1) {
				
				this.queue.push(item);
			}		
			if (!(this.scheduled)) { return this.schedule() }	}
		
		listen(ns,item){
			var $listeners;
			
			($listeners = this.listeners)[ns] || ($listeners[ns] = new Set());
			return this.listeners[ns].add(item);
		}
		
		unlisten(ns,item){
			
			return this.listeners[ns] && this.listeners[ns].delete(item);
		}
		
		get promise(){
			var self = this;
			
			return new Promise(function(resolve) { return self.add(resolve); });
		}
		
		tick(timestamp){
			var self = this;
			
			var items = this.queue;
			if (!(this.ts)) { this.ts = timestamp; }		this.dt = timestamp - this.ts;
			this.ts = timestamp;
			this.queue = [];
			this.stage = 1;
			this.batch++;
			
			if (items.length) {
				
				for (let i = 0, $items = iter$(items), $len = $items.length; i < $len; i++) {
					let item = $items[i];
					
					if (typeof item === 'string' && this.listeners[item]) {
						
						this.listeners[item].forEach(function(item) {
							
							if (item.tick instanceof Function) {
								
								return item.tick(self);
							} else if (item instanceof Function) {
								
								return item(self);
							}					});
					} else if (item instanceof Function) {
						
						item(this.dt,this);
					} else if (item.tick) {
						
						item.tick(this.dt,this);
					}			}		}		this.stage = 2;
			this.stage = this.scheduled ? 0 : -1;
			return this;
		}
		
		schedule(){
			
			if (!(this.scheduled)) {
				
				this.scheduled = true;
				if (this.stage == -1) {
					
					this.stage = 0;
				}			raf(this.__ticker);
			}		return this;
		}
	}

	function iter$$1(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function extend$(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}const keyCodes = {
		esc: [27],
		tab: [9],
		enter: [13],
		space: [32],
		up: [38],
		down: [40],
		left: [37],
		right: [39],
		del: [8,46]
	};



	// only for web?
	extend$(Event,{
		
		
		wait$mod(state,params){
			
			return new Promise(function(resolve) {
				
				return setTimeout(resolve,((params[0] instanceof Number) ? params[0] : 1000));
			});
		},
		
		sel$mod(state,params){
			
			return state.event.target.closest(params[0]) || false;
		},
		
		throttle$mod({handler: handler,element: element,event: event},params){
			
			if (handler.throttled) { return false }		handler.throttled = true;
			let name = params[0];
			if (!((name instanceof String))) {
				
				name = ("in-" + (event.type || 'event'));
			}		let cl = element.classList;
			cl.add(name);
			handler.once('idle',function() {
				
				cl.remove(name);
				return handler.throttled = false;
			});
			return true;
		},
	});


	// could cache similar event handlers with the same parts
	class EventHandler {
		
		constructor(params,closure){
			
			this.params = params;
			this.closure = closure;
		}
		
		getHandlerForMethod(el,name){
			
			if (!(el)) { return null }		return el[name] ? el : this.getHandlerForMethod(el.parentNode,name);
		}
		
		emit(name,...params){
			return imba.emit(this,name,params);
		}
		on(name,...params){
			return imba.listen(this,name,...params);
		}
		once(name,...params){
			return imba.once(this,name,...params);
		}
		un(name,...params){
			return imba.unlisten(this,name,...params);
		}
		
		async handleEvent(event){
			var $currentEvents;
			
			var target = event.target;
			var element = event.currentTarget;
			var mods = this.params;
			let commit = true;// self.params.length == 0
			
			let state = {
				element: element,
				event: event,
				modifiers: mods,
				handler: this
			};
			
			if (event.handle$mod) {
				
				if (event.handle$mod(state,mods.options) == false) {
					
					return;
				}		}		
			($currentEvents = this.currentEvents) || (this.currentEvents = new Set());
			this.currentEvents.add(event);
			
			for (let $i = 0, $keys = Object.keys(mods), $l = $keys.length, handler, val; $i < $l; $i++){
				handler = $keys[$i];val = mods[handler];
				// let handler = part
				if (handler[0] == '_') {
					
					continue;
				}			
				if (handler.indexOf('~') > 0) {
					
					handler = handler.split('~')[0];
				}			
				let args = [event,this];
				let res = undefined;
				let context = null;
				
				if (handler[0] == '$' && handler[1] == '_' && (val[0] instanceof Function)) {
					
					handler = val[0];
					args = [event,state].concat(val.slice(1));
					context = element;
				} else if (val instanceof Array) {
					
					args = val.slice();
					
					for (let i = 0, $items = iter$$1(args), $len = $items.length; i < $len; i++) {
						let par = $items[i];
						
						// what about fully nested arrays and objects?
						// ought to redirect this
						if (typeof par == 'string' && par[0] == '~' && par[1] == '$') {
							
							let name = par.slice(2);
							let chain = name.split('.');
							let value = state[chain.shift()] || event;
							
							for (let i = 0, $ary = iter$$1(chain), $len = $ary.length; i < $len; i++) {
								let part = $ary[i];
								
								value = value ? value[part] : undefined;
							}						
							args[i] = value;
						}				}			}			
				// console.log "handle part",i,handler,event.currentTarget
				// check if it is an array?
				if (handler == 'stop') {
					
					event.stopImmediatePropagation();
				} else if (handler == 'prevent') {
					
					event.preventDefault();
				} else if (handler == 'commit') {
					
					commit = true;
				} else if (handler == 'silence') {
					
					commit = false;
				} else if (handler == 'ctrl') {
					
					if (!(event.ctrlKey)) { break; }			} else if (handler == 'alt') {
					
					if (!(event.altKey)) { break; }			} else if (handler == 'shift') {
					
					if (!(event.shiftKey)) { break; }			} else if (handler == 'meta') {
					
					if (!(event.metaKey)) { break; }			} else if (handler == 'self') {
					
					if (target != element) { break; }			} else if (handler == 'once') {
					
					// clean up bound data as well
					element.removeEventListener(event.type,this);
				} else if (handler == 'options') {
					
					continue;
				} else if (keyCodes[handler]) {
					
					if (keyCodes[handler].indexOf(event.keyCode) < 0) {
						
						break;
					}			} else if (handler == 'trigger' || handler == 'emit') {
					
					let name = args[0];
					let detail = args[1];// is custom event if not?
					let e = new CustomEvent(name,{bubbles: true,detail: detail});// : Event.new(name)
					e.originalEvent = event;
					let customRes = element.dispatchEvent(e);
				} else if (typeof handler == 'string') {
					
					let mod = handler + '$mod';
					
					if (event[mod] instanceof Function) {
						
						// console.log "found modifier!",mod
						handler = mod;
						context = event;
						args = [state,args];
					} else if (handler[0] == '_') {
						
						handler = handler.slice(1);
						context = this.closure;
					} else {
						
						context = this.getHandlerForMethod(element,handler);
					}			}			
				if (handler instanceof Function) {
					
					res = handler.apply(context || element,args);
				} else if (context) {
					
					res = context[handler].apply(context,args);
				}			
				if (res && (res.then instanceof Function)) {
					
					if (commit) { imba.commit(); }				// TODO what if await fails?
					res = await res;
				}			
				if (res === false) {
					
					break;
				}			
				state.value = res;
			}		
			if (commit) { imba.commit(); }		this.currentEvents.delete(event);
			if (this.currentEvents.size == 0) {
				
				this.emit('idle');
			}		// what if the result is a promise
			return;
		}
	}

	var {Document: Document,Node: Node$1,Text: Text$1,Comment: Comment$1,Element: Element$1,SVGElement: SVGElement,HTMLElement: HTMLElement,DocumentFragment: DocumentFragment,ShadowRoot: ShadowRoot$1,Event: Event$1,CustomEvent: CustomEvent$1,MouseEvent: MouseEvent,document: document$1} = window;

	function iter$$2(a){ return a ? (a.toIterable ? a.toIterable() : a) : []; }function extend$$1(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}
	extend$$1(DocumentFragment,{
		
		
		get $parent(){
			
			return this.up$ || this.__parent;
		},
		
		// Called to make a documentFragment become a live fragment
		setup$(flags,options){
			
			this.__start = imba.document.createComment('start');
			this.__end = imba.document.createComment('end');
			
			this.__end.replaceWith$ = function(other) {
				
				this.parentNode.insertBefore(other,this);
				return other;
			};
			
			this.appendChild(this.__start);
			return this.appendChild(this.__end);
		},
		
		// when we for sure know that the only content should be
		// a single text node
		text$(item){
			
			if (!(this.__text)) {
				
				this.__text = this.insert$(item);
			} else {
				
				this.__text.textContent = item;
			}		return;
		},
		
		insert$(item,options,toReplace){
			
			if (this.__parent) {
				
				// if the fragment is attached to a parent
				// we can just proxy the call through
				return this.__parent.insert$(item,options,toReplace || this.__end);
			} else {
				
				return Element$1.prototype.insert$.call(this,item,options,toReplace || this.__end);
			}	},
		
		insertInto$(parent,before){
			
			if (!(this.__parent)) {
				
				this.__parent = parent;
				// console.log 'insertFrgment into',parent,Array.from(self.childNodes)
				parent.appendChild$(this);
			}		return this;
		},
		
		replaceWith$(other,parent){
			
			this.__start.insertBeforeBegin$(other);
			var el = this.__start;
			while (el){
				
				let next = el.nextSibling;
				this.appendChild(el);
				if (el == this.__end) { break; }			el = next;
				
			}		return other;
		},
		
		appendChild$(child){
			
			this.__end ? this.__end.insertBeforeBegin$(child) : this.appendChild(child);
			return child;
		},
		
		removeChild$(child){
			
			child.parentNode && child.parentNode.removeChild(child);
			return this;
		},
		
		isEmpty$(){
			
			let el = this.__start;
			let end = this.__end;
			
			while (el = el.nextSibling){
				
				if (el == end) { break; }			if ((el instanceof Element$1) || (el instanceof Text$1)) { return false }		}		return true;
		},
	});


	extend$$1(ShadowRoot$1,{
		
		get $parent(){
			
			return this.host;
		},
	});

	class TagCollection {
		
		constructor(f,parent){
			
			this.__f = f;
			this.__parent = parent;
			
			if (!((f & 128)) && (this instanceof KeyedTagFragment)) {
				
				this.__start = document$1.createComment('start');
				if (parent) { parent.appendChild$(this.__start); }		}		
			if (!(f & 256)) {
				
				this.__end = document$1.createComment('end');
				if (parent) { parent.appendChild$(this.__end); }		}		
			this.setup();
		}
		
		get $parent(){
			
			return this.__parent;
		}
		
		appendChild$(item,index){
			
			// we know that these items are dom elements
			if (this.__end && this.__parent) {
				
				this.__end.insertBeforeBegin$(item);
			} else if (this.__parent) {
				
				this.__parent.appendChild$(item);
			}		return;
		}
		
		replaceWith$(other){
			
			this.detachNodes();
			this.__end.insertBeforeBegin$(other);
			this.__parent.removeChild$(this.__end);
			this.__parent = null;
			return;
		}
		
		joinBefore$(before){
			
			return this.insertInto$(before.parentNode,before);
		}
		
		insertInto$(parent,before){
			
			if (!(this.__parent)) {
				
				this.__parent = parent;
				before ? before.insertBeforeBegin$(this.__end) : parent.appendChild$(this.__end);
				this.attachNodes();
			}		return this;
		}
		
		replace$(other){
			
			if (!(this.__parent)) {
				
				this.__parent = other.parentNode;
			}		other.replaceWith$(this.__end);
			this.attachNodes();
			return this;
			
		}
		setup(){
			
			return this;
		}
	}
	class KeyedTagFragment extends TagCollection {
		static init$(){
			return super.inherited instanceof Function && super.inherited(this);
		}
		
		setup(){
			
			this.array = [];
			this.changes = new Map();
			this.dirty = false;
			return this.$ = {};
		}
		
		push(item,idx){
			
			// on first iteration we can merely run through
			if (!(this.__f & 1)) {
				
				this.array.push(item);
				this.appendChild$(item);
				return;
			}		
			let toReplace = this.array[idx];
			
			if (toReplace === item) ; else {
				
				this.dirty = true;
				// if this is a new item
				let prevIndex = this.array.indexOf(item);
				let changed = this.changes.get(item);
				
				if (prevIndex === -1) {
					
					// should we mark the one currently in slot as removed?
					this.array.splice(idx,0,item);
					this.insertChild(item,idx);
				} else if (prevIndex === idx + 1) {
					
					if (toReplace) {
						
						this.changes.set(toReplace,-1);
					}				this.array.splice(idx,1);
				} else {
					
					if (prevIndex >= 0) { this.array.splice(prevIndex,1); }				this.array.splice(idx,0,item);
					this.insertChild(item,idx);
				}			
				if (changed == -1) {
					
					this.changes.delete(item);
				}		}		return;
		}
		
		insertChild(item,index){
			
			if (index > 0) {
				
				let other = this.array[index - 1];
				// will fail with text nodes
				other.insertAfterEnd$(item);
			} else if (this.__start) {
				
				this.__start.insertAfterEnd$(item);
			} else {
				
				this.__parent.insertAfterBegin$(item);
			}		return;
		}
		
		removeChild(item,index){
			
			// self.map.delete(item)
			// what if this is a fragment or virtual node?
			if (item.parentNode == this.__parent) {
				
				this.__parent.removeChild(item);
			}		return;
		}
		
		attachNodes(){
			
			for (let i = 0, $items = iter$$2(this.array), $len = $items.length; i < $len; i++) {
				let item = $items[i];
				
				this.__end.insertBeforeBegin$(item);
			}		return;
		}
		
		detachNodes(){
			
			for (let $i = 0, $items = iter$$2(this.array), $len = $items.length; $i < $len; $i++) {
				let item = $items[$i];
				
				this.__parent.removeChild(item);
			}		return;
		}
		
		end$(index){
			var self = this;
			
			if (!(this.__f & 1)) {
				
				this.__f |= 1;
				return;
			}		
			if (this.dirty) {
				
				this.changes.forEach(function(pos,item) {
					
					if (pos == -1) {
						
						return self.removeChild(item);
					}			});
				this.changes.clear();
				this.dirty = false;
			}		
			// there are some items we should remove now
			if (this.array.length > index) {
				
				
				// remove the children below
				while (this.array.length > index){
					
					let item = this.array.pop();
					this.removeChild(item);
				}			// self.array.length = index
			}		return;
		}
	} KeyedTagFragment.init$();
	class IndexedTagFragment extends TagCollection {
		static init$(){
			return super.inherited instanceof Function && super.inherited(this);
		}
		
		
		setup(){
			
			this.$ = [];
			return this.length = 0;
		}
		
		end$(len){
			
			let from = this.length;
			if (from == len || !(this.__parent)) { return }		let array = this.$;
			let par = this.__parent;
			
			if (from > len) {
				
				while (from > len){
					
					par.removeChild$(array[--from]);
				}		} else if (len > from) {
				
				while (len > from){
					
					this.appendChild$(array[from++]);
				}		}		this.length = len;
			return;
		}
		
		attachNodes(){
			
			for (let i = 0, $items = iter$$2(this.$), $len = $items.length; i < $len; i++) {
				let item = $items[i];
				
				if (i == this.length) { break; }			this.__end.insertBeforeBegin$(item);
			}		return;
		}
		
		detachNodes(){
			
			let i = 0;
			while (i < this.length){
				
				let item = this.$[i++];
				this.__parent.removeChild$(item);
			}		return;
		}
	} IndexedTagFragment.init$();
	function createLiveFragment(bitflags,options,par){
		
		var el = document$1.createDocumentFragment();
		el.setup$(bitflags,options);
		if (par) { el.up$ = par; }	return el;
	}
	function createIndexedFragment(bitflags,parent){
		
		return new IndexedTagFragment(bitflags,parent);
	}
	function createKeyedFragment(bitflags,parent){
		
		return new KeyedTagFragment(bitflags,parent);
	}

	class ImbaElement extends HTMLElement {
		static init$(){
			return super.inherited instanceof Function && super.inherited(this);
		}
		
		constructor(){
			
			super();
			this.setup$();
			this.build();
		}
		
		setup$(){
			
			this.__slots = {};
			return this.__F = 0;
		}
		
		init$(){
			
			this.__F |= (1 | 2);
			return this;
		}
		
		// returns the named slot - for context
		slot$(name,ctx){
			var $__slots;
			
			if (name == '__' && !(this.render)) {
				
				return this;
			}		
			return ($__slots = this.__slots)[name] || ($__slots[name] = imba.createLiveFragment(0,null,this));
		}
		
		// called immediately after construction 
		build(){
			
			return this;
		}
		
		// called before the first mount
		awaken(){
			
			return this;
		}
		
		// called when element is attached to document
		mount(){
			
			return this;
		}
		
		unmount(){
			
			return this;
		}
		
		// called after render
		rendered(){
			
			return this;
		}
		
		// called before element is stringified on server (SSR)
		dehydrate(){
			
			return this;
		}
		
		// called before awaken if element was not initially created via imba - on the client
		hydrate(){
			
			// should only autoschedule if we are not awakening inside a parent context that
			this.autoschedule = true;
			return this;
		}
		
		tick(){
			
			return this.commit();
		}
		
		// called when component is (re-)rendered from its parent
		visit(){
			
			return this.commit();
		}
		
		// Wrapper for rendering. Default implementation
		commit(){
			
			if (!(this.isRender())) { return this }		this.__F |= 256;
			this.render && this.render();
			this.rendered();
			return this.__F = (this.__F | 512) & ~256;
		}
		
		
		
		get autoschedule(){
			
			return (this.__F & 64) != 0;
		}
		
		set autoschedule(value){
			
			value ? ((this.__F |= 64)) : ((this.__F &= ~64));
		}
		
		isRender(){
			
			return true;
		}
		
		isMounting(){
			
			return (this.__F & 16) != 0;
		}
		
		isMounted(){
			
			return (this.__F & 32) != 0;
		}
		
		isAwakened(){
			
			return (this.__F & 8) != 0;
		}
		
		isRendered(){
			
			return (this.__F & 512) != 0;
		}
		
		isRendering(){
			
			return (this.__F & 256) != 0;
		}
		
		isScheduled(){
			
			return (this.__F & 128) != 0;
		}
		
		isHydrated(){
			
			return (this.__F & 2) != 0;
		}
		
		schedule(){
			
			imba.scheduler.listen('render',this);
			this.__F |= 128;
			return this;
		}
		
		unschedule(){
			
			imba.scheduler.unlisten('render',this);
			this.__F &= ~128;
			return this;
		}
		
		end$(){
			
			return this.visit();
		}
		
		connectedCallback(){
			
			let flags = this.__F;
			let inited = flags & 1;
			let awakened = flags & 8;
			
			// return if we are already in the process of mounting - or have mounted
			if (flags & (16 | 32)) {
				
				return;
			}		
			this.__F |= 16;
			
			if (!(inited)) {
				
				this.init$();
			}		
			if (!(flags & 2)) {
				
				this.hydrate();
				this.__F |= 2;
				this.commit();
			}		
			if (!(awakened)) {
				
				this.awaken();
				this.__F |= 8;
			}		
			let res = this.mount();
			if (res && (res.then instanceof Function)) {
				
				res.then(imba.commit);
			}		// else
			// if this.render and $EL_RENDERED$
			// 	this.render()
			flags = this.__F = (this.__F | 32) & ~16;
			
			if (flags & 64) {
				
				this.schedule();
			}		
			return this;
		}
		
		disconnectedCallback(){
			
			this.__F = this.__F & (~32 & ~16);
			if (this.__F & 128) { this.unschedule(); }		return this.unmount();
		}
	} ImbaElement.init$();

	function extend$$2(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}


	extend$$2(SVGElement,{
		
		
		flag$(str){
			
			this.className.baseVal = str;
			return;
		},
		
		flagSelf$(str){
			var self = this;
			
			// if a tag receives flags from inside <self> we need to
			// redefine the flag-methods to later use both
			this.flag$ = function(str) { return self.flagSync$(self.__extflags = str); };
			this.flagSelf$ = function(str) { return self.flagSync$(self.__ownflags = str); };
			this.className.baseVal = (this.className.baseVal || '') + ' ' + (this.__ownflags = str);
			return;
		},
		
		flagSync$(){
			
			return this.className.baseVal = ((this.__extflags || '') + ' ' + (this.__ownflags || ''));
		},
	});

	function extend$$3(target,ext){
		// @ts-ignore
		var descriptors = Object.getOwnPropertyDescriptors(ext);
		// @ts-ignore
		Object.defineProperties(target.prototype,descriptors);
		return target;
	}var $customElements;
	var root = ((typeof window !== 'undefined') ? window : (((typeof globalThis !== 'undefined') ? globalThis : null)));

	var imba$1 = {
		version: '2.0.0',
		global: root,
		ctx: null,
		document: root.document
	};

	root.imba = imba$1;

	($customElements = root.customElements) || (root.customElements = {
		define: function() { return true; },// console.log('no custom elements')
		get: function() { return true; }// console.log('no custom elements')
	});

	imba$1.setTimeout = function(fn,ms) {
		
		return setTimeout(function() {
			
			fn();
			return imba$1.commit();
		},ms);
	};

	imba$1.setInterval = function(fn,ms) {
		
		return setInterval(function() {
			
			fn();
			return imba$1.commit();
		},ms);
	};

	imba$1.clearInterval = root.clearInterval;
	imba$1.clearTimeout = root.clearTimeout;

	imba$1.q$ = function (query,ctx){
		
		return ((ctx instanceof Element) ? ctx : document).querySelector(query);
	};

	imba$1.q$$ = function (query,ctx){
		
		return ((ctx instanceof Element) ? ctx : document).querySelectorAll(query);
	};

	imba$1.inlineStyles = function (styles){
		
		var el = document.createElement('style');
		el.textContent = styles;
		document.head.appendChild(el);
		return;
	};

	var dashRegex = /-./g;

	imba$1.toCamelCase = function (str){
		
		if (str.indexOf('-') >= 0) {
			
			return str.replace(dashRegex,function(m) { return m.charAt(1).toUpperCase(); });
		} else {
			
			return str;
		}};

	// Basic events - move to separate file?
	var emit__ = function(event,args,node) {
		
		var prev;
		var cb;
		var ret;
		
		while ((prev = node) && (node = node.next)){
			
			if (cb = node.listener) {
				
				if (node.path && cb[node.path]) {
					
					ret = args ? cb[node.path].apply(cb,args) : cb[node.path]();
				} else {
					
					// check if it is a method?
					ret = args ? cb.apply(node,args) : cb.call(node);
				}		}		
			if (node.times && --node.times <= 0) {
				
				prev.next = node.next;
				node.listener = null;
			}	}	return;
	};

	// method for registering a listener on object
	imba$1.listen = function (obj,event,listener,path){
		var $__listeners__;
		
		var cbs;
		var list;
		var tail;
		cbs = ($__listeners__ = obj.__listeners__) || (obj.__listeners__ = {});
		list = cbs[event] || (cbs[event] = {});
		tail = list.tail || (list.tail = (list.next = {}));
		tail.listener = listener;
		tail.path = path;
		list.tail = tail.next = {};
		return tail;
	};

	// register a listener once
	imba$1.once = function (obj,event,listener){
		
		var tail = imba$1.listen(obj,event,listener);
		tail.times = 1;
		return tail;
	};

	// remove a listener
	imba$1.unlisten = function (obj,event,cb,meth){
		
		var node;
		var prev;
		var meta = obj.__listeners__;
		if (!(meta)) { return }	
		if (node = meta[event]) {
			
			while ((prev = node) && (node = node.next)){
				
				if (node == cb || node.listener == cb) {
					
					prev.next = node.next;
					// check for correct path as well?
					node.listener = null;
					break;
				}		}	}	return;
	};

	// emit event
	imba$1.emit = function (obj,event,params){
		var cb;
		
		if (cb = obj.__listeners__) {
			
			if (cb[event]) { emit__(event,params,cb[event]); }		if (cb.all) { emit__(event,[event,params],cb.all); }	}	return;
	};

	imba$1.scheduler = new Scheduler();
	imba$1.commit = function() { return imba$1.scheduler.add('render'); };
	imba$1.tick = function() {
		
		imba$1.commit();
		return imba$1.scheduler.promise;
	};

	/*
	DOM
	*/


	imba$1.mount = function (mountable,into){
		
		let parent = into || document.body;
		let element = mountable;
		if (mountable instanceof Function) {
			
			let ctx = {_: parent};
			let tick = function() {
				
				imba$1.ctx = ctx;
				return mountable(ctx);
			};
			element = tick();
			imba$1.scheduler.listen('render',tick);
		} else {
			
			// automatic scheduling of element - even before
			// element.__schedule = yes
			element.__F = element.__F | 64;
		}	
		return parent.appendChild(element);
	};

	var proxyHandler = {
		get(target,name){
			
			let ctx = target;
			let val = undefined;
			while (ctx && val == undefined){
				
				if (ctx = ctx.$parent) {
					
					val = ctx[name];
				}		}		return val;
		}
	};

	extend$$3(Node,{
		
		
		get $context(){
			
			return this.$context_ || (this.$context_ = new Proxy(this,proxyHandler));
		},
		
		get $parent(){
			
			return this.up$ || this.parentNode;
		},
		
		init$(){
			
			return this;
		},
		
		// replace this with something else
		replaceWith$(other){
			
			if (!((other instanceof Node)) && other.replace$) {
				
				other.replace$(this);
			} else {
				
				this.parentNode.replaceChild(other,this);
			}		return other;
		},
		
		insertInto$(parent){
			
			parent.appendChild$(this);
			return this;
		},
		
		insertBefore$(el,prev){
			
			return this.insertBefore(el,prev);
		},
		
		insertBeforeBegin$(other){
			
			return this.parentNode.insertBefore(other,this);
		},
		
		insertAfterEnd$(other){
			
			if (this.nextSibling) {
				
				return this.nextSibling.insertBeforeBegin$(other);
			} else {
				
				return this.parentNode.appendChild(other);
			}	},
		
		insertAfterBegin$(other){
			
			if (this.childNodes[0]) {
				
				return this.childNodes[0].insertBeforeBegin$(other);
			} else {
				
				return this.appendChild(other);
			}	},
	});

	extend$$3(Comment,{
		
		// replace this with something else
		replaceWith$(other){
			
			if (other && other.joinBefore$) {
				
				other.joinBefore$(this);
			} else {
				
				this.parentNode.insertBefore$(other,this);
			}		// other.insertBeforeBegin$(this)
			this.parentNode.removeChild(this);
			// self.parentNode.replaceChild(other,this)
			return other;
		},
	});

	// what if this is in a webworker?
	extend$$3(Element,{
		
		
		emit(name,detail,o = {bubbles: true}){
			
			if (detail != undefined) { o.detail = detail; }		let event = new CustomEvent(name,o);
			let res = this.dispatchEvent(event);
			return event;
		},
		
		slot$(name,ctx){
			
			return this;
		},
		
		on$(type,mods,scope){
			
			
			var check = 'on$' + type;
			var handler;
			
			// check if a custom handler exists for this type?
			if (this[check] instanceof Function) {
				
				handler = this[check](mods,scope);
			}		
			handler = new EventHandler(mods,scope);
			var capture = mods.capture;
			var passive = mods.passive;
			
			var o = capture;
			
			if (passive) {
				
				o = {passive: passive,capture: capture};
			}		
			this.addEventListener(type,handler,o);
			return handler;
		},
		
		// inline in files or remove all together?
		text$(item){
			
			this.textContent = item;
			return this;
		},
		
		insert$(item,f,prev){
			
			let type = typeof item;
			
			if (type === 'undefined' || item === null) {
				
				// what if the prev value was the same?
				if (prev && (prev instanceof Comment)) {
					
					return prev;
				}			
				let el = document.createComment('');
				prev ? prev.replaceWith$(el) : el.insertInto$(this);
				return el;
			}		
			// dont reinsert again
			if (item === prev) {
				
				return item;
			} else if (type !== 'object') {
				
				let res;
				let txt = item;
				
				if ((f & 128) && (f & 256)) {
					
					// FIXME what if the previous one was not text? Possibly dangerous
					// when we set this on a fragment - it essentially replaces the whole
					// fragment?
					this.textContent = txt;
					return;
				}			
				if (prev) {
					
					if (prev instanceof Text) {
						
						prev.textContent = txt;
						return prev;
					} else {
						
						res = document.createTextNode(txt);
						prev.replaceWith$(res,this);
						return res;
					}			} else {
					
					this.appendChild$(res = document.createTextNode(txt));
					return res;
				}		} else {
				
				prev ? prev.replaceWith$(item,this) : item.insertInto$(this);
				return item;
			}		
		},
		get flags(){
			var self = this;
			
			if (!(this.$flags)) {
				
				this.$flags = new Flags(this);
				this.flag$ = function(str) { return self.flagSync$(self.__extflags = str); };
				this.flagSelf$ = function(str) { return self.flagSync$(self.__ownflags = str); };
			}		return this.$flags;
		},
		
		flag$(str){
			
			this.className = str;
			return;
		},
		
		flagSelf$(str){
			var self = this;
			
			// if a tag receives flags from inside <self> we need to
			// redefine the flag-methods to later use both
			let existing = (this.__extflags || (this.__extflags = this.className));
			this.flag$ = function(str) { return self.flagSync$(self.__extflags = str); };
			this.flagSelf$ = function(str) { return self.flagSync$(self.__ownflags = str); };
			this.className = (existing ? (existing + ' ') : '') + (this.__ownflags = str);
			return;
		},
		
		flagSync$(){
			
			return this.className = ((this.__extflags || '') + ' ' + (this.__ownflags || '') + ' ' + (this.$flags || ''));
		},
		
		open$(){
			
			return this;
		},
		
		close$(){
			
			return this;
		},
		
		end$(){
			
			if (this.render) { this.render(); }		return;
		},
		
		css$(key,value,mods){
			
			return this.style[key] = value;
		},
	});

	Element.prototype.appendChild$ = Element.prototype.appendChild;
	Element.prototype.removeChild$ = Element.prototype.removeChild;
	Element.prototype.insertBefore$ = Element.prototype.insertBefore;
	Element.prototype.replaceChild$ = Element.prototype.replaceChild;
	Element.prototype.set$ = Element.prototype.setAttribute;
	Element.prototype.setns$ = Element.prototype.setAttributeNS;

	ShadowRoot.prototype.insert$ = Element.prototype.insert$;
	ShadowRoot.prototype.appendChild$ = Element.prototype.appendChild$;

	imba$1.createLiveFragment = createLiveFragment;
	imba$1.createIndexedFragment = createIndexedFragment;
	imba$1.createKeyedFragment = createKeyedFragment;

	class ImbaElementRegistry {
		
		
		constructor(){
			
			this.types = {};
		}
		
		lookup(name){
			
			return this.types[name];
		}
		
		get(name,klass){
			
			if (!(name) || name == 'component') { return ImbaElement }		if (this.types[name]) { return this.types[name] }		if (klass && root[klass]) { return root[klass] }		return root.customElements.get(name) || ImbaElement;
		}
		
		create(name){
			
			if (this.types[name]) {
				
				// TODO refactor
				return this.types[name].create$();
			} else {
				
				return document.createElement(name);
			}	}
		
		define(name,klass,options){
			
			this.types[name] = klass;
			
			let proto = klass.prototype;
			
			// if proto.render && proto.end$ == Element.prototype.end$
			// proto.end$ = proto.render
			
			if (options && options.extends) ; else {
				
				root.customElements.define(name,klass);
			}		return klass;
		}
	}
	imba$1.tags = new ImbaElementRegistry();


	// root.customElements.define('imba-element',ImbaElement)

	imba$1.createElement = function (name,bitflags,parent,flags,text,sfc){
		
		var el = document.createElement(name);
		
		if (flags) { el.className = flags; }	
		if (sfc) {
			
			el.setAttribute('data-' + sfc,'');
		}	
		if (text !== null) {
			
			el.text$(text);
		}	
		if (parent && (parent instanceof Node)) {
			
			el.insertInto$(parent);
		}	
		return el;
	};

	imba$1.createComponent = function (name,bitflags,parent,flags,text,sfc){
		
		// the component could have a different web-components name?
		var el;
		
		{
			
			el = document.createElement(name);
		}	
		el.up$ = parent;
		el.init$();
		
		if (text !== null) {
			
			el.slot$('__').text$(text);
		}	
		// mark the classes as external static flags?
		if (flags) { el.className = flags; }	
		if (sfc) {
			
			el.setAttribute('data-' + sfc,'');
		}	
		return el;
	};

	imba$1.createSVGElement = function (name,bitflags,parent,flags,text,sfc){
		
		var el = document.createElementNS("http://www.w3.org/2000/svg",name);
		if (flags) {
			
			{
				
				el.className.baseVal = flags;
			}	}	if (parent && (parent instanceof Node)) {
			
			el.insertInto$(parent);
		}	return el;
	};

	// import './intersect'

	class BrowserActionComponent extends imba.tags.get('component','ImbaElement') {
		
		render(){
			var $t$0, $c$0, $b$0, $d$0, $t$1;
			
			$t$0=this;
			$t$0.open$();
			$c$0 = ($b$0=$d$0=1,$t$0.$) || ($b$0=$d$0=0,$t$0.$={});
			$b$0 || ($t$1=imba.createElement('h1',0,$t$0,null,"Browser Action",null));
			$t$0.close$($d$0);
			return $t$0;
		}
	} imba.tags.define('browser-action',BrowserActionComponent,{});

	// ReferenceError: Imba is not defined browser_action.js:1610
	// Imba.mount <browser-action>

}());
//# sourceMappingURL=browser_action.js.map
