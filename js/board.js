import Solitaire from "./solitaire.js"
import Spider from "./spider.js"
// import Solitaire from "./solitaireNew.js"
// import iu from "./image_uploader.js"
// var folder = 'file:///C:/Users/fffar/Dropbox/Professional/Android/Pictures/Cards/'
// var folder = '../Cards/'
// var folder = 'Images/'
var loc = window.location.pathname;
var folder = loc.substring(0,loc.lastIndexOf('index.html')) + '/Cards/';
// var folder = loc.substring(0,loc.lastIndexOf('Solitaire')) + '/Cards/';

console.log('starting...');
var games = ['Solitaire','Spider','OchoLoco','Carioca']
var deck = '1'
var back = '1'
var background = '1'
var file = `url("${folder}Deck/Background/${background}.png")`
var implemented = ['Solitaire','Spider']
var inFrameBoard = ['Games','Appearance','Options','Background','BackCard','FrontCard','Solitaire','Spider']
var inAppearanceFront = ['ClassicFront1','ClassicFront2','ClassicFront3','PlusFront']
var inAppearanceBack = ['Deck1','Deck2','Deck3','Deck4','Deck5','PlusBack']
var inAppearanceBackground = ['Background1','Background2']
var inAppearance = inAppearanceFront + inAppearanceBack + inAppearanceBackground

//image uploader
var iu = {
    target: 'ajax/upload.php',
    init: function(cxt,url){
		this.target=url;
        iu.button = cxt;
        var form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('enctype', 'multipart/form-data');
        iu.input = document.createElement('input');
        iu.input.type = 'file';
        iu.input.name = 'img';
        iu.input.id = 'hiddenFileInput';
        form.appendChild(iu.input);
        iu.button.parentNode.appendChild(form);
        form.style.display = 'none';// if we hide the form, a bug appears in chrome.
        iu.button.addEventListener('click', iu.buttonClick, false);
    },
    handle: function(e) {
        if (e.preventDefault != undefined){
            e.preventDefault();
            console.log(e.target.files[0])
        }
        iu.upload(0);
    },
    
    upload: function(id){
        var file = iu.input.files[id];
        var request = new XMLHttpRequest();
        request.open('POST', iu.target+'&name='+encodeURIComponent(file.name), true);
        iu.inProgress(file);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.setRequestHeader('X-File-Name', 'ff');
        request.setRequestHeader('Content-Type', 'application/octet-stream');
        request.send(file);
        request.onreadystatechange = function() {
            if (request.readyState==4 &&(request.status == 200 || request.status == 304))
                iu.success(request.responseText);
            /*else
                iu.error(status.status);*/
        }
        var new_img = URL.createObjectURL(file)
        define_background(new_img)
        frameBoard()
    },
    buttonClick: function(){
        document.getElementById('hiddenFileInput').click();
        document.getElementById('hiddenFileInput').addEventListener('change', iu.handle, false);
    },
    error: function(msg){
        alert('error:'+msg);
        return false;
    },
    inProgress: function(){
        console.log('Please wait...');
    },
};


function frameBoard(screen = 'Games') {
    document.body.style.backgroundImage  = file
    document.body.id = 'background'
    // document.body.style.backgroundImage  = `url("${folder}Deck/Background/${background}.png")`
    var menuHTML = '';
    menuHTML += '<div class="navbar">';
    menuHTML += '<div class="dropdown">';
    menuHTML += '<button class="dropbtn" id="DropBox"></button>';
    menuHTML += '<div class="dropdown-content" id="myDropdown">';
    menuHTML += '<a href="#Games"><button id="Games">Games</button></a>';
    menuHTML += '<a href="#Appearance"><button id="Appearance">Appearance</button></a>';
    menuHTML += '<a href="#Options"><button id="Options">Options</button></a>';
    menuHTML += '</div></div></div>';
    document.body.innerHTML = menuHTML;
    var buttons = document.getElementById('DropBox');
    buttons.style.backgroundImage = `url("${folder}Menu.png")`;
    if (screen === 'Games'){ renderBoard() }
    if (screen === 'Appearance'){ renderAppearance() }
    if (screen === 'Options'){ renderOptions() }
    if (screen === 'Background'){ renderBackground() }
    if (screen === 'BackCard'){ renderBackCard() }
    if (screen === 'FrontCard'){ renderFrontCard() }
    if (screen === 'Solitaire') { new Solitaire(menuHTML,deck,back).startNewGame(); }
    if (screen === 'Spider') { new Spider(menuHTML,deck,back).startNewGame(); }
}

function define_background (new_background, classic = false) {
    if (classic) {
        file = `url("${folder}Deck/Background/${new_background}.png")`
    }
    else {
        file = `url(${new_background})`;
    }
}

