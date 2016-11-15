using UnityEngine;
using System.Collections;

public class Intersection : MonoBehaviour
{
	public Vector2 boardPos;
	public GameObject pon;

	public Intersection(int x, int y)
	{
		boardPos = new Vector2();
		pon = null;
	}
}
