var loc = window.location.pathname;
var folderMenu = loc.substring(0,loc.lastIndexOf('index.html')) + '/Cards/';

var folder = folderMenu + 'Deck/'
var displays = {n1: 'A', n11: 'J', n12: 'Q', n13: 'K'};
var icons = {
    h: `<div class="icon heart"><img src="${folder}Heart.png" width="30" height="30"/></div>`,
    s: `<div class="icon spade"><img src="${folder}Spade.png" width="30" height="30"/></div>`,
    c: `<div class="icon club"><img src="${folder}Club.png" width="30" height="30"/></div>`,
    d: `<div class="icon diamond"><img src="${folder}Diamonds.png" width="30" height="30"/></div>`
};
var w = 40;
var h = 60;

var lastLocation = {};
var activeCards = [];

var currentGame = {};

export default class Card {
    constructor(menuHTML = '', deck = '1', back = '1') {
        this.menuHTML = menuHTML;
        this.deck = deck
        if (this.deck[this.deck.length - 1] !== '/'){
            this.deck += '/'
        }
        this.back = back
        this.folder = folder + this.deck
    }

    renderCard(data, index = 0) {
        var newCard = document.createElement('div');
        newCard.data = data;
        // newCard.id = 'Card';
        newCard.className = 'cd ';
        var menuHTML = this.menuHTML;
        var deck = this.deck
        var back = this.back
        //For mobile app
        newCard.ontouchstart = function(e) {
            e.preventDefault();
            startDrag(e);
            return false;
        };
        newCard.ontouchmove = function(e) {
            var lastPosX = e.changedTouches[0].clientX;
            var lastPosY = e.changedTouches[0].clientY;
            moveDrag(e, lastPosX, lastPosY);
        };
        newCard.ontouchend = function(e) {
            e.preventDefault();
            var lastPosX = e.changedTouches[0].pageX;
            var lastPosY = e.changedTouches[0].pageY;
            stopDrag(e, lastPosX, lastPosY);
            return false;
        };
        newCard.onmousedown = function(e) {
            startDrag(e);
        };
        newCard.onmousemove = function(e) {
            var lastPosX = e.clientX;
            var lastPosY = e.clientY;
            moveDrag(e, lastPosX, lastPosY);
        };
        newCard.onmouseup = function(e) {
            var lastPosX = e.pageX
            var lastPosY = e.pageY;
            stopDrag(e, lastPosX, lastPosY);
        };
        if (data.folded) {
            newCard.className = newCard.className + 'f';
            newCard.innerHTML = `<img id="Card" src="${folder}Backcard/${this.back}.png" width="${w}" height="${h}"/>`;
            if(index){
                newCard.id = 'F' + index
            }
        } else {
            newCard.className += data.s + ' n' + data.n + (data.accepting ? ' a' : '');
            newCard.id = `C_${data.s + data.n}`
            newCard.innerHTML = `<img id="Card_${data.s + data.n}" src="${this.folder+data.s}/${displays['n' + data.n] ? displays['n' + data.n] : data.n}.png" width="${w}" height="${h}"/>`;
        }
        return newCard;
    }

    startDrag(e) {
        activeCards = [];
        if (e.target.className.indexOf('cd') > -1 && !e.target.data.folded) {
            lastLocation = e.target.parentNode;
            activeCards.push(e.target);
            var grabberCard = activeCards[0].nextElementSibling;
            while (lastLocation.id.indexOf('stack') > -1 && grabberCard !== null) {
                activeCards.push(grabberCard);
                grabberCard = grabberCard.nextElementSibling;
            }
        } else if (e.target.className.indexOf('cd f') > -1 && e.target.parentNode.className.indexOf('refuse') > -1) {
            if (e.target.nextElementSibling) {
                var thisLast = currentGame.refuse[currentGame.refuse.length - 1];
                thisLast.folded = true;
                currentGame.refuse.pop();
                currentGame.refuse.unshift(thisLast);
            }
            currentGame.refuse[currentGame.refuse.length - 1].folded = false;
            activeCards = [];
            this.renderBoard();
        }
    }

