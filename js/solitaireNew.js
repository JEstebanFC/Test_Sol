import Card from "./cards.js"
var loc = window.location.pathname;
var folderMenu = loc.substring(0,loc.lastIndexOf('index.html')) + '/Cards/';

var folder = folderMenu + 'Deck/'
var cards = [];
var suits = ['h', 's', 'c', 'd'];
var icons = {
    h: `<div class="icon heart"><img src="${folder}Heart.png" width="30" height="30"/></div>`,
    s: `<div class="icon spade"><img src="${folder}Spade.png" width="30" height="30"/></div>`,
    c: `<div class="icon club"><img src="${folder}Club.png" width="30" height="30"/></div>`,
    d: `<div class="icon diamond"><img src="${folder}Diamonds.png" width="30" height="30"/></div>`
};
var currentGame = {};
var priorGame = {};

export default class Solitaire {
    constructor(menuHTML = '', deck = '1', back = '1') {
        this.menuHTML = menuHTML;
        this.deck = deck
        if (this.deck[this.deck.length - 1] !== '/'){
            this.deck += '/'
        }
        this.back = back
        this.folder = folder + this.deck
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
                stack7: [],
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
                'accepting': false
            };
            game.refuse.push(data);
        }

        var maxStack = 0;
        var nextStack = 2;
        var delay = 1;
        currentGame = game;
        this.renderBoard();
        var interv = setInterval(fillBoard, 100);
        var menuHTML = this.menuHTML;
        var deck = this.deck
        var back = this.back

        function fillBoard() {
            if (delay === 29) {
                clearInterval(interv)
            } else {
                delay++;
                var sortoObject = game.refuse[game.refuse.length - 1];
                game.refuse.pop();
                maxStack++;
                if (maxStack === 8 || maxStack === 1) {
                    sortoObject.folded = false;
                    sortoObject.accepting = true;
                }
                if (maxStack === 8) {
                    maxStack = nextStack;
                    nextStack++;
                }
                if (nextStack < 9) {
                    game.stacks['stack' + maxStack].push(sortoObject)
                }
                currentGame = game;
                new Solitaire(menuHTML,deck,back).renderBoard();
            }
        }
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

    clearBoard(cards) {
        var delay = 0;
        var finishingInterval = setInterval(wipeBoard, 200);
        var menuHTML = this.menuHTML;
        var deck = this.deck
        var back = this.back

        function wipeBoard() {
            if (delay >= (cards - 1)) {
                clearInterval(finishingInterval);
                document.getElementById("gameboard").innerHTML = '<div class="won"><h1>You won!</h1><button id="Solitaire">Start new game</button></div>';
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
                new Solitaire(menuHTML,deck,back).renderBoard();
            };
        }
    }
}
