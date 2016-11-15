using UnityEngine;
using System.Collections;

public class BoardColliderGen : MonoBehaviour {

	public GameObject _go;
	public GameObject startPon;
	public GameManager _gm;


	void Start () {
		generate();
	}
	
	public void generate()
	{
	for (int y = 0; y < 19; y++)
        {
            for (int x = 0; x < 19; x++)
            {
                GameObject go = (GameObject)Instantiate(_go, new Vector3(startPon.transform.position.x + (x * 0.0287f), -1.44f, startPon.transform.position.z + (y * 0.0306f)), new Quaternion(0, 0, 0, 0));
				go.GetComponent<Intersection>().boardPos.x = x;
				go.GetComponent<Intersection>().boardPos.y = y;
				_gm.board.Add(go.GetComponent<Intersection>());
			}
        }
	}
}
