using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;
using System.Net;
using System.Text;
using System.IO;
using UnityEngine.UI;

public class PonPosition
{
	public Vector2 pos;
	public int weight;
	public int playerId;

	public PonPosition(float x, float y, int id)
	{
		pos.x = x;
		pos.y = y;
		weight = 0;
		playerId = id;
	}
}

public class EasyAI : MonoBehaviour {

	public enum State
	{
		NEUTRAL,
		DEFENSIVE,
		OFFENSIVE
	};

	public String url = "http://127.0.0.1:3000/";
	public int score = 0;
	public bool playable = false;
	public int[,] _map;
	public int myId = 1;
	public int turnTotal = 1;
	public String key = null;
	public int playNumber;
	public bool played = false;
	public int player1Score, player2Score = 0;
	private float scoreUpdateRate = 0.0f;
	private float playRate = 0.0f;


	public State state;

	private WWW www;

	[SerializeField] bool isConnected = false;
	private float connectionTryDelay = 0.0f;
	private float turnTryDelay = 0.0f;
	private float restartTryDelay = 0.0f;
	private float mapDelay = 0f;
	private Text logText;
	private Text mapText;

	public List<PonPosition> newMap = new List<PonPosition>();
	public List<PonPosition> tmpMap = new List<PonPosition>();

	public List<PonPosition> lastPlayed = new List<PonPosition>();
	private bool playedSuccess = false;

	public void restartAI()
	{
		isConnected = false;
	}

	void Start ()
	{
		UnityEngine.Random.seed = (int)System.DateTime.Now.Ticks; 
		state = State.NEUTRAL;
		_map = new int[19,19];
		logText = GameObject.Find ("LogText").GetComponent<Text> ();
		mapText = GameObject.Find ("mapText").GetComponent<Text> ();
		logText.text = "";
	}

	void Update()
	{
		//###############################################
		// Connect
		//###############################################
		if (!isConnected && connectionTryDelay < Time.time) {
			connectionTryDelay = Time.time + 0.5f;
			StartCoroutine (coroutineConnect (url + "connect"));
			return;
		}
		if (!playable)
			StartCoroutine (coroutineConnected (url + "connected"));

		//###############################################
		// Get and update the map
		//###############################################
		if (newMap.Count < 1 && _map.Length > 0)
			initMap ();
		if (mapDelay < Time.time) {
			mapDelay = Time.time + 0.5f;
			updateMap ();
		}


		//###############################################
		// Play if i can
		//###############################################
		if (turnTryDelay < Time.time) {
			turnTryDelay = Time.time + 0.5f;
			turn ();
		}
		if (myId == playNumber && playable && playRate < Time.time) {
			playRate = Time.time + 0.5f;
			aiPlay ();
		}

		//###############################################
		// Get and update the score
		//###############################################
		if (scoreUpdateRate < Time.time) {
			scoreUpdateRate = Time.time + 0.5f;
			getPlayersScore (this);
		}

		//###############################################
		// Determinate state
		//###############################################
		if (player2Score < player1Score)
			state = State.OFFENSIVE;
		else if (player2Score > player1Score)
			state = State.DEFENSIVE;
		else
			state = State.NEUTRAL;
	}

	public void aiPlay()
	{
		if (!played) {
			played = true;
			initMap ();
			updateMap ();
			tmpMap.Clear ();
			assignWeight ();

			if (!playedSuccess) {
				for (int i = 0; i < lastPlayed.Count; i++) {
					for (int z = 0; z < newMap.Count; z++) {
						if ((int)newMap [z].pos.x == lastPlayed [i].pos.x && (int)newMap [z].pos.y == lastPlayed [i].pos.y)
							newMap [z].weight = 0;
					}
				}
			}

			int tmpW = getHeavier ();
			for (int z = 0; z < newMap.Count; z++) {
				/*for (int r = 0;r < (int)newMap [z].weight;r++)
					tmpMap.Add (newMap [z]);*/
				if ((int)newMap [z].weight == tmpW)
					tmpMap.Add (newMap [z]);
			}
			PonPosition ponToPlay = tmpMap [UnityEngine.Random.Range (0, tmpMap.Count)];
			Debug.Log ((int)ponToPlay.pos.y + " / " + (int)ponToPlay.pos.x + "    case : " + findPonWithPos ((int)ponToPlay.pos.y, (int)ponToPlay.pos.x).playerId);
			play ((int)ponToPlay.pos.y, (int)ponToPlay.pos.x);
			lastPlayed.Add (ponToPlay);
			played = false;
			playedSuccess = false;
		}
	}

