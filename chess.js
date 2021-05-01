// global varibles
var MAX_POSITION = 88;
var MIN_POSITION = 11;
var MAX_ROW = 8;
var MIN_ROW = 1;
var MAX_COL = 8;
var MIN_COL = 1;
var turn = "white";
var selected = 0;
var piece = "";
var position = "";
var color = "";
var backgroundColor = "";
var row = 0;
var col = 0;
var moves = []; // format: [position1, position2, position3]
var leftWhiteRookMoved = false;
var leftBlackRookMoved = false;
var rightWhiteRookMoved = false;
var rightBlackRookMoved = false;
var blackKingMoved = false;
var whiteKingMoved = false;
var checked = false;
var gameOver = false;

$("[piece]").each(function() {
    // sets up the board with pieces
    color = $(this).attr("color");
    piece = $(this).attr("piece");
    
    if (color != "" && piece != "") {
        $(this).css("background-image", "url(media/" + color + "-" + piece + ".png)");
    }
});

$(".spot").on("click", function() {
    // on click, shows possible moves, then allows user to make selection out of those moves
    if (gameOver) {
        restart();
    }
    else {
        checked = check();

        if ($(this).hasClass("potential")) {
            let tempCurrentPosition = position;
            position = $(this).attr("id");
            row = $(this).parent().attr("id");
            col = position % 10;
            clearBoard();
            movePiece(tempCurrentPosition);
            
        } else {
            // allowing for only 1 selection and removes possible moves
            clearBoard();
            // collecting data for current selection
            piece = $(this).attr("piece");
            position = $(this).attr("id");
            color = $(this).attr("color");
            backgroundColor = $(this).css("background-color");
            row = $(this).parent().attr("id");
            col = position % 10;
            
            // giving selected piece selection background
            if (piece != "" && color == turn) {
                $(this).css("background-color", "rgb(39, 79, 49)");
                // getting moves
                moves = getMoves(moves, piece, color, position);
                for (let i = 0; i < moves.length; i++) {
                    let selector = "#" + String(moves[i]);
                    $(selector).css("background-color", "rgb(70, 143, 89, 0.9)");
                    $(selector).addClass("potential");
                }
            }
        }
    }

});

function getMoves(pieceMoves, p, c, pos) {
    // first find position you can move and store in array for moving later on
    pos = Number(pos);
    if (p == "pawn") {
        pieceMoves = pawnGetMoves(pieceMoves, pos, c);
    } 
    else if (p == "rook") {
        pieceMoves = rookGetMoves(pieceMoves, pos, c);
    } 
    else if (p == "knight") {
        pieceMoves = knightGetMoves(pieceMoves, pos, c);
    } 
    else if (p == "bishop") {
        pieceMoves = bishopGetMoves(pieceMoves, pos, c);
    } 
    else if (p == "queen") {
        pieceMoves = queenGetMoves(pieceMoves, pos, c);
    } 
    else {
        pieceMoves = kingGetMoves(pieceMoves, pos, c);
    }

    for (let i = 0; i < pieceMoves.length; i++) {
        if (pieceMoves[i] % 10 < 1 || pieceMoves[i] % 10 > 8) {
            pieceMoves.splice(i, 1);
        }
    }

    
    return pieceMoves;
}

function clearBoard() {
    // sets all spots back to original background color
    let index = MIN_POSITION;
    for (index; index <= MAX_POSITION; index++) {
        let id = "#" + String(index);
        if ($(id).hasClass("light")) {
            $(id).css("background-color", "rgb(167, 138, 95)");
        }
        else {
            $(id).css("background-color", "rgb(71, 45, 6)");
        }
        if (index % 10 == 8) {
            index += 2; // skips any indices not on board
        }
        $(id).removeClass("potential");
    }

    moves.splice(0, moves.length);
    checked = check();
}

