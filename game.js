var value = 0;

var lastId = "NULL";

var hMove = 3;
var vMove = 3;
var dMove = 2;

var numRighe = 10;
var numColonne = 10;

var dimensioneMax = 60;
var dimensioneMin = 15;

var curr_language = "it_IT";

var availableLanguage = ["it_IT","en_US","es_ES"];

/*
ordine del vettore
GIU
DESTRA
SU
SINISTRA
GIU_DES
SU_DES
GIU_SIN
SU_SIN
*/

var regoleGioco = [
    [hMove, 0],
    [0, vMove],
    [-hMove, 0],
    [0, - vMove],
    [dMove, dMove],
    [-dMove, dMove],
    [dMove, - dMove],
    [-dMove, - dMove]
];


var vettoreConsentiti = [];

var moveHistory = [];

var undoMode = false;

var autoCompleteOnOne = true;

var numeroPossiblita = numColonne * numRighe;

///Ritorna vettore [riga,colonna]
var decodificaId = function(id)
{
    "use strict";
    var coords = id.split("_");

    return [parseInt(coords[1]), parseInt(coords[2])];
};

var calcolaVettoreConsentitoByCoord = function(coordinate)
{
    "use strict";
    vettoreConsentiti = [];
    numeroPossiblita = 0;
    for (var riga = 0; riga < regoleGioco.length; riga++)
    {
        vettoreConsentiti.push(cellaCliccabile(coordinate[0] + regoleGioco[riga][0], coordinate[1] + regoleGioco[riga][1]));
    }
};

var calcolaVettoreConsentito = function(id)
{
    "use strict";
    calcolaVettoreConsentitoByCoord(decodificaId(id));
};


var cellaCliccabile = function(newRiga, newColonna)
{
    "use strict";
    if (newRiga > 0 && newRiga <= numRighe && newColonna > 0 && newColonna <= numColonne)
    {
        var id = "button_" + newRiga + "_" + newColonna;
        var curr = $("#" + id);

        if (curr.text() == "\xa0")
        {
            numeroPossiblita++;
            return (id);
        }
    }
    return ("NULL");
};

var aggiornaCelleConsentite = function()
{
    "use strict";
    for (var cella = 0; cella < vettoreConsentiti.length; cella++)
    {
        if (vettoreConsentiti[cella] != "NULL")
        {
            consentiCella(vettoreConsentiti[cella]);
        }
    }
};

var consentiCella = function(id)
{
    "use strict";
    var curr = $("#" + id);
    curr.removeClass("btn-secondary").addClass("btn-primary");
    curr.removeAttr("disabled");
};

var ricalcolaSetup = function()
{
    "use strict";
    //setto tutto no
    for (var i = 1; i <= numRighe; i++)
    {
        //console.log("ciclo i: " + i);
        for (var j = 1; j <= numColonne; j++)
        {
            //console.log("ciclo j: " + j);
            var id = "button_" + i + "_" + j;
            var curr = $("#" + id);

            //console.log(curr.text());

            if (curr.text() == "\xa0")
            {
                curr.removeClass("btn-primary").addClass("btn-secondary");
                curr.attr("disabled", "disabled");

                //console.log("cambio classi del " + id);
            }
        }
    }

    calcolaVettoreConsentito(lastId);

    if (numeroPossiblita === 0) fineDelGioco();

    aggiornaCelleConsentite();

    if (autoCompleteOnOne && numeroPossiblita == 1 && undoMode === false) autoCompleteOne();
};

var autoCompleteOne = function()
{
    "use strict";
    for (var cella = 0; cella < vettoreConsentiti.length; cella++)
    {
        if (vettoreConsentiti[cella] != "NULL")
        {
            $("#" + vettoreConsentiti[cella]).click();
            return;
        }
    }
};



