#     Pong Game Instruction


1.	Game Instruction
(1)	Game Modes and Operations
This Pong Game is running on 3 modes. They’re Single Player mode , Double Players mode and Single Play (control by mouse) mode.

After refresh the page, it gives some start message above the canvas. This instruction ask user to choose game mode.

To start the game, which means to trigger the paddles, user should press keys on keyboard.
	press key ‘S’: Single Player Mode (controlled by keyboard)
	press key ‘D’: Double Players Mode (both controlled by keyboard)
	press key ‘M’: Single Player Mode (controlled by mouse)

## Single Player Mode (controlled by keyboard)
User control the right paddle 

•	UP: key ‘P’
•	DOWN: key ‘L’ 

# Double Players Mode (controlled by keyboard)
Player 1 control the left paddle 
Player 2 control the right paddle 

♣	player 1 UP: key ‘Q’
♣	player 1 DOWN: key ‘A’
•	player 2 UP: key ‘P’
•	player 2 DOWN: key ‘L’ 

## Single Player Mode (controlled by mouse)
User control the right paddle by click mouse 

•	UP: move mouse up
•	DOWN: move mouse down

•	trigger paddle moving: mouse click down
•	stop paddle moving: mouse click up


After one round, the ball will push out again from left hand side.



(2)	Score System
The scores displays the score like (leftPlayer : rightPlayer) pattern, which shows left player score on left and right player score on right.

In the game design, the player who achieves 11 points win the game.
 Single Player Mode (controlled by keyboard or mouse)

If right player wins, it will display “You WIN!”
If computer wins, it will display “Game Over”

 Double Players Mode (controlled by keyboard)
If right player wins, it will display “right player WIN!”
If left player wins, it will display “left player WIN!”

(3)	Speed up / Slow down ball
In order to increase the difficulty of the game. User can adjust the speed of the ball.
•	SPEED UP: key ‘V’
•	SLOW DOWN: key ‘B’ 





2.	Code Structure
There is a main function(pong) and 5 sub-functions in pong.ts file.

(1)	sub-functions
 getRect: create and return a rect Elem
 getCircle: create and return a circle Elem
 paddleMove: Simulating a paddleMove action by human-controlled keyboard event
 paddleMoveByMouse: Simulating a paddleMove action by human-controlled mouse event
 deleteInstruction: delete the prompt message(for choosing mode) on the screen

(2)	pong
There’re 5 parts in the pong function. They’re
 cursor coordinate display: just for testing cursor’s coordinate 
 object creation: create middle broken lines, paddles and ball
 ball move animation: 
simulate how the ball moves in the canvas
There’re 3 cases in the ball move animation.
### Case 1: 
When the ball hits the up-boundary or bottom-boundary, bounce

### Case 2a: 
When the ball located in the right paddle areas, bounce (i.e. change the direction of ball by negating xstep)

### Case 2b: 
When the ball hits the right-boundary, reset the ball

### Case 3a: 
When the ball located in the left paddle areas, bounce (i.e. change the direction of ball by negating xstep)

### Case 3b: 
When the ball hits the left-boundary, reset the ball that start from left side

 Game mode choice && paddle move: 
ask key press for user’s choice for game mode
after chosen the game mode, simulate the paddles movement
	        Display real-time scores and results

	More detailed code, please see comments from pong.ts
	
3.	Extra Functionality
(1)	Multiple Player Selection Mode
The game has 3 modes for player to choose, they are
 Single Mode
press key ‘S’: Single Player Mode (controlled by keyboard)

User control the right paddle 

•	UP: key ‘P’
•	DOWN: key ‘L’ 


 Double Mode
press key ‘D’: Double Players Mode (both controlled by keyboard)

Player 1 control the left paddle 
Player 2 control the right paddle 

♣	player 1 UP: key ‘Q’
♣	player 1 DOWN: key ‘A’
•	player 2 UP: key ‘P’
•	player 2 DOWN: key ‘L’ 


 Single Mode (by mouse)
press key ‘M’: Single Player Mode (controlled by mouse)

User control the right paddle by click mouse 

•	UP: move mouse up
•	DOWN: move mouse down

•	trigger paddle moving: mouse click down
•	stop paddle moving: mouse click up


(2)	Keyboard event controlling system
Instead of only use mouse to control the paddle, player can also use keyboard to control the paddle

(3)	Speed up / Slow down ball
In order to increase the difficulty of the game. User can adjust the speed of the ball.
•	SPEED UP: key ‘V’
•	SLOW DOWN: key ‘B’ 