	public void initMap()
	{
		for (int x = 0; x < 19; x++)
		{
			for (int y = 0; y < 19; y++) {
				newMap.Add (new PonPosition(x, y, _map[x, y]));
			}
		}
	}

	public void updateMap()
	{
		for (int x = 0; x < 19; x++)
		{
			for (int y = 0; y < 19; y++) {
				PonPosition tmp = findPonWithPos (x, y);
				if (_map[x , y] != tmp.playerId)
					tmp.playerId = _map[x, y];
			}
		}
	}
		
	public PonPosition findPonWithPos(int x, int y)
	{
		for (int z = 0; z < newMap.Count; z++) {
			if ((int)newMap [z].pos.x == x && (int)newMap [z].pos.y == y)
				return newMap [z];
		}
		return null;
	}

	public void assignWeight()
	{
		for (int z = 0; z < newMap.Count; z++) {
			if (newMap [z].playerId == 0) {
				//###############################################
				// Easy
				//###############################################
			/*	checkHorizontal (newMap [z] , 2);
				checkVertical (newMap [z], 2);
				checkDiagonal (newMap [z], 2);
				checkGoodPositions (newMap [z], 2);
				checkHorizontal (newMap [z] , 1);
				checkVertical (newMap [z], 1);
				checkDiagonal (newMap [z], 1);*/

				//###############################################
				// Medium
				//###############################################
		/*		checkHorizontal (newMap [z] , 2);
				checkVertical (newMap [z], 2);
				checkDiagonal (newMap [z], 2);
				checkGoodPositions (newMap [z], 2);
				checkHorizontal (newMap [z] , 1);
				checkVertical (newMap [z], 1);
				checkDiagonal (newMap [z], 1);
				checkGoodPositions (newMap [z], 1);
				if (state == State.OFFENSIVE || state == State.NEUTRAL) {
					checkGoodPositions (newMap [z], 1);
				}
				else if (state == State.DEFENSIVE)
					checkGoodPositions (newMap [z], 2);*/
				

				//###############################################
				// Motherbrain
				//###############################################
			checkHorizontal (newMap [z] , 2);
			checkVertical (newMap [z], 2);
			checkDiagonal (newMap [z], 2);
			checkGoodPositions (newMap [z], 2);
			checkHorizontal (newMap [z] , 1);
			checkVertical (newMap [z], 1);
			checkDiagonal (newMap [z], 1);
			checkGoodPositions (newMap [z], 1);
			checkDangerousPosition (newMap [z], 1);
			checkDangerousPosition (newMap [z], 2);
			}
		}
	}

