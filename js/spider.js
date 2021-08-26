var loc = window.location.pathname;
var folderMenu = loc.substring(0,loc.lastIndexOf('index.html')) + '/Cards/';

var folder = folderMenu + 'Deck/'
var cards = [];
var suits = ['h', 's', 'c', 'd'];
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
var priorGame = {};

export default class Spider {
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
        newCard.className = 'cd ';
        var menuHTML = this.menuHTML;
        var deck = this.deck
        var back = this.back
        newCard.ontouchstart = function(e) {
            e.preventDefault();
            new Spider(menuHTML,deck,back).startDrag(e);
            return false;
        };
        newCard.ontouchmove = function(e) {
            var lastPosX = e.changedTouches[0].clientX;
            var lastPosY = e.changedTouches[0].clientY;
            new Spider(menuHTML,deck,back).moveDrag(e, lastPosX, lastPosY);
        };
        newCard.ontouchend = function(e) {
            e.preventDefault();
            var lastPosX = e.changedTouches[0].pageX;
            var lastPosY = e.changedTouches[0].pageY;
            new Spider(menuHTML,deck,back).stopDrag(e, lastPosX, lastPosY);
            return false;
        };
        newCard.onmousedown = function(e) {
            new Spider(menuHTML,deck,back).startDrag(e);
        };
        newCard.onmousemove = function(e) {
            var lastPosX = e.clientX;
            var lastPosY = e.clientY;
            new Spider(menuHTML,deck,back).moveDrag(e, lastPosX, lastPosY);
        };
        newCard.onmouseup = function(e) {
            var lastPosX = e.pageX
            var lastPosY = e.pageY;
            new Spider(menuHTML,deck,back).stopDrag(e, lastPosX, lastPosY);
        };
        if (data.folded) {
            newCard.className = newCard.className + 'f';
            newCard.innerHTML = `<img id="Card" src="${folder}Backcard/${this.back}.png" width="${w}" height="${h}"/>`;
            if(index){
                newCard.id = 'F' + index
            }
        }
        else {
            newCard.className += data.s + ' n' + data.n + (data.accepting ? ' a' : '');
            newCard.id = `C_${data.s + data.n}`
            newCard.innerHTML = `<img id="Card_${data.s + data.n}" src="${this.folder+data.s}/${displays['n' + data.n] ? displays['n' + data.n] : data.n}.png" width="${w}" height="${h}"/>`;
        }
        return newCard;
    }

    startDrag(e) {
        activeCards = [];
        // console.log(e.target.data)
        // if (e.target.className.indexOf('cd') > -1 && e.target.data.movable) {
        if (e.target.className.indexOf('cd') > -1 && !e.target.data.folded) {
            lastLocation = e.target.parentNode;
            activeCards.push(e.target);
            var grabberCard = activeCards[0].nextElementSibling;
            while (lastLocation.id.indexOf('stack') > -1 && grabberCard !== null) {
                activeCards.push(grabberCard);
                grabberCard = grabberCard.nextElementSibling;
            }
        }
        else if (e.target.className.indexOf('cd f') > -1 && e.target.parentNode.className.indexOf('refuse') > -1) {
            var maxStack = 0;
            var delay = 1;
            var interv = setInterval(fillBoard, 20);
            var menuHTML = this.menuHTML;
            var deck = this.deck
            var back = this.back

            function fillBoard() {
                if (delay === 8 || currentGame.refuse.length === 0) {
                    clearInterval(interv)
                }
                else {
                    delay++;
                    maxStack++;
                    var sortoObject = currentGame.refuse[currentGame.refuse.length - 1];
                    var previousCard = currentGame.stacks['stack' + maxStack][currentGame.stacks['stack' + maxStack].length - 1]
                    currentGame.refuse.pop();
                    sortoObject.folded = false;
                    sortoObject.accepting = true;
                    previousCard.accepting = false
                    // sortoObject.movable = true
                    // if (previousCard.s === sortoObject.s && previousCard.n - 1 === sortoObject.n) {
                    //     previousCard.movable = true
                    // }
                    // else {
                    //     previousCard.movable = false
                    // }
                    currentGame.stacks['stack' + maxStack].push(sortoObject)
                    new Spider(menuHTML,deck,back).renderBoard();
                }
            }
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
            var movingCard = activeCards[0];
            var movingSuit = movingCard.data.s;
            var movingNum = movingCard.data.n;
            var movingColor = movingCard.data.colr;
            var movingStack = movingCard.parentNode.id
            var accepters = document.getElementsByClassName('a');
            // console.log(currentGame.stacks[movingStack])
            // console.log(currentGame.stacks[movingStack][currentGame.stacks[movingStack].length - 2])
            for (var ac = 0; ac < accepters.length; ac++) {
                var accepter = accepters[ac];
                if (accepter.data && accepter.data.id == movingCard.data.id) {
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
                        accepterNode = currentGame.stacks[accepter.id];
                        successfulMove = true;
                        break;
                    } else if (isCloset) {
                        var accepterSuit = accepter.getAttribute('data-suit');
                        if (accepterSuit === movingSuit && movingNum === 13 && activeCards.length === 1) {
                            accepterNode = currentGame.closets[accepter.id];
                            successfulMove = true;
                            break;
                        }
                    } else if (isClosetCard) {
                        var accepterSuit = accepter.data.s;
                        var accepterNum = accepter.data.n;
                        if (accepterSuit === movingSuit && accepterNum - 1 === movingNum && activeCards.length === 1) {
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
                            accepter.data.accepting = false
                            break;
                        }
                        else if (accepter.data.s === movingCard.data.s && accepterNum - 1 === movingNum) {
                            var accepterNode = currentGame.stacks[accepter.parentNode.id];
                            var giverNode = lastLocation.id;
                            successfulMove = true;
                            accepter.data.accepting = false
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
                    // oldStack[oldStack.length - 1].movable = true;
                }
                // if (accepterColor !== movingColor && accepterNum - 1 === movingNum) {
                //     for (var s in accepterNode) {
                //         if (s === accepterNode.length - 1) {
                //             console.log(s)
                //             continue
                //         }
                //         if (accepterNode[s].folded) {
                //             accepterNode[accepterNode.length - 2].movable = false;
                //             console.log(accepterNode[s])
                //         }
                //     } 
                // }
                // else if (accepter.data.s === movingCard.data.s && accepterNum - 1 === movingNum) {
                //     for (var s in accepterNode) {
                //         if (s === accepterNode.length - 1) {
                //             console.log(s)
                //             continue
                //         }
                //         console.log(accepterNode[s])

                //     }
                //     accepterNode[accepterNode.length - 2].movable = true;
                // }

                this.renderBoard();
                this.checkIfFinished();
            } else {
                activeCards = [];
                this.renderBoard();
            }
        }
    }

    checkIfFinished() {
        var isFinished = true;
        for (var re = 0; re < currentGame.refuse.length; re++) {
            if (currentGame.refuse[re].folded) {
                isFinished = false;
            }
        }
        for (var stac in currentGame.stacks) {
            for (var s = 0; s < currentGame.stacks[stac].length; s++) {
                if (currentGame.stacks[stac][s].folded) {
                    isFinished = false;
                }
            }
        }
        if (isFinished) {
            var closs = currentGame.closets;
            var cardsLeft = 52 - (closs['c'].length + closs['d'].length + closs['h'].length + closs['s'].length);
            this.clearBoard(cardsLeft);
        }
    }

    startNewGame() {
        cards = [];
        var game = {
            steps: -28,
            stacks: {
                stack1: [],
                stack2: [],
                stack3: [],
                stack4: [],
                stack5: [],
                stack6: [],
                stack7: []
            },
            refuse: [],
            closets: {
                c: [],
                d: [],
                h: [],
                s: []
            }
        };
        
        //Deck
        for (var s = 0; s < suits.length; s++) {
            for (var c = 1; c < 14; c++) {
                cards.push({
                    suit: suits[s],
                    num: c
                });
            }
        }
        //Shuffle
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        for (var i = 0; i < cards.length; i++) {
            var data = {
                's': cards[i].suit,
                'n': cards[i].num,
                'id': cards[i].suit + cards[i].num,
                'colr': cards[i].suit === 'd' || cards[i].suit === 'h' ? 'r' : 'b',
                'folded': true,
                // 'movable': false,
                'accepting': false
            };
            game.refuse.push(data);
        }

        var maxStack = 0;
        var cardNumb = 1;
        var delay = 1;
        currentGame = game;
        // this.renderBoard();
        var interv = setInterval(fillBoard, 20);
        var menuHTML = this.menuHTML;
        var deck = this.deck
        var back = this.back

        function fillBoard() {
            if (delay === 34) {
                clearInterval(interv)
            } else {
                delay++;
                var sortoObject = game.refuse[game.refuse.length - 1];
                game.refuse.pop();
                maxStack++;
                if (cardNumb > 26 ) {
                    sortoObject.folded = false;
                    sortoObject.accepting = true;
                    // sortoObject.movable = true;
                }
                if (maxStack === 8) {
                    maxStack = 1;
                }
                cardNumb++;
                game.stacks['stack' + maxStack].push(sortoObject)
                currentGame = game;
                new Spider(menuHTML,deck,back).renderBoard();
            }
        }
        // this.availablility()
    }

    renderBoard() {
        document.body.innerHTML = '';
        var outerBoard = document.createElement('div');
        outerBoard.className = 'board clear dark';
        outerBoard.id = "gameboard";
        var board = document.createElement('div');
        board.className = 'inner clear';

        var closets = document.createElement('div');
        closets.className = 'closets-area';
        for (var gc in currentGame.closets) {
            var closet = document.createElement('div');
            var cardsInCloset = currentGame.closets[gc];
            closet.id = gc;
            closet.className = 'closet closet' + gc + (cardsInCloset.length ? '' : ' a');
            closet.innerHTML = icons[gc];
            closet.setAttribute('data-suit', gc);
            for (var c = 0; c < cardsInCloset.length; c++) {
                closet.appendChild(this.renderCard(cardsInCloset[c]));
            }
            closets.appendChild(closet);
        }
        var refuse = document.createElement('div');
        refuse.className = 'refuse-pile len all';
        refuse.id = 'refuse';
        for (var r = 0; r < currentGame.refuse.length; r++) {
            refuse.appendChild(this.renderCard(currentGame.refuse[r], r+1));
        }
        closets.appendChild(refuse);
        board.appendChild(closets);
        var stacks = document.createElement('div');
        stacks.className = 'stacks';
        
        var sn = 0;
        for (var st in currentGame.stacks) {
            sn++;
            var stack = document.createElement('div');
            var childStackCards = currentGame.stacks[st];
            var priorStack = priorGame && priorGame.stacks ? priorGame.stacks[st] : null;

            stack.id = 'stack' + sn;
            stack.className = 'stack len' + childStackCards.length + (childStackCards.length ? '' : ' a');

            for (var f = 0; f < childStackCards.length; f++) {
                stack.appendChild(this.renderCard(childStackCards[f]));
            }
            stacks.appendChild(stack);
        }

        board.appendChild(stacks);
        outerBoard.appendChild(board);

        var isDesktop = window.navigator.appVersion.indexOf('Phone') === -1 && window.navigator.appVersion.indexOf('Mobile') === -1;

        var ratioClass = ' portrait';
        var browserColor = '000000';
        outerBoard.className = outerBoard.className + ratioClass + (isDesktop ? ' desktop' : ' mobile');
        document.getElementById('metaColor').setAttribute("content", "#" + browserColor);
        document.getElementById('metaWidth').setAttribute("content", "width=530,user-scalable=no");
        document.body.innerHTML = this.menuHTML;
        var buttons = document.getElementById('DropBox');
        buttons.style.backgroundImage = `url("${folderMenu}Menu.png")`;
        document.body.appendChild(outerBoard);
    }

    clearBoard(cards) {
        var delay = 0;
        var finishingInterval = setInterval(wipeBoard, 100);
        var menuHTML = this.menuHTML;
        var deck = this.deck
        var back = this.back

        function wipeBoard() {
            if (delay >= (cards - 1)) {
                clearInterval(finishingInterval);
                document.getElementById("gameboard").innerHTML = '<div class="won"><h1>You won!</h1><button id="Spider">Start new game</button></div>';
            } else {
                for (var clos in currentGame.closets) {
                    var lastCloseted = currentGame.closets[clos].length ? currentGame.closets[clos][currentGame.closets[clos].length - 1] : {'s': clos, 'n': 0};
                    for (var stac in currentGame.stacks) {
                        var lastStacked = currentGame.stacks[stac][currentGame.stacks[stac].length - 1];
                        var lastRefused = currentGame.refuse[currentGame.refuse.length - 1];
                        if (lastStacked && lastStacked.s == lastCloseted.s && lastStacked.n === lastCloseted.n + 1) {
                            currentGame.stacks[stac].pop();
                            currentGame.closets[clos].push(lastStacked);
                            delay++;
                            break;
                        } else if (lastRefused && lastRefused.s == lastCloseted.s && lastRefused.n === lastCloseted.n + 1) {
                        currentGame.refuse.pop();
                        currentGame.closets[clos].push(lastRefused);
                        delay++;
                        break;
                        }
                    }
                }
                new Spider(menuHTML,deck,back).renderBoard();
            };
        }
    }

    availablility(){
        var stacks = ['stack1','stack2','stack3','stack4','stack5','stack6','stack7']
        for (var stac in currentGame.stacks) {
            console.log(currentGame.stacks[stac])
            console.log(currentGame.stacks[stac])
            for (var s = 0; s < currentGame.stacks[stac].length; s++) {
                console.log(stac)
                if (currentGame.stacks[stac][s].folded) {
                    isFinished = false;
                }
            }
        }
    }
}
