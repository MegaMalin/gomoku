using UnityEngine;
using System.Collections;

public class PlayerController : MonoBehaviour {
	
	public NetworkApi network;
	[SerializeField] GameManager _gm;
	public string myNetworkKey;
	public int myBoardID;
		
	private float connectionTryRate = 0f;
	public bool connected = false;

	void Start () {
		network = GameObject.Find ("Network").GetComponent<NetworkApi>();
		_gm = GameObject.Find ("GameManager").GetComponent<GameManager>();
	}

	void Update () {
		if (!connected && connectionTryRate < Time.time) {
			connectionTryRate = Time.time + 1f;
			network.connect (this);
			return;
		}
		if (_gm.gameIsReady && _gm.playersTurn == myBoardID && Input.GetButtonDown("Fire1")) {
			playerPlay ();
		}
	}

	public void playerPlay()
	{
		RaycastHit hit;
		Ray ray = GameObject.Find("Camera").GetComponent<Camera>().ScreenPointToRay(Input.mousePosition);

		if (Physics.Raycast(ray, out hit))
		{
			Transform objectHit = hit.transform;
			network.play ((int)objectHit.GetComponent<Intersection> ().boardPos.x, (int)objectHit.GetComponent<Intersection> ().boardPos.y, myNetworkKey);
		}
	}
}
