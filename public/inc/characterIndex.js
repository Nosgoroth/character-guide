
window.app = {};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}



function parseTagList(taglist) {
	if (typeof taglist !== "string") { return taglist; }
	var ts = taglist.split(",");
	var tags = [];
	for (var i = 0; i < ts.length; i++) {
		var t = ts[i].trim();
		if (!t) {continue;}
		var tb = t.split("@");
		if (tb.length === 1) {
			tags.push(t);
		} else {
			tags.push([
				tb[0].trim(),
				parseInt(tb[1])
			]);
		}
	}
	return tags;
}

function parseBlurb(blurb) {
	var bs = blurb.split("@");
	var blurbs = {
		0: bs[0].trim()
	};
	for (var i = 1; i < bs.length; i++) {
		var m = bs[i].trim().match(/^(\$?[\d+]): ?(.*)$/);
		if (!m) { continue; }
		if (m[1][0] === "$") {
			m[1] = parseInt(m[1].slice(1));
			m[2] = {
				blurbReplace: true,
				text: m[2]
			}
		}
		blurbs[m[1]] = m[2];
	}
	return blurbs;
}
function renderBlurbForBook(blurb, book){
	return renderParsedBlurbForBook(parseBlurb(blurb), book);
}
function renderParsedBlurbForBook(parsedBlurb, book){
	if (!book) { return parsedBlurb[0] ? parsedBlurb[0] : ""; }
	var subblurbs = [];
	for (var i = 0; i < book+1; i++) {
		if (parsedBlurb[i]) {
			if (parsedBlurb[i].blurbReplace) {
				subblurbs = [parsedBlurb[i].text];
			} else if (typeof parsedBlurb[i] === "string") {
				subblurbs.push(parsedBlurb[i]);
			}
		}
	}
	return subblurbs.join(" ");
}

function makeTagReadable(tag) {
	return tag.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
}

function CharacterTag(rawtag) {
	this.tag = "";
	this.book = 0;
	if (!rawtag) {
		return;
	}
	if (typeof rawtag === "string") {
		this.tag = rawtag;
	} else if (Array.isArray(rawtag)) {
		this.tag = rawtag[0];
		this.book = rawtag[1] ? rawtag[1] : 0;
	} else if (rawtag.tag) {
		this.tag = rawtag.tag;
		this.book = rawtag.book ? rawtag.book : 0;
	}
}

CharacterTag.prototype.toString = function(){
	return this.tag+(this.book?("@"+this.book):"");
}
CharacterTag.prototype.test = function(tag, book) {
	if (tag !== this.tag) { return false; }
	if (!this.isBook(book)) { return false; }
	return true;
}
CharacterTag.prototype.isBook = function(book) {
	return (book && this.book) ? (book >= this.book) : true;
}
CharacterTag.prototype.getTagName = function() {
	return this.tag;
}
CharacterTag.prototype.getDisplayTagName = function() {
	return this.tag.capitalize();
}
CharacterTag.prototype.getBook = function() {
	return this.book;
}
CharacterTag.prototype.render = function(onclick){
	if (!this.$rendered) {
		this.$rendered = jQuery('<span class="tag">')
			.text("#"+this.getDisplayTagName())
			.on("click", function(){
				if (typeof onclick === "function") {
					onclick(this);
				}
			}.bind(this));
	}
	return this.$rendered;
}
CharacterTag.prototype.setRenderVisibleForBook = function(book){
	if (!this.$rendered) { return; }
	this.$rendered.toggle( this.isBook(book) );
}




function Character(raw, options){
	this.name = raw.name ? parseBlurb(raw.name) : parseBlurb("?");
	this.book = raw.book ? raw.book : 1;
	this.blurb = raw.blurb ? parseBlurb(raw.blurb) : parseBlurb("-");
	this.imgurl = raw.imgurl ? raw.imgurl : null;

	this.options = jQuery.extend({}, {
		onTagClick: function(){}
	}, options);

	this._tags = [];
	var taglist = parseTagList(raw.tags);
	taglist = taglist ? taglist : [];
	taglist.unshift("volume"+this.book);
	if (taglist && Array.isArray(taglist)) {
		for (var i = 0; i < taglist.length; i++) {
			this._tags.push(new CharacterTag(taglist[i]));
		}
	}
}

Character.prototype.getTagVolumes = function(){
	try {
		return this._tags.map(function(x){ return x.getBook() }).reduce(function(a, b){ return Math.max(a,b); });
	} catch(e) {
		return 0;
	}
}

