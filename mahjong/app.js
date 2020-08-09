// selectors
const playersName = [document.querySelector('#player1'), document.querySelector('#player2'), document.querySelector('#player3'), document.querySelector('#player4')];
const playerNames = document.querySelector('.player-names');
const playerNameButton = document.querySelector('.playerConfirm');
const playersWin = [document.querySelector('.player1-w'), document.querySelector('.player2-w'), document.querySelector('.player3-w'), document.querySelector('.player4-w')];
const playersLose = [document.querySelector('.player1-l'), document.querySelector('.player2-l'), document.querySelector('.player3-l'), document.querySelector('.player4-l'), document.querySelector('.all-l')];
const money = document.querySelector('.moneyInput');
const submit = document.querySelector('.submit-button');
const allRecord = document.querySelector('.record tbody');
const summary = document.querySelector('.total-points').getElementsByTagName("td");
const clearBtn = document.querySelector('.clear-button');

// points record
var summaryPt = [0, 0, 0, 0];

// event listeners
document.addEventListener('DOMContentLoaded', getRecords);
playerNameButton.addEventListener('click', namePlayers);
submit.addEventListener('click', addRecord);
var playerwin
for (playerwin of playersWin) {
    playerwin.addEventListener('click', win);
}
var playerlose
for (playerlose of playersLose) {
    playerlose.addEventListener('click', lose);
}
allRecord.addEventListener('click', deleteClick);
clearBtn.addEventListener('click', clearAll);

// functions
function namePlayers (event){
    event.preventDefault();
    const players = playerNames.getElementsByTagName("th");
    players[0].innerHTML = playersName[0].value;
    players[1].innerHTML = playersName[1].value;
    players[2].innerHTML = playersName[2].value;
    players[3].innerHTML = playersName[3].value;
}

function clearWin () {
    var c;
    for (c of playersWin) {
        c.classList.remove('selected-w');
    }
}

function win (event) {
    clearWin();
    event.target.parentNode.classList.add('selected-w');
}

function clearLose () {
    var c;
    for (c of playersLose) {
        c.classList.remove('selected-l');
    }
}

function lose (event) {
    clearLose()
    event.target.parentNode.classList.add('selected-l');
}

function addRecord (event) {
    event.preventDefault();
    const m = parseInt(money.value);
    const win = searchWinner();
    const lose = searchLoser(win);
    clearWin();
    clearLose();
    money.value = '';
    writeRec(win, lose, m);
}

function writeRec (win, lose, m) {
    var newPlayersRecords = newRecordsfunc();
    var record = [0, 0, 0, 0];
    newPlayersRecords[win].innerHTML = m;
    summaryPt[win] += m;
    record[win] = m;
    switch (lose.length) {
        case 1:
            newPlayersRecords[lose[0]].innerHTML = -m;
            summaryPt[lose[0]] += -m;
            record[lose[0]] += -m;
            // newRecord[lose[0]] += -m;
            break;
        case 3:
            for (i of lose) {
                newPlayersRecords[i].innerHTML = -m / 3;
                summaryPt[i] += -m / 3;
                record[i] += -m / 3;
            }
            break;
    }
    var newRecord = document.createElement('tr');
    newRecord.classList.add('single-record');
    for (i of newPlayersRecords) {
        newRecord.appendChild(i);
    }
    allRecord.appendChild(newRecord);
    saveToLocal(record);
    updateTotalPoints();
}

function searchWinner() {
    var winner
    for (winner = 0; winner < playersWin.length; winner++) {
        if (playersWin[winner].classList.contains('selected-w')) {
            return winner
        }
    }
    return false
}

function searchLoser(win) {
    var loser = []
    var ll
    for (ll = 0; ll < 4; ll++) {
        if (playersLose[ll].classList.contains('selected-l')) {
            loser.push(ll);
        }
    }
    if (playersLose[4].classList.contains('selected-l')) {
        loser = [0, 1, 2, 3]
        loser.splice(win, 1);
    }
    return loser
}

function newRecordsfunc () {
    line = []
    var i
    for (i = 0; i < 4; i++) {
        var td = document.createElement('td');
        td.innerHTML = 0;
        line.push(td);
    }
    deleteBtnTd = document.createElement('td');
    deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = "<i class='fas fa-trash'></i>";
    deleteBtn.classList.add('trash-btn');
    deleteBtnTd.appendChild(deleteBtn);
    line.push(deleteBtnTd);
    return line
}

function deleteClick (e) {
    const item = e.target;
    if (item.classList.contains('trash-btn')) {
        removeItem = item.closest("tr").getElementsByTagName("td");
        var delRow = [0, 0, 0, 0];
        for (i = 0; i < 4; i++) {
            summaryPt[i] -= parseInt(removeItem[i].innerText);
            delRow[i] = parseInt(removeItem[i].innerText);
        }
        let MJRecords;
        // check local storage for MJRecords
        if (localStorage.getItem("MJRecords") === null) {
            MJRecords = [];
        } else {
            MJRecords = JSON.parse(localStorage.getItem("MJRecords"));
        }
        var i = 0;
        while (i < MJRecords.length) {
            var equal = 0;
            var j = 0;
            while (j < MJRecords[i].length) {
                if (MJRecords[i][j] === delRow[j]) {
                    equal += 1;
                }
                ++j;
            }
            if (equal === 4) {
                MJRecords.splice(i, 1);
            } else {
                ++i;
            }
        }
        localStorage.setItem("MJRecords", JSON.stringify(MJRecords));
        item.closest("tr").remove();
        updateTotalPoints();
    }
}

function updateTotalPoints () {
    var i;
    for (i = 0; i < 4; i++) {
        summary[i].innerText = summaryPt[i];
    }
}

function saveToLocal (record) {
    let MJRecords;
    // check local storage for MJRecords
    if (localStorage.getItem("MJRecords") === null) {
        MJRecords = [];
    } else {
        MJRecords = JSON.parse(localStorage.getItem("MJRecords"));
    }
    // push record into MJRecords
    MJRecords.push(record);
    localStorage.setItem("MJRecords", JSON.stringify(MJRecords));
}

function clearAll (event) {
    event.preventDefault();
    const players = playerNames.getElementsByTagName("th");
    var i;
    for (i = 0; i < 4; i++) {
        players[i].innerHTML = 'Player' + (i + 1).toString();
        summary[i].innerText = 0;
    }
    const records = document.querySelectorAll('.single-record');
    records.forEach((element) => {
            element.remove();
        })
    clearWin();
    clearLose();
    localStorage.clear();
}

function getRecords () {
    let MJRecords;
    // check local storage for MJRecords
    if (localStorage.getItem("MJRecords") === null) {
        MJRecords = [];
    } else {
        MJRecords = JSON.parse(localStorage.getItem("MJRecords"));
    }
    MJRecords.forEach(function(element) {
        var newPlayersRecords = newRecordsfunc();
        var i;
        for (i = 0; i < 4; i++) {
            newPlayersRecords[i].innerHTML = element[i];
            summaryPt[i] += element[i];
        }
        var newRecord = document.createElement('tr');
        newRecord.classList.add('single-record');
        for (i of newPlayersRecords) {
            newRecord.appendChild(i);
        }
        allRecord.appendChild(newRecord);
        updateTotalPoints();
    })
}