function appearanceOptions (option) {
    if (inAppearanceFront.includes(option)) {
        if (!option.includes('Plus')){
            deck = option[option.length - 1]
            frameBoard()
        }
    }
    if (inAppearanceBack.includes(option)) {
        if (!option.includes('Plus')){
            back = option[option.length - 1]
            frameBoard()
        }
    }
    if (inAppearanceBackground.includes(option)) {
        if (!option.includes('Plus')){
            background = option[option.length - 1]
            define_background(background, true)
            frameBoard()
        }
    }
}

function cardBoard (icons) {
    var htmls = '';
    htmls += '<div class="grid-container">';
    for (var i in icons) {
        var extra = ''
        if (!implemented.includes(icons[i])){
            extra = ' soon'
        }
        htmls += `<div class="grid-item-${i%2 === 0 ? 'r':'l'}">`;
        htmls += `<div id="start-${icons[i].toLowerCase()}" class="games${extra}">`;
        htmls += `<button id="${icons[i]}">${icons[i]}</button>`;
        htmls += '</div></div>';
    }
    return htmls
}

function renderBoard() {
    document.body.innerHTML += '<h1>Card Games</h1>';
    var htmls = cardBoard(games);
    document.body.innerHTML += htmls + '</div>';
    for (var i in games) {
        var buttons = document.getElementById(games[i]);
        buttons.style.backgroundImage = `url("${folder+games[i]}.jpg")`;
    }
}

function renderAppearance() {
    implemented.push('FrontCard','BackCard','Background');
    var htmls = cardBoard(['BackCard','FrontCard','Background']);
    document.body.innerHTML += htmls;
    var buttons = document.getElementById('BackCard');
    buttons.style.backgroundImage = `url("${folder}card_back.png")`;
    var buttons = document.getElementById('FrontCard');
    buttons.style.backgroundImage = `url("${folder}Collage.png")`;
    var buttons = document.getElementById('Background');
    buttons.style.backgroundImage = `url("${folder}Deck/Background/1.png")`;
}

function renderOptions() {
    var htmls = cardBoard(['Sound','Animation','Difficulty']);
    document.body.innerHTML += htmls;
}
function renderBackground() {
    implemented.push('Background1','Background2');
    var htmls = cardBoard(['Background1','Background2','PlusBackground']);
    document.body.innerHTML += htmls;
    var buttons = document.getElementById('Background1');
    buttons.style.backgroundImage = `url("${folder}Deck/Background/1.png")`;
    var buttons = document.getElementById('Background2');
    buttons.style.backgroundImage = `url("${folder}Deck/Background/2.png")`;
    var buttons = document.getElementById('PlusBackground');
    buttons.style.backgroundImage = `url("${folder}Plus.png")`;
    iu.init(buttons,'ajax/upload.php');
}
function renderBackCard() {
    var backCards = ['Deck1','Deck2','Deck3','Deck4','Deck5','PlusBack']
    implemented.push(...backCards.slice(0,backCards.length - 1));
    var htmls = cardBoard(backCards);
    document.body.innerHTML += htmls;
    for (let b in backCards.slice(0,backCards.length - 1)) {
        var buttons = document.getElementById(backCards[b]);
        buttons.style.backgroundImage = `url("${folder}Deck/Backcard/${backCards[b][backCards[b].length-1]}.png")`;
    }
    var buttons = document.getElementById('PlusBack');
    buttons.style.backgroundImage = `url("${folder}Plus.png")`;
}
function renderFrontCard() {
    var frontCards = ['ClassicFront1','ClassicFront2','ClassicFront3','PlusFront']
    implemented.push(...frontCards.slice(0,frontCards.length - 1));
    var htmls = cardBoard(frontCards);
    document.body.innerHTML += htmls;
    for (let f in frontCards.slice(0,frontCards.length - 1)) {
        var buttons = document.getElementById(frontCards[f]);
        buttons.style.backgroundImage = `url("${folder}Deck/FrontCardCollage/${frontCards[f][frontCards[f].length-1]}.png")`;
    }
    var buttons = document.getElementById('PlusFront');
    buttons.style.backgroundImage = `url("${folder}Plus.png")`;
}

document.addEventListener('click', function(e) {
    if (e.target.id === 'OchoLoco' || e.target.id === 'Carioca' || e.target.id === 'Sound' || e.target.id === 'Animation' ||  e.target.id === 'Difficulty') {
        alert("Not implemented yet");
        console.log('Not implemented yet');
        return false;
    }
    if (e.target.id === 'DropBox') {
        document.getElementById("myDropdown").classList.toggle("show");
        return false;
    }
    if (inFrameBoard.includes(e.target.id)) {
        frameBoard(e.target.id)
        return false;
    }
    if (inAppearance.includes(e.target.id)) {
        appearanceOptions(e.target.id)
        return false;
    }
});

window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
            openDropdown.classList.remove('show');
        }
      }
    }
}

frameBoard()