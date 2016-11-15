using UnityEngine;
using System.Collections;
using UnityEngine.UI;

public class ResourcesManager : MonoBehaviour {

	public Camera _camera;
	public Canvas _mainCanvas,  _optionsCanvas,  _gameCanvas;
	public Slider _musicSlider;
	public AudioSource _mainMusic, _audioSounds;
	public Scrollbar _scrollBar;
	public AudioClip _yoooClip, _explosionSound;
	public GameObject _doors,  _pons, gameManager;
	public Text player1PonsEatenText, player2PonsEatenText, _logsText, _scrollBarText;
}
