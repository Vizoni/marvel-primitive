
var baseURL = "https://gateway.marvel.com/v1/public";
var params = {
    ts: "2018-28-01",
    apikey: "bd30d01dd66350572cf4c8ca5e9e8478",
    hash: "3a5f4625645461019c47335ca4030b4c",
    limit: 3,
    offset: 0
}

var tableNotResponsive = document.getElementById("heroes-table");
var tableResponsive = document.getElementById("heroes-table-responsive");

var currentPageNumber = 1;

var heroesList = [];

var selectedHero = [];

var raphael;

function setFinalUrlForAPI(apiSection) {
    return baseURL + apiSection + "?ts=" + params.ts + "&apikey=" + params.apikey + "&hash=" + params.hash + "&limit=" + params.limit + "&offset=" + params.offset;
}

function changeClassOfSelectedHero() {
    // var tds = document.getElementsByClassName("hero-info-td");
    // for(var i = 0; i < tds.length; i++) {
    //     tds[i].className = "hero-info-td selectedHero";
    // }
}

function changePage(numberOfPage) {
    // ajusat css dos botões da página atual
    var oldPage = document.getElementById("page" + currentPageNumber);
    oldPage.className = "pagination-number";
    var newPage = document.getElementById("page" + numberOfPage);
    newPage.className = "selected-pagination-number";

    // o parametro offset é para pular os X primeiros resultados da pesquisa (usado na paginação)
    params.offset = (numberOfPage - 1) * params.limit;
    currentPageNumber = numberOfPage;;
    deleteTable();
    httpGetAsync("/characters", populateTableWithHeroes)
}

function nextPage() {
    changePage(currentPageNumber + 1);
    var paginationDiv = document.getElementById("pagination-div");
    for(var i = 0; i < paginationDiv.childNodes.length; i++) {
        if ( paginationDiv.childNodes[i].tagName == "DIV") {
            var pageNumberDiv = paginationDiv.childNodes[i]
            if (pageNumberDiv.id == "page"+currentPageNumber) {
                if (!document.getElementById("page"+(currentPageNumber+1))) {
                    var newPageDiv = document.createElement("div");
                    newPageDiv.className = "pagination-number";
                    newPageDiv.innerText = currentPageNumber+1;
                    newPageDiv.id = "page"+(currentPageNumber+1);
                    newPageDiv.setAttribute('onclick', "changePage("+(currentPageNumber+1)+")");
                    paginationDiv.appendChild(newPageDiv);
                }  else {
                    document.getElementById("page"+(currentPageNumber+1)).style = "display: block"
                }
                if (currentPageNumber > 2) {
                    var oldPages = document.getElementById("page"+(currentPageNumber-2));
                    oldPages.style = "display: none"
                }
            }
        }
    }
}

function backPage() {
    if (currentPageNumber != 1) {
        changePage(currentPageNumber - 1);
    }
}

function getAllHeroes() {
    httpGetAsync("/characters", populateTableWithHeroes);
}

getAllHeroes()

function getCurrentTable() {
    /* verificação para ver qual a tabela atual */
    if (!tableNotResponsive) {
        return false
    }
    if (getComputedStyle(tableNotResponsive, null).display == "table") {
        return tableNotResponsive
    } else {
        return tableResponsive;
    }
}

function httpGetAsync(apiSector, callback) {
    theUrl = setFinalUrlForAPI(apiSector);
    // theUrl = "https://gateway.marvel.com/v1/public/characters?ts=2018-28-01&apikey=bd30d01dd66350572cf4c8ca5e9e8478&hash=3a5f4625645461019c47335ca4030b4c";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function populateTableWithHeroes(apiResponse) {
    heroesList = apiResponse.data.results
    generateTable(apiResponse.data.results);
}

