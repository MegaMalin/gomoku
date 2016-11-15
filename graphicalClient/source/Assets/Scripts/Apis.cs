using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;
using System.Net;
using System.Text;
using System.IO;

public class Apis : MonoBehaviour
{
	public String url = "http://127.0.0.1:3000/";
	public int score = 0;
	public bool playable = false;
	public int[,] mapTab;
	public int turnPlayer = 1;
	public int turnTotal = 1;
	public String key = null;
	public int playNumber;

	private GameManager _gm;
	private ResourcesManager _rm;
	private AudioSource soundsAudioSource;

	void Start ()
	{
		mapTab = new int[19,19];
	}

	void Update()
	{
		if (!_gm)
			_gm = GameObject.Find ("GameManager").GetComponent<GameManager> ();
		if (!_rm)
			_rm = GameObject.Find ("ResourcesManager").GetComponent<ResourcesManager> ();
		if (!soundsAudioSource)
			soundsAudioSource = GameObject.Find ("SoundsSource1").GetComponent<AudioSource> ();
	}

	IEnumerator coroutineConnect(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			Debug.Log ("WWW Error /connect: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			playNumber = (int)result [0].n;
			key = result [1].str;
			Debug.Log ("Player number : " + playNumber + " | Key : " + key);
		}
	}

	public void connect()
	{
		StartCoroutine(coroutineConnect(url + "connect"));
	}

	IEnumerator coroutineConnected(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			Debug.Log ("WWW Error /connected: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			if (result [0].b == true && result [1].b == true)
				playable = true;
			else
				playable = false;
			Debug.Log ("Player1 : " + result[0].b + " | Player2 : " + result[1].b + " => Playable : " + playable);
		}
	}

	public void connected()
	{
		StartCoroutine(coroutineConnected(url + "connected"));
	}

	IEnumerator coroutineMap(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			Debug.Log ("WWW Error /map: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			string debug = "Map :\n";
			for (int x = 0; x < 19; x++)
			{
				for (int y = 0; y < 19; y++)
				{
					mapTab[x,y] = (int)result[0][x][y].n;
					debug = debug + "[" + x + "][" + y + "]:" + mapTab [x,y] + " ";
				}
				debug += "\n";
			}
			Debug.Log (debug);
		}
	}

	public void map()
	{
		StartCoroutine(coroutineMap(url + "map"));
	}

	IEnumerator coroutineTurn(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			Debug.Log ("WWW Error /turn: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			turnPlayer = (int)result[0].n;
			turnTotal = (int)result[1].n;
			Debug.Log ("Player turn : " + turnPlayer + " | Turn total : " + turnTotal);
		}
	}

	public void turn()
	{
		StartCoroutine(coroutineTurn(url + "turn"));
	}

	IEnumerator coroutinePlay(String url, Transform objectHit)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			Debug.Log ("WWW Error /play: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			if (playNumber == 1)
			{
				objectHit.GetComponent<Intersection> ().pon = (GameObject)Instantiate (_gm.whitePon, objectHit.position, objectHit.rotation);
				_gm._rm._logsText.text = "Tour du joueur noir";
			}
			else if (playNumber == 2)
			{
				objectHit.GetComponent<Intersection> ().pon = (GameObject)Instantiate (_gm.blackPon, objectHit.position, objectHit.rotation);
				_gm._rm._logsText.text = "Tour du joueur blanc";
			}
			_rm.playerPonPosedSound ();
			_gm.turnNbr++;
			_gm.endTurn ();
			Debug.Log ("Win : " + result["win"].b);
		}
	}
	
	public void play(int x, int y, Transform objectHit)
	{
		if (playable == true)
			StartCoroutine (coroutinePlay (url + "play" + "?key=" + key + "&position={\"x\":" + x + ",\"y\":" + y + "}", objectHit));
		else
			Debug.Log ("Error : The game is not started !");
	}

	IEnumerator coroutinePlayerScore(String url)
	{
		WWW www = new WWW(url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			Debug.Log ("WWW Error /player_score: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			score = (int)result [0].n;
			Debug.Log ("Your score : " + score);
		}
	}

	public void playerScore()
	{
		StartCoroutine (coroutinePlayerScore(url + "player_score" + "?key=" + key));
	}

	IEnumerator coroutineSubscribeTurn(String url)
	{
		WWW www = new WWW (url);
		yield return new WaitForSeconds(0.1F);
		if (www.error != null)
		{
			Debug.Log ("WWW Error /subscribe/turn: " + www.error);
		}
		else
		{
			JSONObject result = new JSONObject (www.text);
			turnPlayer = (int)result[0].n;
			Debug.Log ("Turn of player : " + turnPlayer);
		}
	}
		
	public void subscribeTurn()
	{
		return; 
		//Not implemented in v1
		/*if (key == null)
			Debug.Log ("WWW Error /subscribe/turn: You d'ont have a key !");
		else
			StartCoroutine(coroutineSubscribeTurn(url + "subscribe/turn&key=" + key));*/
	}

	IEnumerator coroutineSubscribeReady(String url)
	{
		WWW www = new WWW (url);
		yield return new WaitForSeconds (0.1F);
		if (www.error != null)
		{
			Debug.Log ("WWW Error /subscribe/ready: " + www.error);
		}
		else
		{
			playable = true;
			Debug.Log ("Playable : " + playable);
		}
	}

	public void subscribeReady()
	{
		return; 
		//Not implemented in v1
		/*if (key == null)
			Debug.Log ("WWW Error /subscribe/ready: You d'ont have a key !");
		else
			StartCoroutine(coroutineSubscribeReady(url + "subscribe/ready&key=" + key));*/
	}
}

