/**
 * DataFormsJS todomvc Example
 * 
 * @link http://todomvc.com/
 */

/* Validates with both [jshint] and [eslint] */
/* global app */
/* jshint strict: true */
/* eslint-env browser */
/* eslint quotes: ["error", "single", { "avoidEscape": true }] */
/* eslint strict: ["error", "function"] */
/* eslint spaced-comment: ["error", "always"] */
/* eslint no-console: ["error", { allow: ["log", "warn", "error"] }] */

(function() {
	'use strict';

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	// Generic Model - Plain JavaScript Object, makes no DOM Updates
	var model = {
		name: 'todos-' + document.documentElement.getAttribute('data-framework'),
		items: [],
		filter: null,
		open: function () {
			this.items = (JSON.parse(localStorage.getItem(this.name)) || []);
		},
		save: function () {
			localStorage.setItem(this.name, JSON.stringify(this.items));
		},
		addItem: function (title) {
			this.items.push({
				id: this.nextId(),
				title: title,
				completed: false,
			});
		},
		nextId: function() {
			if (this.items.length === 0) {
				return 0;
			}
			var ids = this.items.map(function(item) {
				return item.id;
			});
			return Math.max.apply(null, ids) + 1;
		},
		showAll: function() { this.filter = null; },
		showCompleted: function() { this.filter = true; },
		showActive: function() { this.filter = false; },
		filteredItems: function() {
			if (this.filter === null) {
				return this.items;
			}
			return this.items.filter(function(item) {
				return (item.completed === this.filter);
			}, this);
		},
		filteredCount: function(completed) {
			return this.items.filter(function(item) {
				return (item.completed === completed);
			}).length;
		},
		activeCount: function() { return this.filteredCount(false); },
		completedCount: function() { return this.filteredCount(true); },
		activeLabel: function() { 
			return (this.activeCount() === 1 ? 'item left' : 'items left');
		},
		getById: function(id) {
			for (var n = 0, m = this.items.length; n < m; n++) {
				if (String(this.items[n].id) === id) {
					return this.items[n];
				}
			}
		},		
		deleteById: function(id) {
			for (var n = 0, m = this.items.length; n < m; n++) {
				if (String(this.items[n].id) === id) {
					this.items.splice(n, 1);
					return;
				}
			}
		},
		clearCompleted: function () {
			this.items = this.items.filter(function(item) {
				return (item.completed === false);
			});
		},
		toggleAll: function (completed) {
			this.items.forEach(function(item) {
				item.completed = completed;
			});
		},
	};

	// Controller function that gets called every time [app.updateView()] is called
	/* jshint validthis: true */
	function updatePage() {
		// In all controller functions [this] will be a reference to the active model object
		var model = this;

		// Save model each time the view is updated
		model.save();

		// Show or hide sections of the page
		if (model.items.length === 0) {
			document.querySelector('.todoapp').classList.add('no-items');
		} else {
			document.querySelector('.todoapp').classList.remove('no-items');
		}

		// Show selected nav link
		var hash = (window.location.hash === '' ? '#/' : window.location.hash);
		var link = document.querySelector(".filters a[href='" + hash + "']");
		if (link) {
			link.classList.add('selected');
		}

		// Clear completed link
		var clearCompleted = document.querySelector('.clear-completed');
		if (clearCompleted) {
			clearCompleted.onclick = function() {
				model.clearCompleted();
				app.updateView();
			};
		}

		// Setup item events
		var items = document.querySelectorAll('.todo-list li');
		Array.prototype.forEach.call(items, function(item) {
			var id = item.getAttribute('data-id'),
				checkbox = item.querySelector('.toggle'),
				label = item.querySelector('label'),
				edit = item.querySelector('.edit'),
				btnDelete = item.querySelector('.destroy');

			checkbox.onclick = function () {
				model.getById(id).completed = checkbox.checked;
				app.updateView();
			};

			btnDelete.onclick = function () {
				model.deleteById(id);
				app.updateView();
			};

			label.ondblclick = function () {
				item.classList.add('editing');
				edit.value = label.textContent;
				edit.focus();
			};

			edit.onkeypress = function(e) {
				if (e.keyCode === ENTER_KEY) {
					var value = edit.value.trim();
					if (value !== '') {
						model.getById(id).title = value;
						app.updateView();
					}
				}
			};

			edit.onkeyup = function(e) {
				if (e.keyCode === ESCAPE_KEY) {
					item.classList.remove('editing');
				}
			};
		});
	}

	// Setup elements that are created only once and read the model from local storage
	function setup() {
		var newItemInput = document.querySelector('.new-todo');
		newItemInput.onkeypress = function(e) {
			if (e.keyCode === ENTER_KEY) {
				var value = newItemInput.value.trim();
				if (value !== '') {
					model.addItem(value);
					newItemInput.value = '';
					app.updateView();
				}
			}
		};

		var toggleAll = document.querySelector('.toggle-all');
		toggleAll.onclick = function () {
			model.toggleAll(toggleAll.checked);
			app.updateView();
		};

		model.open();
	}
	setup();

	// DataFormsJS Setup
	app
		.addModel('todos', model)
		.addController({ path: '/',           modelName: 'todos',  onBeforeRender: model.showAll,        onRendered: updatePage })
		.addController({ path: '/active',     modelName: 'todos',  onBeforeRender: model.showActive,     onRendered: updatePage })
		.addController({ path: '/completed',  modelName: 'todos',  onBeforeRender: model.showCompleted,  onRendered: updatePage });

})();