using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using System.Collections.Generic;

public class GameManager : MonoBehaviour {

	private Apis player1, player2;
	public ResourcesManager _rm;
	public int player1Score, player2Score;
	public GameObject whitePon, blackPon;
	public List<Intersection> board = new List<Intersection>();
	public int turnNbr = 1;
	private int maxTryConnect = 15;
	private int tryConnect = 0;

	void Start () {
		_rm = GameObject.Find("ResourcesManager").GetComponent<ResourcesManager>();
		player1Score = 0;
		player2Score = 0;
		player1 = GameObject.Find ("Player1Api").GetComponent<Apis> ();
		player2 = GameObject.Find ("Player2Api").GetComponent<Apis> ();
		player1.connect ();
		player2.connect ();
	}
	
	void Update () {
		if (Input.GetKeyDown (KeyCode.Space)) {
			gameOver ();
		}
		if (tryConnect >= maxTryConnect)
		{
			_rm._logsText.text = "Erreur : connexion échouer avec le serveur.";
			return;
		}
		if (!verifPlayable ()) {
			Debug.Log ("Debug Update check");
			return;
		}
		tryConnect = 0;

		_rm.player1PonsEatenText.text = "Pions mangés : " + player1.score;
		_rm.player2PonsEatenText.text = "Pions mangés : " + player2.score;

		if (Input.GetButtonDown("Fire1"))
			leftClick();
	/*	if (Input.GetButtonDown("Fire2"))
			rightClick();*/
		if (Input.GetKeyDown(KeyCode.R))
			restartGame();
	}
		
	public void leftClick()
	{
		player1.map ();
		player2.map ();
        RaycastHit hit;
        Ray ray = GameObject.Find("Camera").GetComponent<Camera>().ScreenPointToRay(Input.mousePosition);
        
        if (Physics.Raycast(ray, out hit)) {
            Transform objectHit = hit.transform;
			if (objectHit.tag == "PonPlace" && objectHit.GetComponent<Intersection>().pon == null && player1.playNumber == player1.turnPlayer)
			{
				StartCoroutine (ponPosedAnim(objectHit));
				player1.play ((int)objectHit.GetComponent<Intersection>().boardPos.x, (int)objectHit.GetComponent<Intersection>().boardPos.y, objectHit);
				//objectHit.GetComponent<Intersection>().pon = (GameObject)Instantiate(whitePon, objectHit.position, objectHit.rotation);
				//_rm._logsText.text = "Tour du joueur noir";
			}
			else if (objectHit.tag == "PonPlace" && objectHit.GetComponent<Intersection>().pon == null  && player2.playNumber == player2.turnPlayer)
			{
				StartCoroutine (ponPosedAnim(objectHit));
				player2.play ((int)objectHit.GetComponent<Intersection>().boardPos.x, (int)objectHit.GetComponent<Intersection>().boardPos.y, objectHit);
				//objectHit.gameObject.GetComponent<Intersection>().pon = (GameObject)Instantiate(blackPon, objectHit.position, objectHit.rotation);
				//_rm._logsText.text = "Tour du joueur blanc";
			}
        }
	}


	IEnumerator ponPosedAnim(Transform objectHit)
	{
		GameObject go =  (GameObject)Instantiate (_rm.SFXponPosed, objectHit.position, objectHit.rotation);
		Destroy (go, 0.3f);
		yield return new WaitForSeconds(0.1f);
	}
	/*
	public void rightClick()
	{
        RaycastHit hit;
        Ray ray = GameObject.Find("Camera").GetComponent<Camera>().ScreenPointToRay(Input.mousePosition);
        
        if (Physics.Raycast(ray, out hit)) {
            Transform objectHit = hit.transform;
         if (objectHit.GetComponent<Intersection>().pon != null)
		 	Destroy(objectHit.GetComponent<Intersection>().pon);
        }
	}*/

	public void restartGame()
	{
		GameObject[] pons;
		pons = GameObject.FindGameObjectsWithTag("Pon");
		  foreach (GameObject pon in pons) {
            Destroy(pon);
        }
		player1Score = 0;
		player2Score = 0;
		_rm._logsText.text = "Nouvelle partie !";
	}

	public void gameOver()
	{
		GameObject.Find ("Camera").GetComponent<Animator> ().SetTrigger ("End");
	}
			
	private bool verifPlayable()
	{
		Debug.Log ("tryConn = " + tryConnect);
		tryConnect++;
		if (player1.playable == false)
		{
			player1.connect ();
			player1.connected ();
			return false;
		}
		else if (player2.playable == false)
		{
			player2.connect ();
			player2.connected ();
			return false;
		}
		else if (player1.key == "" || player2.key == "")
			return false;
		return (true);
	}

	public void endTurn()
	{
		for (int i = 0; i < 15; i++)
		{
			player1.map ();
			player2.map ();
			player1.playerScore ();
			player2.playerScore ();
			player1.turn ();
			player2.turn ();
		}
	}
}