var autoSolve = function()
{
    "use strict";

    var algoritmo = $("#algoritmo")[0].value;

    if(lastId == "NULL") {
        alert(dictionary[curr_language]["SELECTALG"]);
        return;
    }

    console.log("uso algoritmo "+ algoritmo);

    var trovato = true;
    var ordine_tentativo = [0,1,2,3,4,5,6,7];

    while(trovato === true)
    {
        trovato = false;

        //Definizione dell'algoritmo di scelta
        switch(algoritmo)
        {
        case "0":
            break;
        case "1":
            /*RANDOM*/

            var currentIndex = ordine_tentativo.length, temporaryValue, randomIndex;

            // While there remain elements to shuffle...
            while (0 !== currentIndex) {

                // Pick a remaining element...
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;

                // And swap it with the current element.
                temporaryValue = ordine_tentativo[currentIndex];
                ordine_tentativo[currentIndex] = ordine_tentativo[randomIndex];
                ordine_tentativo[randomIndex] = temporaryValue;
            }
            break;
        case "2":
            //Preferenzia stare "lontano" dal centro
            var massimoAttuale = 0, coords, massimo;
            //ciclo su tutti e calcolo il massimo come (coor_x-size/2)^2 + (coor_x-size/2)^2
            for (var prog = 0; prog < vettoreConsentiti.length; prog++)
            {
                if (vettoreConsentiti[prog] != "NULL")
                {
                    coords = decodificaId(vettoreConsentiti[prog]);
                    massimo = Math.pow((coords[0]-(parseInt(numRighe)+1)/2),2) + Math.pow((coords[1]-(parseInt(numColonne)+1)/2),2);

                    if(massimo > massimoAttuale)
                    {
                        massimoAttuale = massimo;
                        ordine_tentativo.unshift(prog);
                    }
                    else
                    {
                        ordine_tentativo.push(prog);
                    }
                }
            }

            break;
        case "3":
            /*horizontal*/
            ordine_tentativo = [0,1,2,3,4,5,6,7];
            break;
        case "4":
            /*diagonal*/
            ordine_tentativo = [4,5,6,7,0,1,2,3];
            break;
        };

        //Scelta e click sul bottone
        for (var prog = 0; prog < ordine_tentativo.length; prog++)
        {
            if (vettoreConsentiti[ordine_tentativo[prog]] != "NULL")
            {
                console.log("click " + vettoreConsentiti[ordine_tentativo[prog]]);
                $("#" + vettoreConsentiti[ordine_tentativo[prog]]).click();
                trovato = true;
                break;
            }
        }
    }

};

var fineDelGioco = function()
{
    "use strict";
    var frase = dictionary[curr_language]["FRASE_FINE"]
            .replace("{value}", value)
            .replace("{maxValue}", (numRighe * numColonne))
            .replace("{numR}", numRighe)
            .replace("{numC}", numColonne);

    $("#winPhrase").text(frase);


    var options = {};
    $("#ModalVictory").modal(options);

    $(".endbutton").show();
};

var shareOnFacebook = function()
{
    "use strict";
    var href = "https://www.facebook.com/sharer/sharer.php?" + "u=https://migius.github.io/SquareBox/";
    window.open(href, "Share on Twitter");
};

var shareOnTwitter = function()
{
    "use strict";
    var href = "https://twitter.com/share?" + "url=https%3A%2F%2Fmigius.github.io%2FSquareBox%3Fr%3D" + numRighe + "%26c%3D" + numColonne + "%26l%3D" + curr_language + "&via=brunimichele&" + "hashtags=SquareBox&" + "text=" + "Ho raggiunto un punteggio di " + value + " su " + (numRighe * numColonne) + " (" + numRighe + "x" + numColonne + ") a SquareBox!";
    window.open(href, "Share on Twitter");
};


var buidSchema = function()
{
    "use strict";
    var conteiner = $("#gameConteiner")[0];

    conteiner.setAttribute("style", "max-width: " + (dimensioneMax*numColonne) + "px;min-width: " + (dimensioneMin*numColonne)  + "px;width:100%;padding-right: 0px;padding-left: 0px;");

    while (conteiner.lastChild)
    {
        conteiner.removeChild(conteiner.lastChild);
    }

    for (var r = 1; r <= numRighe; r++)
    {
        var divRow = document.createElement("div");
        divRow.setAttribute("class", "row");

        for (var c = 1; c <= numColonne; c++)
        {
            var divButton = document.createElement("button");
            divButton.setAttribute("class", "btn btn-primary game-cell");
            divButton.setAttribute("type", "button");
            divButton.setAttribute("onclick", "select(this.id)");
            divButton.setAttribute("id", "button_" + r + "_" + c);

            divButton.setAttribute("style", "max-width: " + dimensioneMax + "px;width: " + (100.0 / numColonne) + "%;min-width: " + dimensioneMin  + "px");

            divRow.appendChild(divButton);

        }
        conteiner.appendChild(divRow);
    }

    restart();
};

