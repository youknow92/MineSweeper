var boardState = []
var mineLocation = []
var ck = []
var tbody = document.querySelector('#table tbody')
var dx = [-1, 0, 1], dy = [-1, 0, 1]
var timerStart
var end
var open_cnt

document.querySelector('#exec').addEventListener('click', () => {
    tbody.innerHTML = ''
    boardState = []
    mineLocation = []
    document.querySelector('#timer').innerHTML = 0
    clearInterval(timerStart)
    end = false
    open_cnt = 0

    var row = parseInt(document.querySelector("#row").value)
    var col = parseInt(document.querySelector("#col").value)
    var mine = parseInt(document.querySelector("#mine").value)

    if(mine < 1 || row*col <= mine){
        window.alert('지뢰 개수 오류(1~'+(row*col - 1)+'개)')
        return;
    }

    for (let i = 0; i < row; i++) {
        var tr = document.createElement('tr')
        boardState.push([])
        mineLocation.push([])
        ck.push([])
        for (let j = 0; j < col; j++) {
            let td = document.createElement('td')
            boardState[i][j] = 0
            mineLocation[i][j] = 0
            ck[i][j] = 0
            td.addEventListener('contextmenu', (e) => {
                rightClick(e)
            })
            td.addEventListener('click', (e) => {
                leftClick(e, row, col)
            })
            tr.appendChild(td)
        }
        tbody.appendChild(tr)
    }

    var pool = Array(row * col).fill().map((elem, idx) => { return idx })
    var shuple = []

    while (pool.length > row * col - mine) {
        shuple.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
    }

    for (let i = 0; i < mine; i++) {
        let r = Math.floor(shuple[i] / row)
        let c = shuple[i] % row
        mineLocation[r][c] = -1;
    }
    
    timerStart = setInterval(()=> {
        var timer = document.getElementById('timer')
        timer.textContent++
        }, 1000)

})
function rightClick(e) {
    e.preventDefault()
    var parent_tr = e.currentTarget.parentNode
    var parent_tbody = e.currentTarget.parentNode.parentNode
    var r = Array.prototype.indexOf.call(parent_tbody.children, parent_tr)
    var c = Array.prototype.indexOf.call(parent_tr.children, e.currentTarget)

    if(boardState[r][c] === 2 || end) return false;

    boardState[r][c] = (boardState[r][c] + 1)%2
    if(boardState[r][c] === 0){
        e.currentTarget.textContent = ''
    }else if(boardState[r][c] === 1){
        e.currentTarget.textContent = '!'
    }

}

function leftClick(e, row, col) {
    e.preventDefault()
    var parent_tr = e.currentTarget.parentNode
    var parent_tbody = e.currentTarget.parentNode.parentNode
    var r = Array.prototype.indexOf.call(parent_tbody.children, parent_tr)
    var c = Array.prototype.indexOf.call(parent_tr.children, e.currentTarget)
    if(boardState[r][c] === 2 || boardState[r][c] === 1 || end) return false;
    if (mineLocation[r][c] === -1) {
        e.currentTarget.textContent = 'X'
        e.currentTarget.style.color = 'red'
        end = true
        clearInterval(timerStart)

        for(let i =0; i<row;i++){
            for(let j =0;j<col;j++){
                if(mineLocation[i][j] === -1){
                    parent_tbody.children[i].children[j].textContent = 'X'
                }
            }
        }

        return
    }
    else {
        recurrsive_click(parent_tbody, r, c, row, col)
        if(open_cnt === row*col - document.querySelector("#mine").value){
            clearInterval(timerStart)
            end = true
            return
        }
    }
}

function recurrsive_click(target, r, c, row, col){

    var mine_cnt = 0
    ck[r][c] = 1
    boardState[r][c] = 2
    open_cnt++

    for(let i in dx){
        for(let j in dy){
            let x = r + dx[i]
            let y = c + dy[j]
            if (0 <= x && x < row && 0 <= y && y < col && mineLocation[x][y] === -1){
                mine_cnt++;
            }
        }
    }    

    if(mine_cnt > 0){
        target.children[r].children[c].textContent = mine_cnt
        return;
    }

    for(let i in dx){
        for(let j in dy){
            let x = r + dx[i]
            let y = c + dy[j]
            if (0 <= x && x < row && 0 <= y && y < col && ck[x][y] === 0){
                tbody.children[x].children[y].textContent
                recurrsive_click(target, x, y, row, col)
            }
        }
    }
    
}

var bothClickEvent = function(leftClickAction, rightClickAction, bothClickAction) {

	var isClickedLeft = false, isClickedRight = false;
	var DELAY = 100, timer = null;

    // 우클릭에 대해 컨텍스트메뉴가 뜨는 것을 방지
	$(document).on('contextmenu', function(e) {
		e.preventDefault();
	});

	// reset
	var resetClick = function() {
		isClickedRight = false;
		isClickedLeft = false;
    };
    
	// event
	var funcLeftClick = function() {
		// 좌클릭 후 제한시간(DELAY) 이전에 우클릭이 없었으므로 좌클릭 로직 수행
		// 수행 전에 이미 클릭되었던 정보들을 초기화
		resetClick();
		leftClickAction();
    };
    
	// event
	var funcRightClick = function() {
		// 우클릭 후 제한시간(DELAY) 이전에 좌클릭이 없었으므로 우클릭 로직 수행
		// 수행 전에 이미 클릭되었던 정보들을 초기화
		resetClick();
		rightClickAction();
    };
    
	el.on('mousedown', selector, function(e) {
		switch (e.button) {
			case 2 :	// 우클릭
				// 클릭 정보 변경
				isClickedRight = true;
				if (isClickedLeft === true) {
					// DELAY 시간 이전에 좌클릭이 있었다면 좌/우 동시 클릭으로 간주
					bothClickAction();
				} else {
					// 동시 클릭이 생길 수 있으므로, DELAY 시간만큼 좌클릭을 기다린 이후에 우클릭 수행
					timer = setTimeout(funcRightClick, DELAY);
				}
				break;
			case 0 :	// 좌클릭
				// 클릭 정보 변경
				isClickedLeft = true;
				if (isClickedRight === true) {
					// DELAY 시간 이전에 우클릭이 있었다면 좌/우 동시 클릭으로 간주
					bothClickAction();
				} else {
					// 동시 클릭이 생길 수 있으므로, DELAY 시간만큼 우클릭을 기다린 이후에 좌클릭 수행
					timer = setTimeout(funcLeftClick, DELAY);
				}
				break;
			case 1 :	// 가운데 버튼 클릭
				// 그냥 넣어봄
				bothClickAction();
				break;
			default :
				break;
		}

	});

};