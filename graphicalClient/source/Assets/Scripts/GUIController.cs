using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using System.Diagnostics;

public class GUIController : MonoBehaviour {

	private ResourcesManager _rm;
	public GameObject player1, player2;
	public Text ipText;
	public Text placeHolder;

	// Use this for initialization
	void Start () {
		ipText.text = PlayerPrefs.GetString ("ip");
		placeHolder.text = ipText.text;
			_rm = GameObject.Find("ResourcesManager").GetComponent<ResourcesManager>();
			_rm._mainCanvas.enabled = true;
			_rm._optionsCanvas.enabled = false;
			_rm._gameCanvas.enabled = false;
	    	_rm._restartCanvas.enabled = false;
			_rm.gameManager.SetActive(false);
		player1.SetActive (false);
		player2.SetActive (false);
	}
	
	// Update is called once per frame
	void Update () {
		if (_rm._optionsCanvas.enabled == true) {
			_rm._mainMusic.volume = _rm._musicSlider.value;
		}
	}

	public void switchCanvas(Canvas c1, Canvas c2)
	{
		if (c1.enabled == true) {
			c1.enabled = false;
			c2.enabled = true;
		} 
		else
		{
			c2.enabled = false;
			c1.enabled = true;
		}
	}

	public void menuToOption()
	{
		switchCanvas (_rm._mainCanvas, _rm._optionsCanvas);
	}

	public void StartPVP()
	{
		GameObject.Find("Gui").GetComponent<Animator> ().SetTrigger ("Start");
	}

	public void StartPVP1screen()
	{
		StartCoroutine (startGamePVP());
	}

	public void SartPVPOnline()
	{
		PlayerPrefs.SetString ("ip", ipText.text);
		PlayerPrefs.Save();
		StartCoroutine (startGamePVPOnline());
	}

	public void StartPVE()
	{
		StartCoroutine (startGamePVE ());
	}

	IEnumerator startGamePVPOnline()
	{
		_rm.guiClickSound ();
		yield return new WaitForSeconds (_rm.guiClickedSound.length);
		_rm._pons.SetActive(false);
		_rm._mainCanvas.enabled = false;
		_rm._camera.GetComponent<Animator> ().SetTrigger ("Stop");
		_rm._audioSounds.clip = _rm._yoooClip;
		_rm._audioSounds.Play ();
		yield return new WaitForSeconds (_rm._yoooClip.length);
		_rm._gameCanvas.enabled = true;
		_rm.gameManager.SetActive(true);
		yield return new WaitForSeconds (0.5f);
		player1.SetActive (true);
	}

	public void chooseDifficulty()
	{
		GameObject.Find("Gui").GetComponent<Animator> ().SetTrigger ("AI");
	}

	IEnumerator startGamePVE()
	{
		_rm.guiClickSound ();
		yield return new WaitForSeconds (_rm.guiClickedSound.length);
		_rm._pons.SetActive(false);
		_rm._mainCanvas.enabled = false;
		_rm._camera.GetComponent<Animator> ().SetTrigger ("Stop");
		_rm._audioSounds.clip = _rm._yoooClip;
		_rm._audioSounds.Play ();
		yield return new WaitForSeconds (_rm._yoooClip.length);
		_rm._gameCanvas.enabled = true;
		_rm.gameManager.SetActive(true);
		yield return new WaitForSeconds (0.5f);
		player1.SetActive (true);
	}

	IEnumerator startGamePVP()
	{
		_rm.guiClickSound ();
		yield return new WaitForSeconds (_rm.guiClickedSound.length);
		_rm._pons.SetActive(false);
		_rm._mainCanvas.enabled = false;
		_rm._camera.GetComponent<Animator> ().SetTrigger ("Stop");
		_rm._audioSounds.clip = _rm._yoooClip;
		_rm._audioSounds.Play ();
		yield return new WaitForSeconds (_rm._yoooClip.length);
		_rm._gameCanvas.enabled = true;
		_rm.gameManager.SetActive(true);
		player1.SetActive (true);
		player2.SetActive (true);
	}

	public void SetAiDifficulty(int lvl)
	{
		GameStartCameraFunc GC = GameObject.Find ("Camera").GetComponent<GameStartCameraFunc> ();
		GC.aiDifficulty = lvl;
		StartPVE ();
	}
}
