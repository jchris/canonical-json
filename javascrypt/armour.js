
//  Varieties of ASCII armour for binary data

    var maxLineLength = 64; 	    	// Maximum line length for armoured text
    
    /*	    	    	    Hexadecimal Armour
    
    	A message is encoded in Hexadecimal armour by expressing its
	bytes as a hexadecimal string which is prefixed by a sentinel
	of "?HX?" and suffixed by "?H", then broken into lines no
	longer than maxLineLength.  Armoured messages use lower case
	letters for digits with decimal values of 0 through 15, but
	either upper or lower case letters are accepted when decoding
	a message.  The hexadecimal to byte array interconversion
	routines in aes.js do most of the heavy lifting here.  */
    
    var hexSentinel = "?HX?", hexEndSentinel = "?H";
    
    //	Encode byte array in hexadecimal armour
    
    function armour_hex(b) {
    	var h = hexSentinel + byteArrayToHex(b) + hexEndSentinel;
	var t = "";
	while (h.length > maxLineLength) {
//dump("h.length", h.length);
	    t += h.substring(0, maxLineLength) + "\n";
	    h = h.substring(maxLineLength, h.length);
	}
//dump("h.final_length", h.length);
	t += h + "\n";
	return t;
    }
    
    /*	Decode string in hexadecimal armour to byte array.  If the
    	string supplied contains a start and/or end sentinel,
	only characters within the sentinels will be decoded.
	Non-hexadecimal digits are silently ignored, which
	automatically handles line breaks.  We might want to
	diagnose invalid characters as opposed to ignoring them.  */
    
    function disarm_hex(s) {
    	var hexDigits = "0123456789abcdefABCDEF";
	var hs = "", i;
	
	//  Extract hexadecimal data between sentinels, if present
	
	if ((i = s.indexOf(hexSentinel)) >= 0) {
	    s = s.substring(i + hexSentinel.length, s.length);
	}
	if ((i = s.indexOf(hexEndSentinel)) >= 0) {
	    s = s.substring(0, i);
	}
	
	//  Assemble string of valid hexadecimal digits
	
	for (i = 0; i < s.length; i++) {
	    var c = s.charAt(i);
	    if (hexDigits.indexOf(c) >= 0) {
	    	hs += c;
	    }
	}
//dump("hs", hs);
	return hexToByteArray(hs);
    }

    /*	    	    	    Codegroup Armour
    
    	Codegroup armour encodes a byte string into a sequence of five
	letter code groups like spies used in the good old days.  The
	first group of a message is always "ZZZZZ" and the last "YYYYY";
	the decoding process ignores any text outside these start and
	end sentinels.  Bytes are encoded as two letters in the range
	"A" to "X", each encoding four bits of the byte.  Encoding uses
	a pseudorandomly generated base letter and wraps around modulo
	24 to spread encoded letters evenly through the alphabet.  (This
	refinement is purely aesthetic; the base letter sequence is
	identical for all messages and adds no security.  If the message
	does not fill an even number of five letter groups, the last
	group is padded to five letters with "Z" characters, which are
	ignored when decoding.  */
    
    var acgcl, acgt, acgg;
    
    //	Output next codegroup, flushing current line if it's full
    
    function armour_cg_outgroup() {
    	if (acgcl.length > maxLineLength) {
	    acgt += acgcl + "\n";
	    acgcl = "";
    	}
	if (acgcl.length > 0) {
	    acgcl += " ";
	}
	acgcl += acgg;
	acgg = "";
    }
    
    /*	Add a letter to the current codegroup, emitting it when
    	it reaches five letters.  */
    
    function armour_cg_outletter(l) {
    	if (acgg.length >= 5) {
	    armour_cg_outgroup();
	}
	acgg += l;
    }
    
    var codegroupSentinel = "ZZZZZ";
    
    function armour_codegroup(b) {
    	var charBase = ("A").charCodeAt(0);
	
	acgcl = codegroupSentinel;
	acgt = "";
	acgg = "";
	
	var cgrng = new LEcuyer(0xbadf00d);
	for (i = 0; i < b.length; i++) {
	   var r = cgrng.nextInt(23);
	   armour_cg_outletter(String.fromCharCode(charBase + ((((b[i] >> 4) & 0xF)) + r) % 24));
	   r = cgrng.nextInt(23);
	   armour_cg_outletter(String.fromCharCode(charBase + ((((b[i] & 0xF)) + r) % 24)));
	}
	delete cgrng;
	
	//  Generate nulls to fill final codegroup if required
	
	while (acgg.length < 5) {
	    armour_cg_outletter("Z");
	}
	armour_cg_outgroup();
	
	//  Append terminator group
	
	acgg = "YYYYY";
	armour_cg_outgroup();
	
	//  Flush last line
	
	acgt += acgcl + "\n";
	
	return acgt;
    }
    
    var dcgs, dcgi;
    
    /*	Obtain next "significant" character from message.  Characters
    	other than letters are silently ignored; both lower and upper
	case letters are accepted.  */
    
    function disarm_cg_insig() {
    	while (dcgi < dcgs.length) {
	    var c = dcgs.charAt(dcgi++).toUpperCase();
	    if ((c >= "A") && (c <= "Z")) {
//dump("c", c);
	    	return c;
    	    }
    	}
	return "";
    }
    
    //	Decode a message in codegroup armour
    
    function disarm_codegroup(s) {
    	var b = new Array();
	var nz = 0, ba, bal = 0, c;
	
    	dcgs = s;
	dcgi = 0;
	
	//  Search for initial group of "ZZZZZ"
	
	while (nz < 5) {
	    c = disarm_cg_insig();
	    
	    if (c == "Z") {
	    	nz++;
	    } else if (c == "") {
	    	nz = 0;
	    	break;
	    } else {
	    	nz = 0;
	    }
    	}
	
	if (nz == 0) {
	    alert("No codegroup starting symbol found in message.");
	    return "";
	}
	
	/*  Decode letter pairs from successive groups
	    and assemble into bytes.  */
	
	var charBase = ("A").charCodeAt(0);    
	var cgrng = new LEcuyer(0xbadf00d);
	for (nz = 0; nz < 2; ) {
	    c = disarm_cg_insig();
//dump("c", c);
	    
	    if ((c == "Y") || (c == "")) {
	    	break;
	    } else if (c != "Z") {
	    	var r = cgrng.nextInt(23);
	    	var n = c.charCodeAt(0) - charBase;
		n = (n + (24 - r)) % 24;
//dump("n", n);
		if (nz == 0) {
		    ba = (n << 4);
		    nz++;
		} else {
		    ba |= n;
		    b[bal++] = ba;
		    nz = 0;
		}
	    }
	}
	delete cgrng;
	
	/*  Ponder how we escaped from the decoder loop and
	    issue any requisite warnings.  */
	
	var kbo = "  Attempting decoding with data received.";
	if (nz != 0) {
	    alert("Codegroup data truncated." + kbo);
	} else {
	    if (c == "Y") {
		nz = 1;
		while (nz < 5) {
		    c = disarm_cg_insig();
	    	    if (c != "Y") {
			break;
		    }
		    nz++;
		}
		if (nz != 5) {
		    alert("Codegroup end group incomplete." + kbo);
		}
	    } else {
		alert("Codegroup end group missing." + kbo);
	    }
	}
	
	return b;
    }
    
    /*	    	    	    Base64 Armour
    
    	Base64 armour encodes a byte array as described in RFC 1341.  Sequences
	of three bytes are encoded into groups of four characters from a set
	of 64 consisting of the upper and lower case letters, decimal digits,
	and the special characters "+" and "/".  If the input is not a multiple
	of three characters, the end of the message is padded with one or two
	"=" characters to indicate its actual length.  We prefix the armoured
	message with "?b64" and append "?64b" to the end; if one or both
	of these sentinels are present, text outside them is ignored.  You can
	suppress the generation of sentinels in armour by setting base64addsent
	false before calling armour_base64.  */
    
    
    var base64code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
    	base64sent = "?b64", base64esent = "?64b", base64addsent = true;
    
    function armour_base64(b) {
    	var b64t = "";
	var b64l = base64addsent ? base64sent : "";
	
	var i;
	for (i = 0; i <= b.length - 3; i += 3) {
	    if ((b64l.length + 4) > maxLineLength) {
	    	b64t += b64l + "\n";
	    	b64l = "";
    	    }
	    b64l += base64code.charAt(b[i] >> 2);
	    b64l += base64code.charAt(((b[i] & 3) << 4) | (b[i + 1] >> 4));
	    b64l += base64code.charAt(((b[i + 1] & 0xF) << 2) | (b[i + 2] >> 6));
	    b64l += base64code.charAt(b[i + 2] & 0x3F);
	}
	
//dump("b.length", b.length);  dump("i", i); dump("(b.length - i)", (b.length - i));
	if ((b.length - i) == 1) {
	    b64l += base64code.charAt(b[i] >> 2);
	    b64l += base64code.charAt(((b[i] & 3) << 4));
	    b64l += "==";
	} else if ((b.length - i) == 2) {
	    b64l += base64code.charAt(b[i] >> 2);
	    b64l += base64code.charAt(((b[i] & 3) << 4) | (b[i + 1] >> 4));
	    b64l += base64code.charAt(((b[i + 1] & 0xF) << 2));
	    b64l += "=";
	}

	if ((b64l.length + 4) > maxLineLength) {
	    b64t += b64l + "\n";
	    b64l = "";
    	}
	if (base64addsent) {
	    b64l += base64esent;
	}
	b64t += b64l + "\n";
	return b64t;
    }
    
    function disarm_base64(s) {
    	var b = new Array();
	var i = 0, j, c, shortgroup = 0, n = 0;
	var d = new Array();
	
	if ((j = s.indexOf(base64sent)) >= 0) {
	    s = s.substring(j + base64sent.length, s.length);
	}
	if ((j = s.indexOf(base64esent)) >= 0) {
	    s = s.substring(0, j);
	}
	
	/*  Ignore any non-base64 characters before the encoded
	    data stream and skip the type sentinel if present.  */
	
	while (i < s.length) {
	    if (base64code.indexOf(s.charAt(i)) != -1) {
	    	break;
	    }
	    i++;
	}
	
	/*  Decode the base64 data stream.  The decoder is
	    terminated by the end of the input string or
	    the occurrence of the explicit end sentinel.  */
	
	while (i < s.length) {
	    for (j = 0; j < 4; ) {
	    	if (i >= s.length) {
		    if (j > 0) {
		    	alert("Base64 cipher text truncated.");
		    	return b;
		    }
		    break;
		}
		c = base64code.indexOf(s.charAt(i));
		if (c >= 0) {
		    d[j++] = c;
		} else if (s.charAt(i) == "=") {
		    d[j++] = 0;
		    shortgroup++;
		} else if (s.substring(i, i + base64esent.length) == base64esent) {
//dump("s.substring(i, i + base64esent.length)", s.substring(i, i + base64esent.length));
//dump("esent", i);
		    i = s.length;
		    continue;
		} else {
//dump("s.substring(i, i + base64esent.length)", s.substring(i, i + base64esent.length));
//dump("usent", i);
		       // Might improve diagnosis of improper character in else clause here
		}
		i++;
	    }
//dump("d0", d[0]); dump("d1", d[1]); dump("d2", d[2]); dump("d3", d[3]); 
//dump("shortgroup", shortgroup);
//dump("n", n);
	    if (j == 4) {
	    	b[n++] = ((d[0] << 2) | (d[1] >> 4)) & 0xFF;
		if (shortgroup < 2) {
		    b[n++] = ((d[1] << 4) | (d[2] >> 2)) & 0xFF;
//dump("(d[1] << 4) | (d[2] >> 2)", (d[1] << 4) | (d[2] >> 2));
		    if (shortgroup < 1) {
		    	b[n++] = ((d[2] << 6) | d[3]) & 0xFF;
		    }
		}
	    }
    	}
	return b;
    }
