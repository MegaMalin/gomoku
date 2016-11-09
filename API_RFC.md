# Server API RFC

----------

#### Connect the client and returns an API key that it will use to send commands and the player number.

**GET /connect**

success :

* code : `200`

* result : `{player:INT, key:STRING}`

failure :

* Full : `403`

----------

#### Returns the connection status for both players. A game can only start when both players are connected


**GET /connected**

success :

* code : `200`

* result : `{player1: BOOLEAN, player2: BOOLEAN}`


----------

#### Returns the map as a double array ordered this way : `map[y][x]` containing:

```
0 => No stone

1 => Player one stone

2 => Player two stone
```


**GET /map**

success :

* code : `200`

* result : `{map: [[0, 1, ...], [2, 0, ...], ...]}`


----------

Return the current turn. (1 or 2), and the total turn (42 for example, starts with 1)


**GET /turn**

success :

* code : `200`

* result : `{current: INT, total: INT}`


----------

Makes a move. Needs the API key of the player in order to succeed.
Also need the position where to play


**POST /play**

args :

* key : STRING

* position : `{"x": INT, "y": INT}`

success :

* code : `200`

* result : `{win: BOOLEAN, taken: [{x: INT, y: INT}, ...]}`

failure :

* Bad key : `401`

* Bad move : `403` : `{error: STRING}`


----------

HTTP long polling request:
Will be resolved when it is the player's turn to play
Needs the API key of the player in order to succeed.


**GET /subscribe/turn**

args :

* key : STRING

success :

* code : `200`

* result : `{turn: INT}`

failure :

* Bad key : 401

* The game did not start : `403`


----------

HTTP long polling request:
Will be resolved when the game is ready
Needs the API key of the player in order to succeed.


**GET /subscribe/ready**

args :

* key : STRING

success :

* code : `200`

failure :

* No key : `401`