Character.prototype.getMaxVolume = function(){
	return Math.max(
		this.book,
		this.getTagVolumes(),
		Object.keys(this.name).map(function(x){ return parseInt(x) }).reduce(function(a, b){ return Math.max(a,b); }),
		Object.keys(this.blurb).map(function(x){ return parseInt(x) }).reduce(function(a, b){ return Math.max(a,b); })
	);
}
Character.prototype.toString = function(){
	return this.name;
}
Character.prototype.render = function(){
	if (!this.$rendered) {
		this.$rendered = jQuery('<li class="character">');
		var $inner = jQuery('<span class="inner">').appendTo(this.$rendered);
		this.$name = jQuery('<span class="name">').appendTo($inner);
		this.$blurb = jQuery('<span class="blurb">').appendTo($inner);
		
		this.$tags = jQuery('<span class="tags">').appendTo($inner);
		for (var i = 0; i < this._tags.length; i++) {
			this._tags[i].render(this.options.onTagClick).appendTo(this.$tags);
		}

		this.setRenderByBook(1);
	}
	return this.$rendered;
}
Character.prototype.getRenderedElement = function(){
	return this.render();
}
Character.prototype.setRenderByBook = function(book){
	this.$blurb.text(this.getBlurb(book));
	this.$name.text(this.getName(book));
	for (var i = 0; i < this._tags.length; i++) {
		this._tags[i].setRenderVisibleForBook(book);
	}
}
Character.prototype.getBlurb = function(book){
	return renderParsedBlurbForBook(this.blurb, book);
	/*
	if (!book) { return this.blurb[0] ? this.blurb[0] : ""; }
	var subblurbs = [];
	for (var i = 0; i < book+1; i++) {
		if (this.blurb[i]) {
			subblurbs.push(this.blurb[i]);
		}
	}
	return subblurbs.join(" ");
	*/
}
Character.prototype.getName = function(book){
	return renderParsedBlurbForBook(this.name, book);
	/*
	var name = "?";
	if (!book) { return this.name[0] ? this.name[0] : name; }
	for (var i = 0; i < book+1; i++) {
		if (this.name[i]) {
			name = this.name[i];
		}
	}
	return name;
	*/
}
Character.prototype.getBook = function(){
	return this.book;
}
Character.prototype.isBook = function(book, bookmode){
	if (bookmode==="latest") {
		return (book === this.book);
	} else {
		return (book && this.book) ? (book >= this.book) : true;
	}
}
Character.prototype.isTextFilter = function(filter, book){
	if (!filter || typeof filter !== "string") { return true; }
	if (this.getName(book).toLowerCase().includes(filter)) {
		return true;
	} else if (data.searchInBlurb && this.getBlurb(book).toLowerCase().includes(filter)) {
		return true
	}
	return false;
}
Character.prototype.hasTag = function(tag, book){
	for (var i = this._tags.length - 1; i >= 0; i--) {
		//console.log(this.name, "test", this._tags[i], tag, book);
		if (this._tags[i].test(tag,book)) {
			return true;
		}
	}
	return false;
}
Character.prototype.hasAnyTag = function(tags, book){
	for (var i = tags.length - 1; i >= 0; i--) {
		if (this.hasTag(tags[i], book)) {
			return true;
		}
	}
	return false;
}
Character.prototype.hasAllTags = function(tags, book){
	for (var i = tags.length - 1; i >= 0; i--) {
		if (!this.hasTag(tags[i], book)) {
			return false;
		}
	}
	return true;
}
Character.prototype.hasTags = function(tags, book, isAll){
	return isAll ? this.hasAllTags(tags,book) : this.hasAnyTag(tags,book);
}
Character.prototype.getAllTags = function(){
	return this._tags;
}
Character.prototype.tagsByBook = function(book){
	if (!this.isBook(book)) { return []; }
	var tags = [];
	for (var i = this._tags.length - 1; i >= 0; i--) {
		if (this._tags[i].isBook(book)) {
			tags.push(this._tags[i].getTagName());
		}
	}
	return tags;
}




