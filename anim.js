'use strict';
const $            = require('jquery');
const Transparency = require('transparency');

var Anim = {
	items:         [],
	elements:      [],
	// scrollPos:  0,
	// itemHeight: 0,
	firstVisible:  0,
	nVisible:      6,
	$root:         null,
	$scrolldiv:    null,
	$stage:        null,

	itemRender: function(item, i) {
		if (i >= 0 && i < this.elements.length) {
			Transparency.render(this.elements[i], item);
		} else {
			this.elements[i] = $(`<div class="item">
				<div class="hash"></div>
				<div class="subject"></div>
				<div class="body"></div>
				<div class="parents"></div>
			</div>`).appendTo(this.$stage);
			Transparency.render(this.elements[i], item);
		}
	},

	measureItem: function(item) {
		if ($('.item:first').length) {
			return $('.item:first').height();
		} else {
			item = $(this.itemRender(item));
			this.$root.append(item);
			var height = item.height();
			item.remove();
			item   = null;
			return height;
		}
	},


	updateScroll: function(y) {
		var height        = this.$scrolldiv.find('.scroller-content').height();

		this.firstVisible = Math.ceil(Math.max(0,
			Math.min(
				this.items.length - (this.nVisible - 1),
				y * this.items.length / height
			)
		));
		this.draw();
	},

	init: function(root) {
		this.firstVisible  = 0;
		this.$root         = $(root);
		this.$stage        = this.$root.find('.viewport');
		this.$scrolldiv    = this.$root.find('.scroller');
		var scrollerFactor = Math.ceil(this.items.length / this.nVisible * this.$stage.height());

		// 100 / 6 * 296
		this.$scrolldiv.find('.scroller-content').css('height', scrollerFactor + 'px');

		var that = this;

		this.$stage.on('mousewheel', function(e) {
			var y = that.$scrolldiv.scrollTop();
			y    += e.originalEvent.deltaY;
			that.$scrolldiv.scrollTop(y);
		});
		this.$scrolldiv.on('scroll', function(e) {
			that.updateScroll($(this).scrollTop());
			e.preventDefault();
			e.stopPropagation();
		});

		Anim.draw();

		// var Scroller      = require('./scroller');
		// this.scroll       = new Scroller(this.$stage, $('.scroller'), {
		// 	first:   0,
		// 	visible: 6,
		// 	total:   this.items.length
		// });
		// this.scroll.on('scroll', function(scroll, data, delta, scroller) {
		// 	console.log('scroll', arguments);
		// 	this.firstVisible = data.first;
		// 	this.draw();
		// }.bind(this));
	},

	draw: function() {
		var html  = '';
		var N     = Math.min(this.firstVisible + this.nVisible, this.items.length);
		var k     = 0;
		for(var i = this.firstVisible; i < N; i++, k++) {
			html += this.itemRender(this.items[i], k);
		}
	}
};

$(function() {
	for(let i=0; i < 100; i++) {Anim.items.push({
			hash:    i,
			subject: `Commit ${i}`,
			body:    `This was a commit of ${i}`,
		});
	}
	for(let i=1; i < 100; i++) {
		Anim.items[i].parents = [Anim.items[i-1]];
	}
	Anim.init('.container');
});