	public void checkGoodPositions(PonPosition pp, int id)
	{
		//###############################################
		// Horizontal
		//###############################################
		if ((int)pp.pos.y - 4 >= 0 && _map [(int)pp.pos.x, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x, (int)pp.pos.y - 2] == id
			&& (_map [(int)pp.pos.x, (int)pp.pos.y - 3] == id && _map [(int)pp.pos.x, (int)pp.pos.y - 4] == id))
			pp.weight += 1000;
		else if ((int)pp.pos.y - 4 >= 0 && _map [(int)pp.pos.x, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x, (int)pp.pos.y - 2] == id
			&& (_map [(int)pp.pos.x, (int)pp.pos.y - 3] == id))
			pp.weight += 500;
		else if ((int)pp.pos.y - 2 >= 0 && _map [(int)pp.pos.x, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x, (int)pp.pos.y - 2] == id)
			pp.weight += 250;

		if ((int)pp.pos.y + 4 <= 18 && _map [(int)pp.pos.x, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x, (int)pp.pos.y + 2] == id
			&& (_map [(int)pp.pos.x, (int)pp.pos.y + 3] == id && _map [(int)pp.pos.x, (int)pp.pos.y + 4] == id))
			pp.weight += 1000;
		else if ((int)pp.pos.y + 4 <= 18 && _map [(int)pp.pos.x, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x, (int)pp.pos.y + 2] == id
			&& (_map [(int)pp.pos.x, (int)pp.pos.y + 3] == id))
			pp.weight += 500;
		else if ((int)pp.pos.y + 2 <= 18 && _map [(int)pp.pos.x, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x, (int)pp.pos.y + 2] == id)
			pp.weight += 250;
		

		//###############################################
		// Vertical
		//###############################################
		if ((int)pp.pos.x + 4 <=  18 && _map [(int)pp.pos.x + 1, (int)pp.pos.y] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y] == id
			&& (_map [(int)pp.pos.x + 3, (int)pp.pos.y] == id && _map [(int)pp.pos.x + 4, (int)pp.pos.y] == id))
			pp.weight += 1000;
		else if ((int)pp.pos.x + 4 <=  18 && _map [(int)pp.pos.x + 1, (int)pp.pos.y] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y] == id
			&& (_map [(int)pp.pos.x + 3, (int)pp.pos.y] == id))
			pp.weight += 500;
		else if ((int)pp.pos.x + 2 <=  18 && _map [(int)pp.pos.x + 1, (int)pp.pos.y] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y] == id)
			pp.weight += 250;

		if ((int)pp.pos.x - 4 >= 0 && _map [(int)pp.pos.x - 1, (int)pp.pos.y] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y] == id
			&& (_map [(int)pp.pos.x - 3, (int)pp.pos.y] == id && _map [(int)pp.pos.x - 4, (int)pp.pos.y] == id))
			pp.weight += 1000;
		else if ((int)pp.pos.x - 4 >= 0 && _map [(int)pp.pos.x - 1, (int)pp.pos.y] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y] == id
			&& (_map [(int)pp.pos.x - 3, (int)pp.pos.y] == id))
			pp.weight += 500;
		else if ((int)pp.pos.x - 2 >= 0 && _map [(int)pp.pos.x - 1, (int)pp.pos.y] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y] == id)
			pp.weight += 250;


		//###############################################
		// Diagonal
		//###############################################
		if ((int)pp.pos.x - 4 >=  0 && (int)pp.pos.y - 4 >=  0 && 
			_map [(int)pp.pos.x - 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y - 2] == id
			&& (_map [(int)pp.pos.x - 3, (int)pp.pos.y - 3] == id && _map [(int)pp.pos.x - 4, (int)pp.pos.y - 4] == id))
			pp.weight += 1000;
		else if ((int)pp.pos.x - 4 >=  0 && (int)pp.pos.y - 4 >=  0 && 
			_map [(int)pp.pos.x - 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y - 2] == id
			&& (_map [(int)pp.pos.x - 3, (int)pp.pos.y - 3] == id))
			pp.weight += 500;
		else if ((int)pp.pos.x - 2 >=  0 && (int)pp.pos.y - 2 >=  0 && 
			_map [(int)pp.pos.x - 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y - 2] == id)
			pp.weight += 250;

		if ((int)pp.pos.y + 4 <=  18 && (int)pp.pos.x + 4 <=  18 && 
			_map [(int)pp.pos.x + 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y + 2] == id
			&& (_map [(int)pp.pos.x + 3, (int)pp.pos.y + 3] == id && _map [(int)pp.pos.x + 4, (int)pp.pos.y + 4] == id))
			pp.weight += 1000;
		else if ((int)pp.pos.y + 4 <=  18 && (int)pp.pos.x + 4 <=  18 && 
			_map [(int)pp.pos.x + 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y + 2] == id
			&& (_map [(int)pp.pos.x + 3, (int)pp.pos.y + 3] == id))
			pp.weight += 500;
		else if ((int)pp.pos.y + 2 <=  18 && (int)pp.pos.x + 2 <=  18 && 
			_map [(int)pp.pos.x + 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y + 2] == id)
			pp.weight += 250;
		
		if ((int)pp.pos.y - 4 >=  0 && (int)pp.pos.x + 4 <=  18 && 
			_map [(int)pp.pos.x + 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y - 2] == id
			&& (_map [(int)pp.pos.x + 3, (int)pp.pos.y - 3] == id && _map [(int)pp.pos.x + 4, (int)pp.pos.y - 4] == id))
			pp.weight += 1000;
		else if ((int)pp.pos.y - 4 >=  0 && (int)pp.pos.x + 4 <=  18 && 
			_map [(int)pp.pos.x + 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y - 2] == id
			&& (_map [(int)pp.pos.x + 3, (int)pp.pos.y - 3] == id))
			pp.weight += 500;
		else if ((int)pp.pos.y - 2 >=  0 && (int)pp.pos.x + 2 <=  18 && 
			_map [(int)pp.pos.x + 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y - 2] == id)
			pp.weight += 250;

		if ((int)pp.pos.x - 4 >=  0 && (int)pp.pos.y + 4 <=  18 && 
			_map [(int)pp.pos.x - 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y + 2] == id
			&& (_map [(int)pp.pos.x - 3, (int)pp.pos.y + 3] == id && _map [(int)pp.pos.x - 4, (int)pp.pos.y + 4] == id))
			pp.weight += 1000;
		else if ((int)pp.pos.x - 4 >=  0 && (int)pp.pos.y + 4 <=  18 && 
			_map [(int)pp.pos.x - 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y + 2] == id
			&& (_map [(int)pp.pos.x - 3, (int)pp.pos.y + 3] == id))
			pp.weight += 500;
		else if ((int)pp.pos.x - 2 >=  0 && (int)pp.pos.y + 2 <=  18 && 
			_map [(int)pp.pos.x - 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y + 2] == id)
			pp.weight += 250;
	}

	public void checkDangerousPosition(PonPosition pp, int id)
	{
	//###############################################
	// Check XXOXX horizontal
	//###############################################
		if ((int)pp.pos.x - 2 >=  0 && (int)pp.pos.x + 2 <=  18
			&& _map [(int)pp.pos.x - 1, (int)pp.pos.y ] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y] == id
			&& _map [(int)pp.pos.x + 1, (int)pp.pos.y] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y] == id)
			pp.weight += 1000;

	//###############################################
	// Check XOXXX && XXXOX horizontal
	//###############################################
	if ((int)pp.pos.x - 1 >=  0 && (int)pp.pos.x + 3 <=  18
		&& _map [(int)pp.pos.x - 1, (int)pp.pos.y ] == id && _map [(int)pp.pos.x + 1, (int)pp.pos.y] == id
		&& _map [(int)pp.pos.x + 2, (int)pp.pos.y] == id && _map [(int)pp.pos.x + 3, (int)pp.pos.y] == id)
		pp.weight += 1000;

	if ((int)pp.pos.x - 3 >=  0 && (int)pp.pos.x + 1 <=  18
		&& _map [(int)pp.pos.x - 1, (int)pp.pos.y ] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y] == id
		&& _map [(int)pp.pos.x - 3, (int)pp.pos.y] == id && _map [(int)pp.pos.x + 1, (int)pp.pos.y] == id)
		pp.weight += 1000;


	//###############################################
	// Check XXOXX vertical
	//###############################################
		if ((int)pp.pos.y - 2 >=  0 && (int)pp.pos.y + 2 <=  18
			&& _map [(int)pp.pos.x , (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x , (int)pp.pos.y + 2] == id
			&& _map [(int)pp.pos.x, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x, (int)pp.pos.y - 2] == id)
			pp.weight += 1000;


	//###############################################
	// Check XOXXX && XXXOX vertical
	//###############################################
	if ((int)pp.pos.y - 1 >=  0 && (int)pp.pos.y + 3 <=  18
		&& _map [(int)pp.pos.x , (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x , (int)pp.pos.y + 2] == id
		&& _map [(int)pp.pos.x, (int)pp.pos.y + 3] == id && _map [(int)pp.pos.x, (int)pp.pos.y - 1] == id)
		pp.weight += 1000;

	if ((int)pp.pos.y - 3 >=  0 && (int)pp.pos.y + 1 <=  18
		&& _map [(int)pp.pos.x , (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x , (int)pp.pos.y - 1] == id
		&& _map [(int)pp.pos.x, (int)pp.pos.y - 2] == id && _map [(int)pp.pos.x, (int)pp.pos.y - 3] == id)
		pp.weight += 1000;


	//###############################################
	// Check XXOXX diagonal
	//###############################################
		if ((int)pp.pos.x - 2 >=  0 && (int)pp.pos.y - 2 >=  0 && (int)pp.pos.x + 2 <=  18 && (int)pp.pos.y + 2 <=  18
			&& _map [(int)pp.pos.x - 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y - 2] == id
			&& _map [(int)pp.pos.x + 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y + 2] == id)
			pp.weight += 1000;
		else if ((int)pp.pos.x - 2 >=  0 && (int)pp.pos.y - 2 >=  0 && (int)pp.pos.x + 2 <=  18 && (int)pp.pos.y + 2 <=  18
			&& _map [(int)pp.pos.x - 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y + 2] == id
			&& _map [(int)pp.pos.x + 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x + 2, (int)pp.pos.y - 2] == id)
			pp.weight += 1000;



	//###############################################
	// Check XOXXX && XXXOX diagonal
	//###############################################
	if ((int)pp.pos.x - 1 >=  0 && (int)pp.pos.y - 1 >=  0 && (int)pp.pos.x + 3 <=  18 && (int)pp.pos.y + 3 <=  18
		&& _map [(int)pp.pos.x - 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x + 1, (int)pp.pos.y + 1] == id
		&& _map [(int)pp.pos.x + 2, (int)pp.pos.y + 2] == id && _map [(int)pp.pos.x + 3, (int)pp.pos.y + 3] == id)
		pp.weight += 1000;
	if ((int)pp.pos.x - 3 >=  0 && (int)pp.pos.y - 3 >=  0 && (int)pp.pos.x + 1 <=  18 && (int)pp.pos.y + 1 <=  18
		&& _map [(int)pp.pos.x - 1, (int)pp.pos.y - 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y - 2] == id
		&& _map [(int)pp.pos.x - 3, (int)pp.pos.y - 3] == id && _map [(int)pp.pos.x + 1, (int)pp.pos.y + 1] == id)
		pp.weight += 1000;

	if ((int)pp.pos.x - 2 >=  0 && (int)pp.pos.y - 2 >=  0 && (int)pp.pos.x + 2 <=  18 && (int)pp.pos.y + 2 <=  18
		&& _map [(int)pp.pos.x - 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x + 1, (int)pp.pos.y - 1] == id
		&& _map [(int)pp.pos.x + 2, (int)pp.pos.y - 2] == id && _map [(int)pp.pos.x + 3, (int)pp.pos.y - 3] == id)
		pp.weight += 1000;
	if ((int)pp.pos.x - 2 >=  0 && (int)pp.pos.y - 2 >=  0 && (int)pp.pos.x + 2 <=  18 && (int)pp.pos.y + 2 <=  18
		&& _map [(int)pp.pos.x - 1, (int)pp.pos.y + 1] == id && _map [(int)pp.pos.x - 2, (int)pp.pos.y + 2] == id
		&& _map [(int)pp.pos.x - 3, (int)pp.pos.y + 3] == id && _map [(int)pp.pos.x + 1, (int)pp.pos.y - 1] == id)
		pp.weight += 1000;

	}

	public void checkHorizontal(PonPosition pp, int id)
	{
		for (int n = 1; n < 5; n++) {
			if ((int)pp.pos.y - n >= 0 && _map [(int)pp.pos.x, (int)pp.pos.y - n] == id)
			pp.weight += 250 / (n + 1);
		}
		for (int n = 1; n < 5; n++) {
			if ((int)pp.pos.y + n <= 18 && _map [(int)pp.pos.x, (int)pp.pos.y + n] == id)
			pp.weight += 250 / (n + 1);
		}

	}

	public void checkVertical(PonPosition pp, int id)
	{
		for (int n = 1; n < 5; n++) {
			if ((int)pp.pos.x - n >= 0 && _map [(int)pp.pos.x - n, (int)pp.pos.y] == id)
			pp.weight += 250 / (n + 1);
		}
		for (int n = 1; n < 5; n++) {
			if ((int)pp.pos.x + n <= 18 && _map [(int)pp.pos.x + n, (int)pp.pos.y] == id)
			pp.weight += 250 / (n + 1);
		}
	}

	public void checkDiagonal(PonPosition pp, int id)
	{
		for (int n = 1; n < 5; n++) {
			if ((int)pp.pos.x - n >= 0 && (int)pp.pos.y - n >= 0 && _map [(int)pp.pos.x - n, (int)pp.pos.y - n] == id)
			pp.weight += 250 / (n + 1);
		}
		for (int n = 1; n < 5; n++) {
			if ((int)pp.pos.x + n <= 18 && (int)pp.pos.y + n <= 18 && _map [(int)pp.pos.x + n, (int)pp.pos.y + n] == id)
			pp.weight += 250 / (n + 1);
		}
		for (int n = 1; n < 5; n++) {
			if ((int)pp.pos.x - n >= 0 && (int)pp.pos.y + n <= 18 && _map [(int)pp.pos.x - n, (int)pp.pos.y + n] == id)
			pp.weight += 250 / (n + 1);
		}
		for (int n = 1; n < 5; n++) {
			if ((int)pp.pos.x + n <= 18 && (int)pp.pos.y - n >= 0 && _map [(int)pp.pos.x + n, (int)pp.pos.y - n] == id)
			pp.weight += 250 / (n + 1);
		}
	}

	public int getHeavier()
	{
		int tmp = 0;
		for (int z = 0; z < newMap.Count; z++) {
			if ((int)newMap [z].weight > tmp)
				tmp = (int)newMap [z].weight;
		}
		return tmp;
	}

	IEnumerator coroutineConnect(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
		isConnected = false;
			//Debug.Log ("WWW Error /connect: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			playNumber = (int)result [0].n;
			key = result [1].str;
			isConnected = true;
			//Debug.Log ("Player number : " + playNumber + " | Key : " + key);
			logText.text += "\n" + "Player number : " + playNumber + " | Key : " + key;
		}
	}

	IEnumerator coroutineConnected(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			//Debug.Log ("WWW Error /connected: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			if (result [0].b == true && result [1].b == true)
				playable = true;
			else
				playable = false;
			//Debug.Log ("Player1 : " + result[0].b + " | Player2 : " + result[1].b + " => Playable : " + playable);
		}
	}

	public void map()
	{
		StartCoroutine(coroutineMap(url + "map"));
	}

	IEnumerator coroutineMap(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			//Debug.Log ("WWW Error /map: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			string debug = "Map :\n";
			for (int x = 0; x < 19; x++)
			{
				for (int y = 0; y < 19; y++)
				{
					_map[x,y] = (int)result[0][x][y].n;
					debug = debug + "[" + x + "][" + y + "]:" + _map[x,y] + " ";
				}
				debug += "\n";
			}
			//Debug.Log (debug);
		}
	}

	public void turn()
	{
		StartCoroutine(coroutineTurn(url + "turn"));
		map();
	}

	IEnumerator coroutineTurn(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			//Debug.Log ("WWW Error /turn: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			myId = (int)result[0].n;
			turnTotal = (int)result[1].n;
			//Debug.Log ("Player turn : " + myId + " | Turn total : " + turnTotal);
		}
	}


	IEnumerator coroutinePlay(String url)
		{
			www = new WWW(url);
			yield return new WaitForSeconds(0.1F);
			if (www.error != null)
			{
				Debug.Log ("WWW Error /play: " + www.error);
			}
			else
			{
				JSONObject result = new JSONObject (www.text);
				Debug.Log ("Win : " + result["win"].b + " - Taken : " + result["taken"]);
			playedSuccess = true;
			lastPlayed.Clear ();
				yield return new WaitForSeconds(5F);
			}
		}

	public void play(int x, int y)
	{
		if (playable == true) {
			StartCoroutine (coroutinePlay (url + "play?key=" + key + "&position={\"x\":" + x + ",\"y\":" + y + "}"));
		} else {
			//Debug.Log ("Error : The game is not started !");
		}
	}

	IEnumerator coroutineRestart(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			//Debug.Log ("WWW Error /restart: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			//Debug.Log ("Restart : " + (bool)result[0].b);
		}
	}

	public void restart()
	{
		StartCoroutine (coroutineRestart(url + "restart" + "?key=" + key));
	}

	public void getPlayersScore(EasyAI _gm)
	{
		StartCoroutine (coroutineGetPlayersScore (_gm));
	}


	IEnumerator coroutineGetPlayersScore(EasyAI _gm)
	{
		String urlTmp = url + "scores"; //Returns the score for both players.
		WWW www = new WWW (urlTmp);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
			Debug.Log ("WWW Error /subscribe/turn: " + www.error);
		else
		{
			JSONObject result = new JSONObject (www.text);
			_gm.player1Score = (int)result[0].n;
			_gm.player2Score = (int)result[1].n;
		}
	}
}