function generateTable(data) {

    var table = getCurrentTable();
    if (!table || table === undefined) {
        return false;
    }
    var tableBody = document.createElement('TBODY')

    table.appendChild(tableBody);

    // se for tabela responsiva
    if (table.id === "heroes-table-responsive") {
        for (i = 0; i < data.length; i++) {
            var tr = document.createElement('TR');
            for (var key in data[i]) {
                var tdPersonagem = document.createElement('TD')
                var heroImage = document.createElement('IMG');
                var heroName = document.createElement('A');
                tdPersonagem.className = "hero-info-td"
                heroImage.className = "hero-image"
                heroImage.src = data[i]['thumbnail'].path + "." + data[i]['thumbnail'].extension;
                heroName.className = "hero-name"
                heroName.innerText = data[i]['name']
                heroName.addEventListener("click", function (data) {
                    raphael = data.target.innerText;
                    getSelectedHeroDetails();
                }, false)
                tdPersonagem.appendChild(heroImage);
                tdPersonagem.appendChild(heroName);
            }
            tr.appendChild(tdPersonagem)
            tableBody.appendChild(tr);
        }
    } else {
        for (i = 0; i < data.length; i++) {
            var tr = document.createElement('TR');
            for (var key in data[i]) {
                // laço para passar por cada atributo do objeto vindo da array de heróis da api
                if (key == "thumbnail") {
                    // cria a coluna personagem com imagem e nome
                    var tdPersonagem = document.createElement('TD')
                    var heroImage = document.createElement('IMG');
                    var heroName = document.createElement('SPAN');
                    heroImage.className = "hero-image"
                    heroImage.src = data[i][key].path + "." + data[i][key].extension;
                    heroName.className = "hero-name"
                    heroName.innerText = data[i]['name']
                    heroName.addEventListener("click", function (data) {
                        raphael = data.target.innerText;
                        getSelectedHeroDetails();
                    }, false)
                    tdPersonagem.appendChild(heroImage);
                    tdPersonagem.appendChild(heroName);
                    tr.appendChild(tdPersonagem)
                }
                if (key == "series") {
                    // cria a coluna series listando apenas as 3 primeiras
                    var tdSeries = document.createElement('TD')
                    tdSeries.className = "hero-info-td"
                    for (var x = 0; x < 2; x++) { // limite de 3
                        var spanSerie = document.createElement('TD')
                        spanSerie.className = "hero-info"
                        if (data[i][key].items.length > 0 && data[i][key].items[x].name) {
                            spanSerie.appendChild(document.createTextNode(data[i][key].items[x].name));
                        } else {
                            spanSerie.appendChild(document.createTextNode("")) // fica vazio
                        }
                        tdSeries.appendChild(spanSerie)
                    }
                    tr.appendChild(tdSeries)
                }
                if (key == "events") {
                    // cria a coluna events listando apenas as 3 primeiras
                    var tdEvents = document.createElement('TD')
                    tdEvents.className = "hero-info-td"
                    if (data[i][key].items.length > 0) {
                        var spanEvent = document.createElement('TD')
                        spanEvent.className = "hero-info"
                        for (var x = 0; x < data[i][key].items.length && x < 2; x++) {
                            spanEvent.appendChild(document.createTextNode(data[i][key].items[x].name));
                        }
                        tdEvents.appendChild(spanEvent)
                    }
                    tr.appendChild(tdEvents)
                }
            }
            tableBody.appendChild(tr);
        }
    }
}

function getSelectedHeroDetails() {
    for (var i = 0; i < heroesList.length; i++) {
        if (raphael === heroesList[i].name) {
            selectedHero = heroesList[i];
            var resp= heroesList[i];
            break;
        }
    }
    goToDetailsOfHero();
}

function closeHeroDetails() {
    var body = document.getElementsByTagName('BODY')[0];
    for (var i = 0; i < body.childNodes.length; i++) {
        if(body.childNodes[i].id === "hero-detail") {
            body.removeChild(body.childNodes[i]);
        }
    }
}