function CharacterController() {
	this._characters = [];
	for (var i = 0; i < window.data.characters.length; i++) {
		this._characters.push(new Character(window.data.characters[i], {
			onTagClick: this.onTagClick.bind(this)
		}));
	}

	this._tagBooks =
		(window.data.tagBooks === "auto") ? this.generateMinBookPerTagList() : window.data.tagBooks;

	this.bookmode = "all";
	this.book = 0;
	this.filtertags = [];
	this.isAll = true;

	if (window.data.maxvolume === "auto") {
		window.data.maxvolume = this.getMaxVolume();
	}
}
CharacterController.prototype.generateMinBookPerTagList = function(){
	var tagBooks = {};

	for (var i = 0; i < this._characters.length; i++) {
		var character = this._characters[i],
			tags = character.getAllTags();

		for (var j = 0; j < tags.length; j++) {
			var tag = tags[j],
				tagName = tag.getTagName(),
				book = Math.max(character.getBook(), tag.getBook())
				;

			tagBooks[tagName] = Math.max((tagBooks[tagName]?tagBooks[tagName]:0), book);
		}
	}

	return tagBooks;
}


CharacterController.prototype.onTagClick = function(_tag){
	app.formc.selectTag(_tag.getTagName());
}
CharacterController.prototype.getMaxVolume = function(){
	var max = 1;
	for (var i = 0; i < this._characters.length; i++) {
		var charmax = this._characters[i].getMaxVolume();
		if (charmax > max) { max = charmax; }
	}
	if (max === 1) { return max; }
	return Math.max(
		1,
		this._characters.map(function(x){ return x.getMaxVolume(); }).reduce(function(a,b){ return Math.max(a, b); }),
		Object.values(this._tagBooks).reduce(function(a,b){ return Math.max(a, b); })
		);
}
CharacterController.prototype.isTagActive = function(tag){
	return (this.filtertags.indexOf(tag) !== -1);
}
CharacterController.prototype.getBook = function(){
	return this.book;
}
CharacterController.prototype.setBook = function(book){
	this.book = book;
}
CharacterController.prototype.setBookmode = function(bookmode){
	this.bookmode = ((bookmode==="all") ? "all" : "latest");
}
CharacterController.prototype.getBookmode = function(bookmode){
	return this.bookmode;
}
CharacterController.prototype.getAllCharacters = function(){ 
	return this._characters;
}
CharacterController.prototype.setTags = function(tags){ //string array
	this.filtertags = tags;
}
CharacterController.prototype.setTextFilter = function(filter){
	this.textfilter = filter.toLowerCase();
}
CharacterController.prototype.getValidCharacters = function(){
	var chars = [];
	for (var i = 0; i < this._characters.length; i++) {
		if (!this._characters[i].isBook(this.book, this.bookmode)) {
			//console.log(this._characters[i].name, "is not book", this.book);
			continue;
		}
		if (!this._characters[i].isTextFilter(this.textfilter, this.book)) {
			//console.log(this._characters[i].name, "is not filter", this.book);
			continue;
		}
		if (this.filtertags.length && !this._characters[i].hasTags(this.filtertags, this.book, this.isAll)) {
			//console.log(this._characters[i].name, "doesn't have tags", this.filtertags, this.book);
			continue;
		}
		chars.push(this._characters[i]);
	}
	return chars;
}
CharacterController.prototype.test = function(){
	return this.getValidCharacters().join(", ");
}
CharacterController.prototype.getAllTags = function(){
	var tags = {};
	for (var i = 0; i < this._characters.length; i++) {
		var chartags = this._characters[i].tagsByBook(this.book);
		for (var j = 0; j < chartags.length; j++) {
			if (!tags[chartags[j]]) {
				tags[chartags[j]] = 0;
			}
			tags[chartags[j]] += 1;
		}
	}
	return tags;
}










