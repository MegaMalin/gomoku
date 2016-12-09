using UnityEngine;
using System.Collections;

public class GameStartCameraFunc : MonoBehaviour {

	public ResourcesManager _rm;
	public GameObject volcano1, volcano2, meteorStorm;

	void Start()
	{
		_rm = GameObject.Find ("ResourcesManager").GetComponent<ResourcesManager> ();
	}

	public void DoorsOpen()
	{
		GameObject.Find("ResourcesManager").GetComponent<ResourcesManager>()._doors.GetComponent<Animator>().SetTrigger("Open");
	}

	public void activateVolcano1()
	{
		volcano1.SetActive (true);
	}

	public void activateVolcano2()
	{
		volcano2.SetActive (true);
		meteorStorm.SetActive (true);
	}

	public void desactivateVolcano1()
	{
		volcano1.SetActive (false);
	}

	public void desactivateVolcano2()
	{
		volcano2.SetActive (false);
		meteorStorm.SetActive (false);
	}

	public void playExplosion()
	{
		_rm._audioSounds.clip = null;
		_rm._audioSounds.clip = _rm._explosionSound;
		_rm._audioSounds.Play ();
	}

	public void endAnim()
	{
		GameObject.Find ("WindZone").GetComponent<WindZone> ().windTurbulence = 8;
		_rm._mainMusic.Stop ();
	}

	public void activateRestartCanvas()
	{
		_rm._restartCanvas.enabled = true;
	}

	public void desactivateRestartCanvas()
	{
		_rm._restartCanvas.enabled = false;
	}

	public void activateGameCanvas()
	{
		_rm._gameCanvas.enabled = true;
	}

	public void desactivateGameCanvas()
	{
		_rm._gameCanvas.enabled = false;
	}
}