function generateHeroDetails() {
    closeHeroDetails();
    var body = document.getElementsByTagName('BODY')[0];
    var divHeroDetail = document.createElement('div');
    divHeroDetail.id = "hero-detail"
    divHeroDetail.className = "hero-detail display-content"
    body.appendChild(divHeroDetail);

    var div2 = document.createElement('div');
    div2.style = "margin: 12px 30px 12px 30px";
    divHeroDetail.appendChild(div2);

    var imgHero = document.createElement('img')
    imgHero.id = "hero-image";
    imgHero.className = "hero-image";
    div2.appendChild(imgHero);

    var spanHeroName = document.createElement('span');
    spanHeroName.id = "hero-name";
    spanHeroName.className = "light-title name";
    div2.appendChild(spanHeroName);

    var spanCloseButton = document.createElement('span');
    spanCloseButton.id = "close-button";
    spanCloseButton.setAttribute("type", "button");
    spanCloseButton.setAttribute("onclick", "closeHeroDetails()");
    spanCloseButton.innerText = "X";
    div2.appendChild(spanCloseButton);

    var br1 = document.createElement('br');
    div2.appendChild(br1);

    var divEvents = document.createElement('DIV');
    divEvents.className = "series";
    div2.appendChild(divEvents);

    var spanEvents = document.createElement('SPAN');
    spanEvents.className = "light-title";
    spanEvents.style = "font-weight: 500";
    spanEvents.innerText = "Eventos que participou:";
    divEvents.appendChild(spanEvents);

    var ulEvents = document.createElement("UL");
    ulEvents.id = "events-list";
    divEvents.appendChild(ulEvents)
    
    // var br2 = document.createElement('br');
    // ulEvents.appendChild(br2);
    
    var divSeries = document.createElement('DIV');
    divSeries.className = "series";
    div2.appendChild(divSeries);
    
    var spanSeries = document.createElement('SPAN');
    spanSeries.className = "light-title";
    spanSeries.style = "font-weight: 500";
    spanSeries.innerText = "Séries que participou:";
    divSeries.appendChild(spanSeries);
    
    
    var ulSeries = document.createElement("UL");
    ulSeries.id = "series-list";
    divSeries.appendChild(ulSeries)
    
    // var br3 = document.createElement('br');
    // ulSeries.appendChild(br3);

}

function goToDetailsOfHero() {
    window.location.replace("#hero-detail");
    generateHeroDetails()
    var heroDetailDiv = document.getElementById("hero-detail")
    if (heroDetailDiv.className == "hero-detail hide-content") {
        heroDetailDiv.className = "hero-detail display-content"
    }
    var heroImage = document.getElementById("hero-image");
    heroImage.src = selectedHero.thumbnail.path + "." + selectedHero.thumbnail.extension;
    var heroName = document.getElementById("hero-name");
    heroName.innerText = selectedHero.name

    for (var i = 0; i < selectedHero.series.items.length; i++) {
        if (selectedHero.series.items[i]) {
            var li = document.createElement('LI');
            li.innerText = selectedHero.series.items[i].name;
            li.className = "basic-text";
            document.getElementById("series-list").appendChild(li);
        }
    }

    for (var i = 0; i < selectedHero.events.items.length; i++) {
        if (selectedHero.series.items[i]) {
            var li = document.createElement('LI');
            li.innerText = selectedHero.events.items[i].name;
            li.className = "basic-text";
            document.getElementById("events-list").appendChild(li);
        }
    }

}

function deleteTable() {
    var table = getCurrentTable();

    while (table.childNodes[2].childNodes.length != 0) {
        table.childNodes[2].removeChild(table.childNodes[2].firstChild)
    }
    table.removeChild(table.childNodes[2])
}

function filterHeroesList() {
    var input, filter, table, tr, td, i;
    var table = getCurrentTable();

    input = document.getElementById("search-hero-name");
    filter = input.value.toUpperCase();
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