function FormController(){
	this._selectedChars = [];

	this.$book = jQuery("#book");
	this.$bookVal = this.$book.parent().find(".value");
	this.$tags = jQuery("#tags");
	this.$filter = jQuery("#filter");
	this.$bookmode = jQuery("#bookmode");
	this.$result = jQuery("#dpResults");

	app.chars.setBookmode(window.data.defaultBookmode);
	this.$bookmode.val(app.chars.getBookmode());

	this.$filter.on('change keyup', this.onFilterChange.bind(this));
	this.$bookmode.on('change', this.onBookmodeChange.bind(this)).parent().toggle(!!data.showBookmodeSelect);
	this.$tags.chosen().on('change', this.onTagsChange.bind(this));



	this.$numResults = jQuery('<span class="numResults">').appendTo(this.$result);

	var $ul = jQuery("<ul>").appendTo(this.$result);
	var chars = app.chars.getAllCharacters();
	for (var i = 0; i < chars.length; i++) {
		chars[i].render().appendTo($ul).hide();
	}

	this.$book.prop({
		min: 1,
		max: window.data.maxvolume
	});
	if (window.data.defaultVolume === "store") {
		this.$book.val(1);
		this.loadBookSelection();
	} else {
		this.$book.val(window.data.defaultVolume === "max" ? window.data.maxvolume : window.data.defaultVolume);
	}
	this.$book.on("change", this.onBookChange.bind(this));
	this.onBookChange();

	this.$infoButton = jQuery("#info-button");
	this.$infoBlock = jQuery("#info-block");

	this.$infoButton.on('click', this.openInfoBlock.bind(this));
	this.$infoBlock.find(".close").on('click', this.closeInfoBlock.bind(this));
	if (!this.getInfoBlockStatusClosed()) {
		this.openInfoBlock();
	}
}
FormController.prototype.openInfoBlock = function() { this.$infoBlock.slideDown(); this.$infoButton.slideUp(); this.setInfoBlockStatusOpen(); }
FormController.prototype.closeInfoBlock = function() { this.$infoBlock.slideUp(); this.$infoButton.slideDown(); this.setInfoBlockStatusClosed(); }
FormController.prototype.getInfoBlockStatusClosed = function() { return (localStorage.getItem("infoBlockClosed") === "true"); }
FormController.prototype.setInfoBlockStatusClosed = function() { return this.setInfoBlockStatus(true); }
FormController.prototype.setInfoBlockStatusOpen = function() { return this.setInfoBlockStatus(false); }
FormController.prototype.setInfoBlockStatus = function(b) { localStorage.setItem("infoBlockClosed", (b?"true":"false")); }

FormController.prototype.loadBookSelection = function() {
	var b = localStorage.getItem("book");
	if (b && !isNaN(b)) {
		this.$book.val(parseInt(b));
	}
}
FormController.prototype.saveBookSelection = function() {
	localStorage.setItem("book", this.$book.val());
}

FormController.prototype.fillTags = function() {
	var tags = app.chars.getAllTags();
	try {
		//this.$tags.data("selectpicker").destroy();
	} catch(e) {
		//console.error(e);
	}
	this.$tags.find("option").remove();

	var tagkeys = Object.keys(tags);
	tagkeys.sort(function(b, a) { return tags[a] - tags[b] });

	for (var i = 0; i < tagkeys.length; i++) {
		var tag = tagkeys[i], num = tags[tagkeys[i]];
		var $opt = jQuery("<option>")
			.val(tag)
			.text(makeTagReadable(tag)+" ("+num+")")
			.appendTo(this.$tags)
			;
		if (app.chars.isTagActive(tag)) {
			$opt.attr("selected", "selected");
		}
	}
	
	this.$tags.trigger("chosen:updated");

	this.onTagsChange();
}
FormController.prototype.onBookChange = function() {
	this.saveBookSelection();
	this.$bookVal.text("book "+this.$book.val());
	app.chars.setBook(parseInt(this.$book.val()));
	this.fillTags();
}

FormController.prototype.onFilterChange = function() {
	app.chars.setTextFilter(this.$filter.val().trim());
	this.onAnyChange();
}

FormController.prototype.onBookmodeChange = function() {
	app.chars.setBookmode(this.$bookmode.val());
	this.onAnyChange();
}

FormController.prototype.selectTag = function(tagname) {
	this.$tags.val(tagname);
	this.$tags.trigger("chosen:updated");
	this.onTagsChange();
}

FormController.prototype.onTagsChange = function() {
	app.chars.setTags(this.$tags.val());
	this.onAnyChange();
}

FormController.prototype.onAnyChange = function() {
	this.$bookVal.text("book "+app.chars.getBook());

	for (var i = 0; i < this._selectedChars.length; i++) {
		this._selectedChars[i].getRenderedElement().hide();
	}
	
	this._selectedChars = app.chars.getValidCharacters();
	this.$numResults.text( this._selectedChars.length+" results" );

	for (var i = 0; i < this._selectedChars.length; i++) {
		this._selectedChars[i].setRenderByBook(app.chars.getBook());
		this._selectedChars[i].getRenderedElement().show();

	}
}






jQuery(document).ready(function(){
	app.chars = new CharacterController();
	app.formc = new FormController();
});

