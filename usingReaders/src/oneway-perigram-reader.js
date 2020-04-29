///////////////////// OnewayPerigramReader /////////////////////

subclass(OnewayPerigramReader, PerigramReader);

// really only ever to-be-spawned
// requires a 'last' (read word) to allow for
// viable tri-grammatic perigrame look-ups

function OnewayPerigramReader(g, rx, ry, speed, dir, parent) {

  Reader.call(this, g, rx, ry, speed); // superclass constructor

  this.type = 'OnewayPerigramReader';

  this.wayToGo = dir;
  // allow N if dir is NE, or S if dir is SE:
  this.altWayToGo = (dir == 2) ? 1 : 7;
  this.parentLast = parent;
  this.selectedLast = null;
  this.consoleString = '';
  this.currentKey = '';
  this.phrase = '';
  this.freeCount = 0;
  // if maxFreeCount is 0, no non-bigram moves allowed
  this.maxFreeCount = 0;
  // adjust for bigram count threshold:
  this.bigramThreshold = 0;
  this.neighbors = [];
  this.darkThemeFade = colorToObject(191, 191, 191, 255);
  this.lightThemeFade = colorToObject(63, 63, 63, 255);
  this.activeFill = this.darkThemeFade; // light grey

  // factors
  this.fadeInFactor = .8;
  this.fadeOutFactor = 10;
  this.delayFactor = 2.5;
}

OnewayPerigramReader.prototype.onEnterCell = function (curr) {

  this.actualStepTime = this.stepTime / 1000;
  this.fadeInTime = this.actualStepTime * this.fadeInFactor;
  this.fadeOutTime = this.actualStepTime * this.fadeOutFactor;
  this.delayBeforeFadeBack = this.actualStepTime * this.delayFactor;
  if (bgColor != 0)
  	this.activeFill = this.lightThemeFade;
  else
  	this.activeFill = this.darkThemeFade;

  // fading current in and out
  fid = curr.colorTo(this.activeFill, this.fadeInTime);
  curr.colorTo(this.pman.defaultFill, this.fadeOutTime, this.delayBeforeFadeBack + this.fadeInTime);
}

OnewayPerigramReader.prototype.selectNext = function () {

  var last;
  if (!this.selectedLast) last = this.parentLast;
  else last = this.lastRead(2);
  var neighbors = Grid.gridFor(this.current).neighborhood(this.current);

  return this._determineReadingPath(last, neighbors);
}

OnewayPerigramReader.prototype._determineReadingPath = function (last, neighbors) {

  if (!neighbors) throw Error("no neighbors");

  if (!this.current) throw Error("no current cell!");

  var vectorNeighbors = [];

  if (this._isViableDirection(this.current, neighbors[this.wayToGo]))
  	vectorNeighbors.push(neighbors[this.wayToGo]);

  if (this._isViableDirection(this.current, neighbors[this.altWayToGo]))
  	vectorNeighbors.push(neighbors[this.altWayToGo]);

  var nextCell = this._chooseCell(vectorNeighbors);

  if (nextCell) {
  	// info("Found " + this.current.text() + "+" + nextCell.text() + ": " + this.pman.bigramCount([this.current,nextCell])); // DEBUG
  	this.freeCount = 0;
  }

  if ((!nextCell) && (++this.freeCount < this.maxFreeCount)) {
		vectorNeighbors = [];
		if (neighbors[this.wayToGo]) vectorNeighbors.push(neighbors[this.wayToGo]);
		if (neighbors[this.altWayToGo]) vectorNeighbors.push(neighbors[this.altWayToGo]);
  	nextCell = this._chooseCell(vectorNeighbors);
  	// if (nextCell != null) info("Alive with no bigrams"); // DEBUG
  }

  if (!nextCell) Reader.dispose(this);

  return nextCell;
}

OnewayPerigramReader.prototype._chooseCell = function (cells) {

	switch (cells.length) {
		case 2:
			return cells[Math.floor(Math.random() * 2)];
		case 1:
			return cells[0];
		default:
		return null;
	}
}

// simplified
OnewayPerigramReader.prototype._isViableDirection = function (curr, neighbor) {

  if (!curr || !neighbor) return false;

  return this.pman.isBigram(curr.text(), neighbor.text(), this.bigramThreshold);
}

//////////////////////// Exports ////////////////////////

if (typeof module != 'undefined' && module.exports) { // for node

  module.exports = OnewayPerigramReader;
}
