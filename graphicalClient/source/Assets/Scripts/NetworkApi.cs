using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;
using System.Net;
using System.Text;
using System.IO;

public class NetworkApi : MonoBehaviour
{
	public String url;
	private WWW www;

	void Start()
	{
		url = "http://" + PlayerPrefs.GetString ("ip") + ":3000/";
	}

	public void play(int x, int y, string playerKey)
	{
		StartCoroutine (coroutinePlay (url + "play" + "?key=" + playerKey + "&position={\"x\":" + x + ",\"y\":" + y + "}"));
	}

	public void getPlayersScore(GameManager _gm)
	{
		StartCoroutine (coroutineGetPlayersScore (_gm));
	}

	public void connect(PlayerController playerController)
	{
		StartCoroutine(coroutineConnect(url + "connect", playerController));
	}

	public void connected(GameManager _gm)
	{
		StartCoroutine(coroutineConnected(url + "connected", _gm));
	}

	public void map(GameManager _gm)
	{
		StartCoroutine(coroutineMap(url + "map", _gm));
	}

	public void turn(GameManager _gm)
	{
		StartCoroutine(coroutineTurn(url + "turn", _gm));
	}

	public void restart(string key)
	{
		StartCoroutine (coroutineRestart(url + "restart?key=" + key));
	}

	public void won(GameManager _gm) 
	{
		StartCoroutine(coroutineWon(url + "won", _gm));
	}

	IEnumerator coroutineWon(string url, GameManager _gm)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null){
			//Debug.Log ("WWW Error /win: " + www.error);
		}else
		{
			JSONObject result = new JSONObject (www.text);
			_gm.winnerID = (int)result [0].n;
			//Debug.Log ("Player " + _gm.winnerID.ToString () + " wins !");
		}	
	}

	IEnumerator coroutineConnect(String url, PlayerController playerController)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null){
			//Debug.Log ("WWW Error /connect: " + www.error);
		}else
		{
			JSONObject result = new JSONObject (www.text);
			playerController.myBoardID = (int)result [0].n;
			playerController.myNetworkKey = result [1].str;
			playerController.connected = true;
			//Debug.Log ("Player number : " + playerController.myBoardID + " | Key : " + playerController.myNetworkKey);
		}
	}


	IEnumerator coroutineConnected(String url, GameManager _gm)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null) {
			//Debug.Log ("WWW Error /connected: " + www.error);
		}else
		{
			JSONObject result = new JSONObject (www.text);
			if (result [0].b == true && result [1].b == true)
				_gm.gameIsReady = true;
		}
	}


	IEnumerator coroutineMap(String url, GameManager _gm)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null) {
			//Debug.Log ("WWW Error /map: " + www.error);
		}else
		{
			JSONObject result = new JSONObject (www.text);
			string debug = "Map :\n";
			for (int x = 0; x < 19; x++)
			{
				for (int y = 0; y < 19; y++)
				{
					_gm.map[x,y] = (int)result[0][x][y].n;
					debug = debug + "[" + x + "][" + y + "]:" + _gm.map [x,y] + " ";
				}
				debug += "\n";
			}
			//Debug.Log (debug);
		}
	}

	IEnumerator coroutineTurn(String url, GameManager _gm)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null) {
			//Debug.Log ("WWW Error /turn: " + www.error);
		}else
		{
			JSONObject result = new JSONObject (www.text);
			_gm.playersTurn = (int)result[0].n;
			_gm.turnTotal = (int)result[1].n;
			//Debug.Log ("Player turn : " + _gm.playersTurn + " | Turn total : " + _gm.turnTotal);
		}
	}

	IEnumerator coroutinePlay(String url)
	{
		www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null) {
			//Debug.Log ("WWW Error /play: " + www.error);
		}else
		{
			JSONObject result = new JSONObject (www.text);
			//Debug.Log ("Win : " + result["win"].b + " - Taken : " + result["taken"]);
			yield return new WaitForSeconds (0.5f);
		}
	}



	IEnumerator coroutineGetPlayersScore(GameManager _gm)
	{
		String urlTmp = url + "scores"; //Returns the score for both players.
		WWW www = new WWW (urlTmp);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null){
			//Debug.Log ("WWW Error /subscribe/turn: " + www.error);
		}else
		{
			JSONObject result = new JSONObject (www.text);
			_gm.player1Score = (int)result[0].n;
			_gm.player2Score = (int)result[1].n;
		}
	}

	IEnumerator coroutineRestart(string url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null) {
			//Debug.Log ("WWW Error /restart: " + www.error);
		}else
		{
			JSONObject result = new JSONObject (www.text);
			//Debug.Log ("Restart : " + (bool)result[0].b);
		}
	}
}