    moveDrag(e, lastPosX, lastPosY) {
        if (activeCards.length > 0) {
            var left = lastPosX - 30;
            var top = lastPosY + 15;
            var zIndex = 999999;
            for (var ac = 0; ac < activeCards.length; ac++) {
                activeCards[ac].style = 'position: fixed; z-index: ' + zIndex + '; left: ' + left + 'px; top: ' + top + 'px';
                top = top + 20;
                zIndex = zIndex + 100;
            }
        }
    }

    stopDrag(e, lastPosX, lastPosY) {
        var accepterNode = null;
        var giverNode = lastLocation.id;

        var successfulMove = false;
        if (activeCards.length > 0) {
            var movingSuit = activeCards[0].data.s;
            var movingNum = activeCards[0].data.n;
            var movingColor = activeCards[0].data.colr;
            var accepters = document.getElementsByClassName('a');
            for (var ac = 0; ac < accepters.length; ac++) {
                var accepter = accepters[ac];
                if (accepter.data && accepter.data.id == activeCards[0].data.id) {
                    continue;
                }

                var aX0 = accepter.offsetLeft;
                var aX1 = aX0 + accepter.offsetWidth;
                var aY0 = accepter.offsetTop;
                var aY1 = aY0 + accepter.offsetHeight;

                var isStack = accepter.className.indexOf('stack') > -1 && accepter.children.length === 0;
                var isCloset = accepter.className.indexOf('closet') > -1 && accepter.children.length === 1;
                var isStackCard = accepter.parentNode.className.indexOf('stack') > -1;
                var isClosetCard = accepter.parentNode.className.indexOf('closet') > -1;

                if (lastPosX >= aX0 && lastPosX <= aX1 && lastPosY >= aY0 && lastPosY <= aY1) {
                    if (isStack) {
                        if (movingNum === 13) {
                            accepterNode = currentGame.stacks[accepter.id];
                            successfulMove = true;
                            break;
                        }
                    } else if (isCloset) {
                        var accepterSuit = accepter.getAttribute('data-suit');
                        if (accepterSuit === movingSuit && movingNum === 1 && activeCards.length === 1) {
                            accepterNode = currentGame.closets[accepter.id];
                            successfulMove = true;
                            break;
                        }
                    } else if (isClosetCard) {
                        var accepterSuit = accepter.data.s;
                        var accepterNum = accepter.data.n;
                        if (accepterSuit === movingSuit && accepterNum + 1 === movingNum && activeCards.length === 1) {
                            accepterNode = currentGame.closets[accepter.parentNode.id];
                            successfulMove = true;
                            break;
                        }
                    } else if (isStackCard) {
                        var accepterNum = accepter.data.n;
                        var accepterColor = accepter.data.colr;
                        if (accepterColor !== movingColor && accepterNum - 1 === movingNum) {
                            var accepterNode = currentGame.stacks[accepter.parentNode.id];
                            var giverNode = lastLocation.id;
                            successfulMove = true;
                            break;
                        }
                    }
                }
            }

            if (successfulMove) {
                var oldStack = currentGame.stacks[giverNode];
                if (giverNode === 'refuse') {
                    oldStack = currentGame['refuse'];
                } else if (giverNode.indexOf('stack') === -1) {
                    oldStack = currentGame.closets[giverNode];
                }

                while (activeCards.length > 0) {
                    if (activeCards.length === 1) {
                        activeCards[0].data.accepting = true;
                    }
                    accepterNode.push(activeCards[0].data);
                    oldStack.pop();

                    activeCards.shift();
                }
                if (oldStack.length) {
                    if (giverNode !== 'refuse') {
                        oldStack[oldStack.length - 1].accepting = true;
                    }
                    oldStack[oldStack.length - 1].folded = false;
                }
                this.renderBoard();
                this.checkIfFinished();
            } else {
                activeCards = [];
                this.renderBoard();
            }
        }
    }

}
