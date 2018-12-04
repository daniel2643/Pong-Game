"use strict";
function pong() {
    /**
     * main function of pong game. There're generally 5 parts in the function
     * 1. Cursor coordinate Display
     * 2. object creation
     * 3. ball move animation
     * 4. Game Mode Choice && paddle move && speed system
     * 5. scores and result display
     */
    const svg = document.getElementById("canvas"), // get canvas svg
    svgRect = svg.getBoundingClientRect(), // get the canvas' entity
    x0 = svgRect.left, // the canvas' left-most x-coordinator on the HTML pages
    y0 = svgRect.top; // the canvas' left-most y-coordinator on the HTML pages
    let leftPlayerScore = 0, rightPlayerScore = 0, leftWin = "Game Over", // the label to display on page when left player wins
    rightWin = "You WIN!"; // the label to display on page when right player wins
    /////////////////////////////////////////////////////////////
    //////////////  1. Cursor coordinate Display  ///////////////
    ////////////////////////////////////////////////////////////
    ////// visualize the mouse position for testing object creation /////////
    const pos = document.getElementById("pos"), 
    // o is the observable for cursor's position on canvas
    o = Observable
        .fromEvent(document, "mousemove")
        .map(({ clientX, clientY }) => ({ x: clientX - x0, y: clientY - (y0 | 0) })); //make simple variables into new combined datastructure object
    // display cursor's coordinate (x, y) in the canvas to the HTML document
    o.map(({ x, y }) => `${x},${y}`)
        .subscribe(s => pos.innerHTML = s);
    // highlight (x, y)
    o.filter(({ x, y }) => x > WIDTH || y > HEIGHT || x < 0 || y < 0)
        .subscribe(_ => pos.classList.add('highlight'));
    // remove highlight (x, y)
    o.filter(({ x, y }) => x >= 0 && x <= WIDTH && y >= 0 && y <= HEIGHT)
        .subscribe(_ => pos.classList.remove('highlight'));
    /////////////////////////////////////////////////////////////
    ///////////////////  2. object creation  ////////////////////
    /////////////////////////////////////////////////////////////
    /////// create middle broken line ////////
    // The lines are simply some small rect Elem.
    let 
    // set first line rect's y-coordinate position 
    yPos = -15, 
    // make an array that contains some initial rect Elem
    gridPos = new Array(Math.floor((HEIGHT - 10) / 15) + 1).fill(getRect(svg, 0, 0, 0, 0));
    // update the y-coordinate positions of all rect Elem that increases, which simulates a broken line
    gridPos.map(elem => getRect(svg, WIDTH / 2 - 3, yPos += 15, 6, 10));
    /////// create paddles and ball///////
    const leftPaddle = getRect(svg, 0, HEIGHT / 2 - PADDLEHEIGHT / 2, PADDLEWIDTH, PADDLEHEIGHT, '#13B443'), rightPaddle = getRect(svg, WIDTH - PADDLEWIDTH, HEIGHT / 2 - PADDLEHEIGHT / 2, PADDLEWIDTH, PADDLEHEIGHT, '#13B443'), ball = getCircle(svg, -10, Math.random() * HEIGHT, RADIUS);
    /////////////////////////////////////////////////////////////
    /////////////////  3. ball move animation  //////////////////
    /////////////////////////////////////////////////////////////
    let xstep = 1, // the initial x-coordinate steps of ball in a unit time period. i.e. speed of ball in x-coordinate
    ystep = 1, // the initial y-coordinate steps of ball in a unit time period. i.e. speed of ball in y-coordinate
    // the ball's real speed in 2D canvas can be represent by sqrt(xstep^2, ystep^2)
    boundary_flag = false; // a flag to represent whether it should reset the ball to left boundary
    // a flag initialy declared as false, when a player get scores, then a round of the game finished.
    // then we set flag to true, which means we need to reset the ball the the initial states
    ball.attr('cx', PADDLEWIDTH);
    Observable.interval(0)
        .takeUntil(Observable.interval(0).filter(num => {
        const judge = leftPlayerScore >= WINSCORE || rightPlayerScore >= WINSCORE; // judgement for stoping the Observable
        judge ? [ball.attr('cx', -1000)] : {};
        return judge;
    }))
        .subscribe(() => {
        const cx = Number(ball.attr('cx')), cy = Number(ball.attr('cy')), ball_o = Observable.interval(0).map(num => ball), //create an Observable<ball> stream
        rGetit = cy >= Number(rightPaddle.attr('y')) && cy <= Number(rightPaddle.attr('y')) + PADDLEHEIGHT, 
        // rGetit represents whether the y-coordinate of ball locates in the region of right paddle
        lGetit = cy >= Number(leftPaddle.attr('y')) && cy <= Number(leftPaddle.attr('y')) + PADDLEHEIGHT;
        // lGetit represents whether the y-coordinate of ball locates in the region of left paddle
        // Case 1: When the ball hits the up-boundary or bottom-boundary, bounce
        cy > HEIGHT || cy < 0 ? ystep = -ystep : {};
        // Case 2a: When the ball located in the right paddle areas, bounce (i.e. change the direction of ball by negating xstep)
        if (cx + RADIUS >= WIDTH - PADDLEWIDTH && cx + RADIUS < WIDTH - PADDLEWIDTH + xstep) {
            rGetit ? xstep = -xstep : {};
        }
        // Case 2b: When the ball hits the right-boundary, reset the ball
        else if (cx - RADIUS > WIDTH) {
            leftPlayerScore++;
            boundary_flag = true; // ready for reseting the ball
        }
        // Case 3a: When the ball located in the left paddle areas, bounce (i.e. change the direction of ball by negating xstep)
        if (cx - RADIUS <= PADDLEWIDTH && cx - RADIUS > PADDLEWIDTH + xstep) {
            lGetit ? xstep = -xstep : {};
        }
        // Case 3b: When the ball hits the left-boundary, reset the ball that start from left side
        else if (cx + RADIUS < 0) {
            xstep = -xstep;
            rightPlayerScore++;
            boundary_flag = true; // ready for reseting the ball
        }
        // reset ball: update(subscribe) ball's next position to left boundary
        if (boundary_flag) {
            ball.attr('cx', PADDLEWIDTH).attr('cy', Math.random() * HEIGHT);
            boundary_flag = false;
            leftPaddle.attr('y', HEIGHT / 2 - PADDLEHEIGHT / 2);
        }
        // update ball: move the ball by calculated step on x-coordinate and y-coordinate separately
        else {
            ball.attr('cx', cx + xstep).attr('cy', cy + ystep);
        }
    });
    /////////////////////////////////////////////////////////////
    //////////  4. Game Mode Choice && paddle move  /////////////
    ////////////////////////////////////////////////////////////
    // Observable to make pressed key true when press down any key of keyboard
    Observable.fromEvent(document, 'keydown').subscribe(e => {
        switch (e.key) {
            case 'q':
                keys[81] = true;
                break; // 'Q': leftpaddle up
            case 'a':
                keys[65] = true;
                break; // 'A': leftpaddle down
            case 'p':
                keys[80] = true;
                break; // 'P': rightpaddle up
            case 'l':
                keys[76] = true;
                break; // 'L': rightpaddle down
        }
    });
    // Observable to make pressed key false when press up any key of keyboard
    Observable.fromEvent(document, 'keyup').subscribe(e => {
        switch (e.key) {
            case 'q':
                keys[81] = false;
                break; // 'Q'
            case 'a':
                keys[65] = false;
                break; // 'A'
            case 'p':
                keys[80] = false;
                break; // 'P'
            case 'l':
                keys[76] = false;
                break; // 'L'
        }
    });
    // Observable for speeding up and slowing down ball
    Observable.fromEvent(document, 'keydown').subscribe(e => {
        switch (e.key) {
            case 'v': // 'V': speed up ball
                xstep > 0 ? xstep += 0.2 : xstep -= 0.2;
                ystep > 0 ? ystep += 0.2 : ystep -= 0.2;
                break;
            case 'b': // 'B': slow down ball
                xstep > 1 ? xstep -= 0.2 : xstep < -1 ? xstep += 0.2 : {};
                ystep > 1 ? ystep -= 0.2 : ystep < -1 ? ystep += 0.2 : {};
                break;
        }
    });
    // Observable for monitoring user's choice on the game mode by press key "1", "2", "3" of the keyboard
    Observable.fromEvent(document, 'keydown').subscribe(e => {
        if (!keys[83] && !keys[68] && !keys[77]) {
            switch (e.key) {
                case 's': // 's'(single): Mode 1: single player by keyboard control
                    keys[83] = true;
                    // left paddle move by computer: operating a computer paddle AI:-- follow the ball
                    Observable.interval(10)
                        .takeUntil(Observable.interval(0).filter(num => (leftPlayerScore >= WINSCORE || rightPlayerScore >= WINSCORE)))
                        .subscribe(() => {
                        leftPaddle.attr('y', ystep + Number(leftPaddle.attr('y')));
                    });
                    // right paddle move by human                                                   
                    paddleMove(rightPaddle, 80, 76);
                    deleteInstruction();
                    break;
                case 'd': // 'd'(double): Mode 2: double player by keyboard control
                    keys[68] = true;
                    // right paddle move by human
                    paddleMove(leftPaddle, 81, 65);
                    // right paddle move by human                                                   
                    paddleMove(rightPaddle, 80, 76);
                    deleteInstruction();
                    leftWin = "Left Player WIN!"; // update win message
                    rightWin = "Right Player WIN!"; // update win message
                    break;
                case 'm': // 'm'(single by mouse): Mode 3: single player by mouse control 
                    keys[77] = true;
                    // left paddle move by computer: operating a computer paddle AI:-- follow the ball
                    Observable.interval(10)
                        .takeUntil(Observable.interval(0).filter(num => (leftPlayerScore >= WINSCORE || rightPlayerScore >= WINSCORE)))
                        .subscribe(() => {
                        leftPaddle.attr('y', ystep + Number(leftPaddle.attr('y')));
                    });
                    // right paddle move by human (mouse control)                                                                         
                    paddleMoveByMouse(svg, rightPaddle);
                    deleteInstruction();
                    break;
            }
        }
    });
    /////////////////////////////////////////////////////////////
    ////////////// 5. scores and result display  ///////////////
    ////////////////////////////////////////////////////////////
    const score = document.getElementById("score"), // get the score object from HTML
    result = document.getElementById("result"); // get the result object from HTML
    // execute an Observable stream for monitoring score
    Observable
        .interval(0)
        .map((num) => ({ x: leftPlayerScore, y: rightPlayerScore })) //make simple variables into new combined datastructure object
        .map(({ x, y }) => `${x}\t:\t${y}`) // map the 2 players' scores in canvas to HTML page display style
        .subscribe(s => score.innerHTML = s); // subscribe the Observable stream
    // execute an Observable stream for monitoring result
    Observable
        .interval(0)
        .map(num => ({ x: leftPlayerScore, y: rightPlayerScore })) //make simple variables into new combined datastructure object
        .map(({ x, y }) => rightPlayerScore >= WINSCORE && rightPlayerScore > leftPlayerScore ? rightWin
        : leftPlayerScore >= WINSCORE && rightPlayerScore < leftPlayerScore ? leftWin : "")
        // map the 2 players' game result in canvas to HTML page display style
        .subscribe(s => result.innerHTML = s); // subscribe the Observable stream
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// End of Pong Function ////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////
function getRect(target, x, y, width, height, color = '#11B3D7') {
    /**
     * create and return a rect Elem
     */
    return new Elem(target, 'rect')
        .attr('x', x).attr('y', y)
        .attr('width', width).attr('height', height)
        .attr('fill', color);
}
function getCircle(target, cx, cy, radius, color = '#FFA500') {
    /**
     * create and return a circle Elem
     */
    return new Elem(target, 'circle')
        .attr('cx', cx).attr('cy', cy)
        .attr('r', radius)
        .attr('fill', color);
}
function paddleMove(paddle, upKeyCode, downKeyCode) {
    /**
     * Simulating a paddleMove action by human-controlled keyboard event
     */
    let step = 0; // initial moving step on the canvas of a paddle Elem
    Observable
        .fromEvent(document, 'keypress')
        .subscribe(e => {
        keys[upKeyCode] ? step = -1
            : keys[downKeyCode] ? step = 1 : step = 0;
        Observable.interval(0)
            .takeUntil(Observable.interval(5))
            .subscribe(() => {
            const currentY = Number(paddle.attr('y')), // the paddle's y-coordinate
            paddle_o = Observable.interval(0) // create an Observable<paddle> stream
                .map(num => paddle);
            paddle_o // set paddle's direction reversely when paddle hit the top
                .filter(p => Number(p.attr('y')) > HEIGHT)
                .subscribe(p => step = -1);
            paddle_o // set paddle's direction reversely when paddle hit the bottom
                .filter(p => Number(p.attr('y')) < -PADDLEHEIGHT)
                .subscribe(p => step = 1);
            paddle.attr('y', step * 10 + currentY); // move the paddle by 10*step steps on an interval time period
        });
    });
}
function paddleMoveByMouse(table, paddle) {
    /**
     * Simulating a paddleMove action by human-controlled mouse event
     */
    const mousemove = Observable.fromEvent(table, 'mousemove'), mouseup = Observable.fromEvent(table, 'mouseup'), mousedown = Observable.fromEvent(table, 'mousedown');
    mousedown
        // mousedown drag start (x, y)
        .map(({ clientY }) => ({ yOffset: Number(paddle.attr('y')) - clientY }))
        // operating actions on paddle
        .flatMap(({ yOffset }) => mousemove
        .takeUntil(mouseup)
        .map(({ clientY }) => ({ y: clientY + yOffset })))
        // set final y position of paddle
        .subscribe(({ y }) => paddle.attr('y', y));
}
function deleteInstruction() {
    /**
     * delete the prompt message on the screen
     */
    const instruction = document.getElementById("instruction"); // get the introduction message object from HTML
    Observable
        .interval(0)
        .map(num => "")
        .subscribe(s => instruction.innerHTML = s); // delete instruction message
}
///////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// Global Variables //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
const WIDTH = 700, // width of canvas
HEIGHT = 450, // height of canvas
PADDLEWIDTH = WIDTH / 70, // paddle width 
PADDLEHEIGHT = HEIGHT / 5, // paddle height 
RADIUS = 8, // radius of ball
WINSCORE = 11; // the winning score (i.e. player who get this score win the whole game)
let keys = new Array(300).fill(false);
// an array maps with a boolean value of all keys on real keyboard
// the index is the keycode of each key
// true means the key has been been pressed down, but not pressed up
// false means the key has not been pressing currently.
///////////////// the following simply runs your pong function on window load. ///////////////
if (typeof window != 'undefined')
    window.onload = () => {
        pong();
    };
//# sourceMappingURL=pong.js.map