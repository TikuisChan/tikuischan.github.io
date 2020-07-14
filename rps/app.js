const playerScore = document.getElementById("player-score");
const compScore = document.getElementById("computer-score");
const rock = document.getElementById("rock");
const paper = document.getElementById("paper");
const scissors = document.getElementById("scissors");
const report = document.getElementById('report-reuslt')
const translate = {r: 'Rocks', p: "Paper", s: "Scissors"}

let playerScoreCount = 0
let cpuScoreCount = 0

rock.addEventListener("click", function () {game('r')})
paper.addEventListener("click", function () {game('p')})
scissors.addEventListener("click", function () {game('s')})

function game(userChoice) {
    const cpuChoice = getCompChoice();
    showChoices(userChoice, cpuChoice);
    switch (userChoice + cpuChoice) {
        case 'rr':
        case 'pp':
        case 'ss':
            draw();
            displayResult(userChoice, cpuChoice, 'draw');
            break;
        case 'rs':
        case 'pr':
        case 'sp':
            win();
            displayResult(userChoice, cpuChoice, 'win');
            break;
        case 'sr':
        case 'ps':
        case 'rp':
            lose();
            displayResult(userChoice, cpuChoice, 'lose');
    }
}

function win() {
    console.log('you win!');
    playerScoreCount++;
    playerScore.innerHTML = playerScoreCount;
}

function lose() {
    console.log('you lose...');
    cpuScoreCount++;
    compScore.innerHTML = cpuScoreCount;
}

function draw() {
    console.log('draw');
}

function displayResult(userChoice, cpuChoice, result) {
     if (result == 'win'){
        b = "You win! &#128079"
     } else if (result == 'lose'){
        b = "You lose... &#128546"
     } else {
        b = "Draw! &#129313"
        result = "equals"
     }
     a = `${translate[userChoice]} ${result} ${translate[cpuChoice]}, `;
     report.innerHTML = a + b;
}

function getCompChoice() {
    const cpuChoice = ['r', 'p', 's']
    const randomNum = Math.floor(Math.random() * 3)
    return cpuChoice[randomNum]
}

function showChoices(userChoice, cpuChoice) {
    if (userChoice == cpuChoice) {
        const addClass = 'both-select';
        showChoice(userChoice, addClass);
    } else {
        const addClassPlayer = 'player-select';
        showChoice(userChoice, addClassPlayer);
        const addClassComp = 'cpu-select';
        showChoice(cpuChoice, addClassComp);
    }
}

function showChoice(choice, addClass) {
    switch (choice) {
        case 'r':
            rock.classList.add(addClass);
            setTimeout(() => { rock.classList.remove(addClass); }, 500);
            break;
        case 's':
            scissors.classList.add(addClass);
            setTimeout(() => { scissors.classList.remove(addClass); }, 500);
            break;
        case 'p':
            paper.classList.add(addClass);
            setTimeout(() => { paper.classList.remove(addClass); }, 500);
            break;
    }
}