var select = function(id)
{
    "use strict";
    if(lastId != "NULL")
    {
        $("#" +lastId).removeClass("btn-danger").addClass("btn-success");
    }

    value++;
    lastId = id;
    moveHistory.push(id);
    var curr = $("#" + id);
    curr.text("" + value);
    curr.removeClass("btn-primary").addClass("btn-danger");
    curr.attr("disabled", "disabled");

    undoMode = false;
    ricalcolaSetup();
};

var undo = function()
{
    "use strict";
    var curr = $("#" + lastId);
    curr.removeClass("btn-danger").addClass("btn-secondary");
    curr.attr("disabled", "disabled");
    curr.text("\xa0");
    value--;

    moveHistory.splice(-1,1);

    if(moveHistory.length > 0) 
    {
        lastId = moveHistory[moveHistory.length-1];
        $("#" + lastId).removeClass("btn-success").addClass("btn-danger");

        undoMode = true;
        ricalcolaSetup();
    }
    else
    {
        restart();
    }
};


var restart = function()
{
    "use strict";
    //setto tutto no
    for (var i = 1; i <= numRighe; i++)
    {
        //console.log("ciclo i: " + i);
        for (var j = 1; j <= numColonne; j++)
        {
            //console.log("ciclo j: " + j);
            var id = "button_" + i + "_" + j;
            var curr = $("#" + id);

            curr.removeClass("btn-success").removeClass("btn-secondary").addClass("btn-primary");
            curr.removeAttr("disabled");
            curr.text("\xa0");
            value = 0;
        }
    }
    $(".endbutton").hide();
    lastId = "NULL";
    moveHistory = [];
};