function movePiece(currentPosition) {
    let previousColor = $("#" + currentPosition).attr("color");
    let previousPiece = $("#" + currentPosition).attr("piece");
    $("#" + position).attr("color", color);
    $("#" + position).attr("piece", piece);
    $("#" + currentPosition).attr("color", "");
    $("#" + currentPosition).attr("piece","");
    if (checked) {
        if (defended()) {
            checked = false;
            clearBoard();
        }
        else {
            checked = true;
        }
    }
    let validMove = true;
    if (piece == "king") {
        
        // checking to see if king can move to chosen spot
        let oppPieces = [];
        let oppMoves = [];;
        oppPieces = getOppPieces(oppPieces);
        for (let i = 0; i < oppPieces.length; i++) {
            let p = $("#" + oppPieces[i]).attr("piece");
            let c = $("#" + oppPieces[i]).attr("color");
            let pos = $("#" + oppPieces[i]).attr("id");
            oppMoves = getMoves(oppMoves, p, c, pos);
            for (let j = 0; j < oppMoves.length; j++) {
                if (position == oppMoves[j]) {
                    validMove = false;
                    break;
                }
            }
            oppMoves.splice(0, oppMoves.length);
            if (validMove == false) {
                break;
            }
        }


        if (!validMove || checked) {
            $("#" + currentPosition).attr("color", previousColor);
            $("#" + currentPosition).attr("piece", previousPiece);
            $("#" + position).attr("color", "");
            $("#" + position).attr("piece", "");

            
        } else {
            // check for valid castling if spot selected is two spots horizontal from king
            let rookPos = "";
            let previousRookPos = "";
            posDiff = position - currentPosition;
            if (row == 1 || row == 8) {
                if (posDiff != 1 && posDiff != -1) {
                    if (posDiff == 2) {
                        // right side castling
                        rookPos = Number(position) - 1;
                        $("#" + rookPos).attr("color", turn);
                        $("#" + rookPos).attr("piece", "rook");
                        previousRookPos = Number(currentPosition) + 3;
                        $("#" + previousRookPos).attr("color", "");
                        $("#" + previousRookPos).attr("piece", "");
                    }
                    else if (posDiff == -2) {
                        // left side castling
                        rookPos = Number(position) + 1;
                        $("#" + rookPos).attr("color", turn);
                        $("#" + rookPos).attr("piece", "rook");
                        previousRookPos = Number(currentPosition) - 4;
                        $("#" + previousRookPos).attr("color", "");
                        $("#" + previousRookPos).attr("piece", "");
                    }
                    $("#" + rookPos).css("background-image", "url(media/" + color + "-rook.png)");
                    $("#" + previousRookPos).css("background-image", "initial");
                }
            }
            
                $("#" + position).css("background-image", "url(media/" + color + "-" + piece + ".png)");
                $("#" + currentPosition).css("background-image", "initial");
            }
    } else {
        if (checked) {
            $("#" + currentPosition).attr("color", previousColor);
            $("#" + currentPosition).attr("piece", previousPiece);
            $("#" + position).attr("color", "");
            $("#" + position).attr("piece", "");
        } else {
            $("#" + position).css("background-image", "url(media/" + color + "-" + piece + ".png)");
            $("#" + currentPosition).css("background-image", "initial");
        }
    }

    // check for promotion
    if (color == "white" && $("#" + position).parent().attr("id") == "8" || color == "black" && $("#" + position).parent().attr("id") == "1") {
        promotion();
    }

    if (validMove && !checked) {
        if ($("#" + position).attr("piece") == "rook") {
            if (col == "8") {
                if (turn == "white") {
                    rightWhiteRookMoved = true;
                } else {
                    rightBlackRookMoved = true;
                }
            }
            else {
                if (turn == "white") {
                    leftWhiteRookMoved = true;
                } else {
                    leftBlackRookMoved = true;
                }
            }
        } 
        else if ($("#" + position).attr("piece") == "king") {
            if (turn == "white") {
                whiteKingMoved = true;
            } else {
                blackKingMoved = true;
            }
        }

        let turnDisplay = "";
        if (turn == "white") {
            turn = "black"
            turnDisplay = "Black";
        }
        else {
            turn = "white";
            turnDisplay = "White";
        }
        
        document.getElementById("turn").innerHTML = `${turnDisplay}'s turn`;
        checked = check();
        gameOver = checkmate();
        if (gameOver) {
            let winner = "";
            if (turn == "white") {
                winner = "Black";
            }
            else {
                winner = "White";
            }
            document.getElementById("restart").innerHTML = `Checkmate! ${winner} Wins! Play Again? <br> If you choose to 'View Board', click the board to prompt this message again`;
            restart();
        }
    }

}

