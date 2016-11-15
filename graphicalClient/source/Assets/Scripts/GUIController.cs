using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class GUIController : MonoBehaviour {

	private ResourcesManager _rm;

	// Use this for initialization
	void Start () {
			_rm = GameObject.Find("ResourcesManager").GetComponent<ResourcesManager>();
			_rm._mainCanvas.enabled = true;
			_rm._optionsCanvas.enabled = false;
			_rm._gameCanvas.enabled = false;
			_rm.gameManager.SetActive(false);
	}
	
	// Update is called once per frame
	void Update () {
		if (_rm._optionsCanvas.enabled == true) {
			_rm._mainMusic.volume = _rm._musicSlider.value;
			if (_rm._scrollBar.value <= 0.33f)
			{
				_rm._scrollBarText.text = "easy";
				_rm._scrollBarText.color = Color.green;
			}
			else if (_rm._scrollBar.value > 0.33f && _rm._scrollBar.value < 0.66f)
			{
				_rm._scrollBarText.text = "medium";
				_rm._scrollBarText.color = Color.yellow;
			}
			else if (_rm._scrollBar.value >= 0.66f)
			{
				_rm._scrollBarText.text = "hard";
				_rm._scrollBarText.color = Color.red;
			}
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
		StartCoroutine (startGame());
	}

	IEnumerator startGame()
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
	}
}