var QueryString = function()
{
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++)
    {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined")
        {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
            // If second entry with this name
        }
        else if (typeof query_string[pair[0]] === "string")
        {
            var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        }
        else
        {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

var setDefault = function()
{
    "use strict";
    if (QueryString.l === undefined)
    {
        //document.getElementById("numColonne").value = numColonne;
        //TODO: setta campo lingua
    }
    else
    {
        //TODO: setta campo lingua
        //document.getElementById("numColonne").value = QueryString.c;
        curr_language = QueryString.l;
    }

    setLanguage(curr_language);

    document.getElementById("Autocomplete").checked = autoCompleteOnOne;
    if (QueryString.r === undefined)
    {
        document.getElementById("numRighe").value = numRighe;
    }
    else
    {
        document.getElementById("numRighe").value = QueryString.r;
        numRighe = QueryString.r;
    }
    if (QueryString.c === undefined)
    {
        document.getElementById("numColonne").value = numColonne;
    }
    else
    {
        document.getElementById("numColonne").value = QueryString.c;
        numColonne = QueryString.c;
    }
};

var createEvents = function()
{
    "use strict";
    $("#Autocomplete").change(function()
    {
        autoCompleteOnOne = document.getElementById("Autocomplete").checked;
    });
    $("#numRighe").change(function()
    {
        numRighe = document.getElementById("numRighe").value;
    });
    $("#numColonne").change(function()
    {
        numColonne = document.getElementById("numColonne").value;
    });

    $(document).keydown(function(e) {
    	if(vettoreConsentiti.length > 0)
    	{
	        switch(e.which) {
    	        case 37: //left
                	if(vettoreConsentiti[3] != "NULL")
            	    {
                        console.log("l -> go l");
        	            $("#" + vettoreConsentiti[3]).click();
	                }
	                else if(vettoreConsentiti[6] != "NULL" && vettoreConsentiti[7] == "NULL")
	                {
        	            $("#" + vettoreConsentiti[6]).click();
	                }
	                else if(vettoreConsentiti[6] == "NULL" && vettoreConsentiti[7] != "NULL")
	                {
        	            $("#" + vettoreConsentiti[7]).click();
	                }
                    break;
    	        case 38: //up
	                if(vettoreConsentiti[2] != "NULL")
                	{
                        console.log("u -> go u");
            	        $("#" + vettoreConsentiti[2]).click();
    	            }
	                else if(vettoreConsentiti[5] != "NULL" && vettoreConsentiti[7] == "NULL")
	                {
        	            $("#" + vettoreConsentiti[5]).click();
	                }
	                else if(vettoreConsentiti[5] == "NULL" && vettoreConsentiti[7] != "NULL")
	                {
        	            $("#" + vettoreConsentiti[7]).click();
	                }
                    break;
	            case 39: //right
                	if(vettoreConsentiti[1] != "NULL")
            	    {
                        console.log("r -> go r");
        	            $("#" + vettoreConsentiti[1]).click();
	                }
	                else if(vettoreConsentiti[4] != "NULL" && vettoreConsentiti[5] == "NULL")
	                {
        	            $("#" + vettoreConsentiti[4]).click();
	                }
	                else if(vettoreConsentiti[4] == "NULL" && vettoreConsentiti[5] != "NULL")
	                {
        	            $("#" + vettoreConsentiti[5]).click();
	                }
                    break;
            	case 40: //down
        	        if(vettoreConsentiti[0] != "NULL")
    	            {
                        console.log("d -> go d");
	                    $("#" + vettoreConsentiti[0]).click();
                	}
	                else if(vettoreConsentiti[4] != "NULL" && vettoreConsentiti[6] == "NULL")
	                {
        	            $("#" + vettoreConsentiti[4]).click();
	                }
	                else if(vettoreConsentiti[4] == "NULL" && vettoreConsentiti[6] != "NULL")
	                {
        	            $("#" + vettoreConsentiti[6]).click();
	                }
                    break;
    	        default: 
                    //alert(JSON.stringify(e));
                    return; // exit this handler for other keys
	        }
        }
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

};

$(document).ready(function()
{
    setDefault();
    buidSchema();
    createEvents();

    //$.getScript("//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-57e01bac2b06a85e", function() {});

});


//LANGUAGE AREA

var setLanguage = function(lang)
{
    "use strict";
    curr_language = lang;

    $("*[data-lang]").each( function()
    {
        $(this).text(dictionary[lang][this.getAttribute('data-lang')]);
    });

    $("*[data-lang-selector]").removeClass("active");
    $("*[data-lang-selector="+ lang + "]").addClass("active");

};


var dictionary = {};

dictionary.it_IT = {};
dictionary.it_IT.TITOLO = "SquareBox!";
dictionary.it_IT.DESC_BREVE = "Sai contare fino a 100?\xa0Completa lo SquareBox!";
dictionary.it_IT.INTRO = "Clicca su una casella per cominciare e poi continua saltando due caselle per muoverti in orizzontale o verticale e saltandone una per muoverti in diagonale!";
dictionary.it_IT.GAME_OVER = "Game over!";
dictionary.it_IT.CHIUDI = "Chiudi";
dictionary.it_IT.RESTART = "Nuova partita";
dictionary.it_IT.SHARE_FB = "Condividi su Facebook";
dictionary.it_IT.SHARE_TW = "Condividi su Twitter";
dictionary.it_IT.OPTIONS = "Opzioni";
dictionary.it_IT.AUTOCOMPLETE = "Completa automaticamente quando è possibile una sola mossa";
dictionary.it_IT.NUMB_ROWS = "Numero di righe";
dictionary.it_IT.NUMB_COLUM = "Numero di colonne";
dictionary.it_IT.COMMENTS = "Commenti";
dictionary.it_IT.FRASE_FINE = "Complimenti! Hai raggiunto un punteggio di {value} su {maxValue} ({numR}x{numC}) a SquareBox!";
dictionary.it_IT.FRASE_CONDIVIDI = "Ho raggiunto un punteggio di {value} su {maxValue} ({numR}x{numC}) a Squarebox!";
dictionary.it_IT.ANNULLA = "Annulla";
dictionary.it_IT.AUTOSOLVE = "Autorisolvi";
dictionary.it_IT.RANDOM = "A caso";
dictionary.it_IT.NO_CENTER = "Lontano dal centro";
dictionary.it_IT.ORIZONTAL = "Preferisci in orizzontale";
dictionary.it_IT.DIAGONAL = "Preferisci in diagonale";
dictionary.it_IT.ALGO = "Algoritmo";
dictionary.it_IT.SELECTALG = "Segli la cella iniziale";

dictionary.en_US = {};
dictionary.en_US.TITOLO = "SquareBox!";
dictionary.en_US.DESC_BREVE = "A magical game, fill the SquareBox!";
dictionary.en_US.INTRO = "Click on a box to start, than continue skipping 2 boxes up and down and one box conrnerways!";
dictionary.en_US.GAME_OVER = "Game over!";
dictionary.en_US.CHIUDI = "Close";
dictionary.en_US.RESTART = "Restart";
dictionary.en_US.SHARE_FB = "Share on Facebook";
dictionary.en_US.SHARE_TW = "Share on Twitter";
dictionary.en_US.OPTIONS = "Game options";
dictionary.en_US.AUTOCOMPLETE = "Autocomplete if there is only one chance";
dictionary.en_US.NUMB_ROWS = "Number of rows";
dictionary.en_US.NUMB_COLUM = "Number of columns";
dictionary.en_US.COMMENTS = "Comments";
dictionary.en_US.FRASE_FINE = "Congratulations! You achieved a score of {value}/{maxValue} ({numR}x{numC}) on SquareBox!";
dictionary.en_US.FRASE_CONDIVIDI = "I achieved a score of {value}/{maxValue} ({numR}x{numC}) on Squarebox!";
dictionary.en_US.ANNULLA = "Undo";
dictionary.en_US.AUTOSOLVE = "Autosolve";
dictionary.en_US.RANDOM = "Random";
dictionary.en_US.NO_CENTER = "Away from the center";
dictionary.en_US.ORIZONTAL = "Prefer horizontal";
dictionary.en_US.DIAGONAL = "Prefer diagonal";
dictionary.en_US.ALGO = "Algorithm";
dictionary.en_US.SELECTALG = "Select the first cell";

dictionary.es_ES = {};
dictionary.es_ES.TITOLO = "SquareBox!";
dictionary.es_ES.DESC_BREVE = "¿Sabes contar hacia 100?\xa0Completa Squarebox!";
dictionary.es_ES.INTRO = "Haz clic sobre una casilla para iniciar, despues continua saltando dos casillas orizontalmente y verticalmente y una casilla en diagonal.";
dictionary.es_ES.GAME_OVER = "Juego terminado";
dictionary.es_ES.CHIUDI = "Cerrar";
dictionary.es_ES.RESTART = "Nueva partida";
dictionary.es_ES.SHARE_FB = "Compartir en Facebook";
dictionary.es_ES.SHARE_TW = "Compartir en Twitter";
dictionary.es_ES.OPTIONS = "Opciones del juego";
dictionary.es_ES.AUTOCOMPLETE = "Completa aumtomaticamente cuando no hay otras opciones";
dictionary.es_ES.NUMB_ROWS = "Numero de lineas";
dictionary.es_ES.NUMB_COLUM = "Numero de columnas";
dictionary.es_ES.COMMENTS = "Comentos";
dictionary.es_ES.FRASE_FINE = "Felicitaciones! Has obtenido {value} sobre {maxValue} ({numR}x{numC}) en SquareBox!";
dictionary.es_ES.FRASE_CONDIVIDI = "He obtenido {value} sobre {maxValue} ({numR}x{numC}) en Squarebox!";
dictionary.es_ES.ANNULLA = "Cancelar";
dictionary.es_ES.AUTOSOLVE = "Autosolver";
dictionary.es_ES.RANDOM = "Aleatorio";
dictionary.es_ES.NO_CENTER = "Lejos del centro";
dictionary.es_ES.ORIZONTAL = "Prefiero horizontal";
dictionary.es_ES.DIAGONAL = "Prefiere diagonal";
dictionary.es_ES.ALGO = "Algoritmo";
dictionary.es_ES.SELECTALG = "Seleccione la primera celda";