function check() {
    let oppPieces = [];
    let oppMoves = [];
    oppPieces = getOppPieces(oppPieces);
    for (let i = 0; i < oppPieces.length; i++) {
        let p = $("#" + oppPieces[i]).attr("piece");
        let c = $("#" + oppPieces[i]).attr("color");
        let pos = $("#" + oppPieces[i]).attr("id");
        oppMoves = getMoves(oppMoves, p, c, pos);
        for (let i = 0; i < oppMoves.length; i++) {
            let id = "#" + oppMoves[i];
            if ($(id).attr("piece") == "king" && $(id).attr("piece") != color) {
                $(id).css("background-color", "red");
                return true;
            }
        }
        oppMoves.splice(0, oppMoves.length);
    }
    return false;
}

function defended() {
    let oppPieces = [];
    let oppMoves = [];
    oppPieces = getOppPieces(oppPieces);
    for (let i = 0; i < oppPieces.length; i++) {
        let p = $("#" + oppPieces[i]).attr("piece");
        let c = $("#" + oppPieces[i]).attr("color");
        let pos = $("#" + oppPieces[i]).attr("id");
        oppMoves = getMoves(oppMoves, p, c, pos);
        
        for (let j = 0; j < oppMoves.length; j++) {
            let id = "#" + oppMoves[j];
            if ($(id).attr("piece") == "king" && $(id).attr("piece") != color) {
                return false;
            }
        }
        oppMoves.splice(0, oppMoves.length);
    }
    return true;
}

function checkmate() {
    let kingMoves = [];
    let p = "king";
    let c = turn;
    let kingPos = "";
    for (let index = MIN_POSITION; index <= MAX_POSITION; index++) {
        let id = "#" + String(index);
        if ($(id).attr("piece") == "king" && $(id).attr("color") == turn) {
            kingPos = String(index);
            break;
        }

        if (index % 10 == 8) {
            index += 2; // skips any indices not on board
        }
    }
    kingMoves = getMoves(kingMoves, p, c, kingPos);

    let oppPieces = [];
    let oppMoves = [];
    let tempKingPos = kingPos;
    oppPieces = getOppPieces(oppPieces);
    
    for (let index = 0; index < kingMoves.length; index++) {
        let tempC = $("#" + kingMoves[index]).attr("color");
        let tempP = $("#" + kingMoves[index]).attr("piece");
        $("#" + kingMoves[index]).attr("color", turn);
        $("#" + kingMoves[index]).attr("piece", "king");
        $("#" + tempKingPos).attr("color", "");
        $("#" + tempKingPos).attr("piece","");
        let removed = false;
        for (let i = 0; i < oppPieces.length; i++) {
            let p = $("#" + oppPieces[i]).attr("piece");
            let c = $("#" + oppPieces[i]).attr("color");
            let pos = $("#" + oppPieces[i]).attr("id");
            oppMoves = getMoves(oppMoves, p, c, pos);

            for (let j = 0; j < oppMoves.length; j++) {
                if (oppMoves[j] == kingMoves[index]) {
                    $("#" + kingMoves[index]).attr("color", tempC);
                    $("#" + kingMoves[index]).attr("piece", tempP);
                    kingMoves.splice(index, 1);
                    removed = true;
                    index--;
                    break;
                }
            }
            oppMoves.splice(0, oppMoves.length);
            if (removed == true) {
                break;
            }
        }
        if (!removed) {
            $("#" + kingMoves[index]).attr("color", tempC);
            $("#" + kingMoves[index]).attr("piece", tempP);
        }
    }
    $("#" + kingPos).attr("color", turn);
    $("#" + kingPos).attr("piece", "king");
    
    if (kingMoves.length == 0 && checked) {
        return true;
    } else {
        kingMoves.splice(0, kingMoves.length);
        return false;
    }
}

function promotion() {
    if (piece == "pawn") {
        
        let choice = "";
        choice.toLowerCase();
        while (choice != "queen" && choice != "bishop" && choice != "rook" && choice != "knight") {
            choice = window.prompt("Promotion! Type what you would like to promote to:\nQueen\nBishop\nRook\nKnight");
            choice = choice.toLowerCase();
        }
        piece = choice;
        $("#" + position).attr("piece", piece);
        $("#" + position).css("background-image", "url(media/" + color + "-" + piece + ".png)");
    }
}

