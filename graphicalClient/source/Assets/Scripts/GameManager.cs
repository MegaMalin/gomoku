using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using System.Collections.Generic;
using UnityEngine.SceneManagement;

public class GameManager : MonoBehaviour {

	public GameObject Player1;

	public AudioSource _as;
	public ResourcesManager _rm;

	public int player1Score, player2Score = 0;
	public GameObject whitePon, blackPon;
	public bool gameIsOver = false;
	[SerializeField] float gameOverDelay = 0.0f;

	// Network API
	public NetworkApi network;
	public int playersTurn = 1;
	public int turnTotal = 0;
	public bool gameIsReady = false;
	public int winnerID = 0;
	[SerializeField] float turnTryDelay = 0.0f;
	[SerializeField] float scoreUpdateRate = 0.0f;

	// MAP
	public List<Intersection> board = new List<Intersection>();
	public int[,] map;
	[SerializeField] float mapDelay = 0f;

	void Start () {
		map = new int[19,19];
		_rm = GameObject.Find ("ResourcesManager").GetComponent<ResourcesManager> ();
		_as = GetComponent<AudioSource> ();
		network = GameObject.Find ("Network").GetComponent<NetworkApi>();
	}
	
	void Update () {
		if (Input.GetKeyDown (KeyCode.R))
			restartGame ();
		if (winnerID > 0 && !gameIsOver && gameOverDelay < Time.time) {
			gameOverDelay = Time.time + 1f;
			gameIsOver = true;
			gameOver ();
		}
		if (!gameIsReady) {
			network.connected (this);
			return;
		}
		
		if (mapDelay < Time.time) {
			mapDelay = Time.time + 0.1f;
			network.map (this);
			network.won (this);
			updateMap ();
		}
		if (turnTryDelay < Time.time) {
			turnTryDelay = Time.time + 0.5f;
			network.turn (this);
		}
		if (scoreUpdateRate < Time.time) {
			scoreUpdateRate = Time.time + 0.5f;
			network.getPlayersScore (this);
		}
		_rm.player1PonsEatenText.text = "Pions mangés : " + player1Score;
		_rm.player2PonsEatenText.text = "Pions mangés : " + player2Score;
	}

	public Intersection findPonWithPos(int x, int y)
	{
		for (int z = 0; z < board.Count; z++)
		{
			if (board [z].boardPos.x == x && board [z].boardPos.y == y)
				return board [z];
		}
		return null;
	}

	public void updateMap()
	{
		for (int x = 0; x < 19; x++)
		{
			for (int y = 0; y < 19; y++) {
				Intersection tmp = findPonWithPos (x, y);
				if (map [y,x] == 0 && tmp.pon != null)
					destroyPon (tmp.pon);
				if (map [y,x] == 1 && tmp.pon == null)
					posePon(tmp, whitePon);
				if (map [y,x] == 2 && tmp.pon == null)
					posePon(tmp, blackPon);
			}
		}
	}

	public void posePon(Intersection tmp, GameObject pon)
	{
		tmp.GetComponent<Intersection> ().pon = (GameObject)Instantiate (pon, tmp.transform.position, tmp.transform.rotation);
		StartCoroutine(ponPosedAnim(tmp.transform));
	}

	IEnumerator ponPosedAnim(Transform objectHit)
	{
		GameObject go =  (GameObject)Instantiate (_rm.SFXponPosed, objectHit.position + new Vector3(0, 0.005f, 0), objectHit.rotation);
		Destroy (go, 3);
		yield return new WaitForSeconds(0.1f);
	}


	public void gameOver()
	{
		// TO DO : Display winner's ID on GUI
		GameObject.Find ("Camera").GetComponent<Animator> ().SetTrigger ("End");
	}

	public void destroyPonWithPos(int x, int y)
	{
		for (int i = 0; i < board.Count; i++) {
			if (board [i].boardPos.x == x && board [i].boardPos.y == y) {
				destroyPon (board [i].pon);
			}
		}
	}

	public void destroyPon(GameObject pon)
	{
		ResourcesManager tmp = GameObject.Find("ResourcesManager").GetComponent<ResourcesManager>();
		_as.clip = tmp.ponDestroyedSound;
		_as.Play ();
		GameObject go =  (GameObject)Instantiate (tmp.SFXponDestroyed, pon.transform.position + new Vector3(0, 0.02f, 0), pon.transform.rotation);
		Destroy (go, 5f);
		Destroy (pon);
	}

	public void restartGame()
	{
		StartCoroutine (restartGameCoroutine ());
	}

	IEnumerator restartGameCoroutine()
	{
		string key = Player1.GetComponent<PlayerController> ().myNetworkKey;
		yield return new WaitForSeconds (0.5f);
		network.restart (key);
		yield return new WaitForSeconds (0.5f);
		SceneManager.LoadScene(0);
	}

	public void exitGame()
	{
		StartCoroutine (exitGameCoroutine ());
	}
		
	IEnumerator exitGameCoroutine()
	{
		string key = Player1.GetComponent<PlayerController> ().myNetworkKey;
		network.restart (key);
		yield return new WaitForSeconds (0.5f);
		Application.Quit ();
	}
}
