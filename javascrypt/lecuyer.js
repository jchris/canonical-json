/*

    L'Ecuyer's two-sequence generator with a Bays-Durham shuffle
    on the back-end.  Schrage's algorithm is used to perform
    64-bit modular arithmetic within the 32-bit constraints of
    JavaScript.

    Bays, C. and S. D. Durham.  ACM Trans. Math. Software: 2 (1976)
        59-64.

    L'Ecuyer, P.  Communications of the ACM: 31 (1968) 742-774.

    Schrage, L.  ACM Trans. Math. Software: 5 (1979) 132-138.

*/

function uGen(old, a, q, r, m) {      // Schrage's modular multiplication algorithm
    var t;

    t = Math.floor(old / q);
    t = a * (old - (t * q)) - (t * r);
    return Math.round((t < 0) ? (t + m) : t);
}

function LEnext() {                   // Return next raw value
    var i;

    this.gen1 = uGen(this.gen1, 40014, 53668, 12211, 2147483563);
    this.gen2 = uGen(this.gen2, 40692, 52774, 3791, 2147483399);

    /* Extract shuffle table index from most significant part
       of the previous result. */

    i = Math.floor(this.state / 67108862);

    // New state is sum of generators modulo one of their moduli

    this.state = Math.round((this.shuffle[i] + this.gen2) % 2147483563);

    // Replace value in shuffle table with generator 1 result

    this.shuffle[i] = this.gen1;

    return this.state;
}

//  Return next random integer between 0 and n inclusive

function LEnint(n) {
    var p = 1;

    //  Determine smallest p,  2^p > n

    while (n >= p) {
	p <<= 1;
    }
    p--;

    /*  Generate values from 0 through n by first masking
	values v from 0 to (2^p)-1, then discarding any results v > n.
	For the rationale behind this (and why taking
	values mod (n + 1) is biased toward smaller values, see
	Ferguson and Schneier, "Practical Cryptography",
	ISBN 0-471-22357-3, section 10.8).  */

    while (true) {
    	var v = this.next() & p;

	if (v <= n) {
	    return v;
	}
    }
}

//  Constructor.  Called with seed value

function LEcuyer(s) {
    var i;

    this.shuffle = new Array(32);
    this.gen1 = this.gen2 = (s & 0x7FFFFFFF);
    for (i = 0; i < 19; i++) {
        this.gen1 = uGen(this.gen1, 40014, 53668, 12211, 2147483563);
    }

    // Fill the shuffle table with values

    for (i = 0; i < 32; i++) {
        this.gen1 = uGen(this.gen1, 40014, 53668, 12211, 2147483563);
        this.shuffle[31 - i] = this.gen1;
    }
    this.state = this.shuffle[0];
    this.next = LEnext;
    this.nextInt = LEnint;
}