function getOppPieces(arr) {
    for (let i = MIN_POSITION; i <= MAX_POSITION; i++) {
        if ($("#" + String(i)).attr("color") != turn && $("#" + String(i)).attr("color") != "") {
            arr.push(String(i));
        }
        
        if (i % 10 == 8) {
            i += 2;
        }
    }
    return arr;
}

function pawnGetMoves(pieceMoves, move, c) {
    tempRow = $("#" + String(move)).parent().attr("id");
    tempCol = move % 10;

    // checking to see if pawn has been moved yet
    if (c == "white" && Math.floor(move / 10) == 2 || c == "black" && Math.floor(move / 10) == 7) {
        var move1 = 0;
        var move2 = 0;
        

        if (c == "white") {
            move1 = move + 10;
            move2 = move + 20;
        }
        else {
            move1 = move - 10;
            move2 = move - 20;
        }
        
        // checking to see if pawn is blocked by piece
        let validMove1 = true;
        let validMove2 = true;

        if ($("#" + move1).attr("color") != "") {
            validMove1 = false;
        }
        if ($("#" + move2).attr("color") != "") {
            validMove2 = false;
        }

        if (move1 >= MIN_POSITION && move1 <= MAX_POSITION && validMove1) {
            pieceMoves.push(String(move1));
        }
        if (move2 >= MIN_POSITION && move2 <= MAX_POSITION && validMove1 && validMove2) {
            pieceMoves.push(String(move2));
        }
    }
    else {   
        if (c == "white") {
            move += 10;
        }
        else {
            move -= 10;
        }

        // checking to see if pawn is blocked by piece
        let validMove = true;

        if ($("#" + move).attr("color") != "") {
            validMove = false;
        }

        if (move >= MIN_POSITION && move <= MAX_POSITION && validMove) {
            pieceMoves.push(String(move));
        }
    }

    // checking for diagonal attacks
    if (c == "white") {
        tempRow++;
        tempCol--;
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") != c && $("#" + tempMove).attr("color") != "") {
            pieceMoves.push(tempMove);
        }
        tempCol += 2;
        tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") != c && $("#" + tempMove).attr("color") != "") {
            pieceMoves.push(tempMove);
        }
    } else {
        tempRow--;
        tempCol++;
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") != c && $("#" + tempMove).attr("color") != "") {
            pieceMoves.push(tempMove);
        }
        tempCol -= 2;
        tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") != c && $("#" + tempMove).attr("color") != "") {
            pieceMoves.push(tempMove);
        }
    }
    return pieceMoves;
}

function rookGetMoves(pieceMoves, pos, c) {
    let tempRow = $("#" + String(pos)).parent().attr("id");
    let tempCol = pos % 10;
    let validMove = true;
    tempCol--;
    // left moves
    while (tempCol >= MIN_COL && validMove) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "") {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
            validMove = false;
        }
        else {
            validMove = false;
        }
        
        tempCol--;
    }
    // right moves
    tempCol = pos % 10;
    validMove = true;
    tempCol++;
    while (tempCol <= MAX_COL && validMove) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "") {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
            validMove = false;
        }
        else {
            validMove = false;
        }
        tempCol++;
    }
    // up moves
    tempCol = pos % 10;
    validMove = true;
    tempRow++;
    while (tempRow <= MAX_ROW && validMove) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "") {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
            validMove = false;
        }
        else {
            validMove = false;
        }
        tempRow++;
    }
    // down moves
    tempRow = $("#" + String(pos)).parent().attr("id");
    validMove = true;
    tempRow--;
    while (tempRow >= MIN_ROW && validMove) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "") {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
            validMove = false;
        }
        else {
            validMove = false;
        }
        tempRow--;
    }
    return pieceMoves;
}

