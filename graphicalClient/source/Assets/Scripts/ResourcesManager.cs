using UnityEngine;
using System.Collections;
using UnityEngine.UI;
using UnityEngine.SceneManagement;

public class ResourcesManager : MonoBehaviour {

	public Camera _camera;
	public Canvas _mainCanvas,  _optionsCanvas,  _gameCanvas, _restartCanvas;
	public Slider _musicSlider;
	public AudioSource _mainMusic, _audioSounds;
	public Scrollbar _scrollBar;
	public AudioClip _yoooClip, _explosionSound, ponPosedSound, guiClickedSound, ponDestroyedSound;
	public GameObject _doors,  _pons, gameManager, SFXponPosed, SFXponDestroyed;
	public Text player1PonsEatenText, player2PonsEatenText, _logsText, _scrollBarText;

	public void playerPonPosedSound()
	{
		_audioSounds.clip = ponPosedSound;
		_audioSounds.Play ();
	}

	public void guiClickSound()
	{
		_audioSounds.clip = guiClickedSound;
		_audioSounds.Play ();
	}
}