function knightGetMoves(pieceMoves, pos, c) {
    // temps allow row and col to be unchanged
    let tempRow = $("#" + String(pos)).parent().attr("id");
    let tempCol = pos % 10;

    // front spots
    // 1 row
    tempRow++;
    tempCol -= 2;
    if (tempCol >= MIN_COL && tempRow <= MAX_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    tempCol += 4;
    if (tempCol >= MIN_COL && tempRow <= MAX_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
        
    // 2 rows
    tempRow++;
    tempCol = pos % 10;
    tempCol--;
    if (tempCol <= MAX_COL && tempRow <= MAX_ROW) {
        tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    tempCol += 2
    if (tempCol <= MAX_COL && tempRow <= MAX_ROW) {
        tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    
    // back spots
    // 1 row
    tempRow = $("#" + String(pos)).parent().attr("id");
    tempCol = pos % 10;
    tempRow--;
    tempCol -= 2;
    if (tempCol >= MIN_COL && tempRow >= MIN_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    tempCol += 4;
    if (tempCol >= MIN_COL && tempRow >= MIN_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }

    // 2 rows
    tempRow--;
    tempCol = pos % 10;
    tempCol--;
    if (tempCol <= MAX_COL && tempRow >= MIN_ROW) {
        tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    tempCol += 2;
    if (tempCol <= MAX_COL && tempRow >= MIN_ROW) {
        tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    
    return pieceMoves;
}

function bishopGetMoves(pieceMoves, pos, c) {
    var i = 1;
    // temps allow row and col to be unchanged
    let tempRow = $("#" + String(pos)).parent().attr("id");
    let tempCol = pos % 10;
    var validMove1 = true;
    var validMove2 = true;
    
    while (tempRow < MAX_ROW) {
        
        //left diagonal
        tempRow++;
        tempCol -= i;
        if (tempCol >= MIN_COL && validMove1) {
            let tempMove = String(tempRow) + String(tempCol);
            if ($("#" + tempMove).attr("color") == "") {
                pieceMoves.push(tempMove);
            }
            else if ($("#" + tempMove).attr("color") != c) {
                pieceMoves.push(tempMove);
                validMove1 = false;
            }
            else {
                validMove1 = false;
            }
        }
        
        // right diagonal
        tempCol = pos % 10;
        tempCol += i;
        if (tempCol <= MAX_COL && validMove2) {
            tempMove = String(tempRow) + String(tempCol);
            if ($("#" + tempMove).attr("color") == "") {
                pieceMoves.push(tempMove);
            }
            else if ($("#" + tempMove).attr("color") != c) {
                pieceMoves.push(tempMove);
                validMove2 = false;
            }
            else {
                validMove2 = false;
            }
        }
        tempCol = pos % 10;
        i++;
    }
    i = 1;
    tempRow = $("#" + String(pos)).parent().attr("id");
    tempCol = pos % 10;
    validMove1 = true;
    validMove2 = true;
    while (tempRow > MIN_ROW) {
        // backwards left diagonal
        tempRow--;
        tempCol -= i;
        if (tempCol >= MIN_COL && validMove1) {
            let tempMove = String(tempRow) + String(tempCol);
            if ($("#" + tempMove).attr("color") == "") {
                pieceMoves.push(tempMove);
            }
            else if ($("#" + tempMove).attr("color") != c) {
                pieceMoves.push(tempMove);
                validMove1 = false;
            }
            else {
                validMove1 = false;
            }
        }
        // backwards right diagonal
        tempCol = pos % 10;
        tempCol += i;
        if (tempCol <= MAX_COL && validMove2) {
            tempMove = String(tempRow) + String(tempCol);
            if ($("#" + tempMove).attr("color") == "") {
                pieceMoves.push(tempMove);
            }
            else if ($("#" + tempMove).attr("color") != c) {
                pieceMoves.push(tempMove);
                validMove2 = false;
            }
            else {
                validMove2 = false;
            }
        }
        tempCol = pos % 10;
        i++;
    }
    return pieceMoves;
}

function queenGetMoves(pieceMoves, pos, c) {
    bishopGetMoves(pieceMoves, pos, c);
    rookGetMoves(pieceMoves, pos, c);
    
    return pieceMoves;
}

function kingGetMoves(pieceMoves, pos, c) {
    let tempRow = $("#" + String(pos)).parent().attr("id");
    let tempCol = pos % 10;

    // up move
    tempRow++;
    if (tempRow <= MAX_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    // down move
    tempRow = $("#" + String(pos)).parent().attr("id");
    tempRow--;
    if (tempRow >= MIN_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    // left move
    tempRow = $("#" + String(pos)).parent().attr("id");
    tempCol--;
    if (tempCol >= MIN_COL) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    // right move
    tempCol = pos % 10;
    tempCol++;
    if (tempCol <= MAX_COL) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    // left diagonal
    tempRow = $("#" + String(pos)).parent().attr("id");
    tempCol = pos % 10;
    tempRow--;
    tempCol--;
    if (tempCol >= MIN_COL && tempRow >= MIN_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    tempRow += 2;
    if (tempCol >= MIN_COL && tempRow <= MAX_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    // right diagonal
    tempRow = $("#" + String(pos)).parent().attr("id");
    tempCol = pos % 10;
    tempRow++;
    tempCol++;
    if (tempCol <= MAX_COL && tempRow <= MAX_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    tempRow -= 2;
    if (tempCol <= MAX_COL && tempRow >= MIN_ROW) {
        let tempMove = String(tempRow) + String(tempCol);
        if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
        else if ($("#" + tempMove).attr("color") != c) {
            pieceMoves.push(tempMove);
        }
    }
    // castling move
    tempRow = $("#" + String(pos)).parent().attr("id");
    tempCol = pos % 10;
    let validCastle = true;
    if (turn == "white") {
        if (!whiteKingMoved) {
            if (!leftWhiteRookMoved) {
                tempCol--;
                for (tempCol; tempCol > MIN_COL; tempCol--) {
                    let tempMove = String(tempRow) + String(tempCol);
                    if ($("#" + tempMove).attr("piece") != "") {
                        validCastle = false;
                    }
                }
                
                if (validCastle) {
                    tempCol = pos % 10;
                    tempCol -= 2;
                    let tempMove = String(tempRow) + String(tempCol);
                    if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
                        pieceMoves.push(tempMove);
                    }
                }
            }
            tempCol = pos % 10;
            validCastle = true;
            if (!rightWhiteRookMoved) {
                tempCol++;
                for (tempCol; tempCol < MAX_COL; tempCol++) {
                    let tempMove = String(tempRow) + String(tempCol);
                    if ($("#" + tempMove).attr("piece") != "") {
                        validCastle = false;
                    }
                }

                if (validCastle) {
                    tempCol = pos % 10;
                    tempCol += 2;
                    let tempMove = String(tempRow) + String(tempCol);
                    if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
                        pieceMoves.push(tempMove);
                    }
                }
            }
        }
    } else {
        if (!blackKingMoved) {
            if (!leftBlackRookMoved) {
                tempCol--;
                for (tempCol; tempCol > MIN_COL; tempCol--) {
                    let tempMove = String(tempRow) + String(tempCol);
                    if ($("#" + tempMove).attr("piece") != "") {
                        validCastle = false;
                    }
                }

                if (validCastle) {
                    tempCol = pos % 10;
                    tempCol -= 2;
                    let tempMove = String(tempRow) + String(tempCol);
                    if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
                        pieceMoves.push(tempMove);
                    }
                }
            }   
            tempCol = pos % 10;
            validCastle = true;
            if (!rightBlackRookMoved) {
                tempCol++;
                for (tempCol; tempCol < MAX_COL; tempCol++) {
                    let tempMove = String(tempRow) + String(tempCol);
                    if ($("#" + tempMove).attr("piece") != "") {
                        validCastle = false;
                    }
                }

                if (validCastle) {
                    tempCol = pos % 10;
                    tempCol += 2;
                    let tempMove = String(tempRow) + String(tempCol);
                    if ($("#" + tempMove).attr("color") == "" || $("#" + tempMove).attr("color") != c) {
                        pieceMoves.push(tempMove);
                    }
                }
            }
        }
    }

    return pieceMoves;
}

function restart() {
            $( function() {
                $( "#restart" ).dialog({
                modal: true,
                width: 300,
                height: 200,
                resizable: false,
                position: { my: "center", at: "center", of: window },
                buttons: [
                    {
                        text: "Yes",
                        click: function() {  
                            $(this).dialog("destroy");
                            location.reload();
                            return false;
                        }
                    },

                    {
                        text: "View Board",
                        click: function() {
                            $(this).dialog("close");
                        }
                    }
                ]

                });
            } );
}