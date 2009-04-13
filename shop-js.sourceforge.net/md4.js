/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD4 Message
 * Digest Algorithm, as defined in RFC 1320.
 * Copyright (C) Jerrad Pierce 2000. Distributed under the LGPL.
 * Updated by Paul Johnston 2000 - 2002.
 */

/*
 * Convert a 32-bit number to a hex string with ls-byte first
 */
var hex_chr = "0123456789abcdef";
function rhex(num)
{
  var str = "";
  for(var j = 0; j <= 3; j++)
    str += hex_chr.charAt((num >> (j * 8 + 4)) & 0x0F) +
           hex_chr.charAt((num >> (j * 8)) & 0x0F);
  return str;
}

/*
 * Convert a string to a sequence of 16-word blocks, stored as an array.
 * Append padding bits and the length, as described in the MD5 standard.
 * MD5 here is not a typo - this function is borrowed from the MD5 code.
 */
function str2blks_MD5(str)
{
  var nblk = ((str.length + 8) >> 6) + 1;
  var blks = new Array(nblk * 16);
  for(var i = 0; i < nblk * 16; i++) blks[i] = 0;
  for(var i = 0; i < str.length; i++)
    blks[i >> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
  blks[i >> 2] |= 0x80 << ((i % 4) * 8);
  blks[nblk * 16 - 2] = str.length * 8;
  return blks;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

/*
 * These functions implement the basic operation for each round of the
 * algorithm.
 */
function cmn(q, a, b, x, s, t)
{
  return safe_add(rol(safe_add(safe_add(a, q), safe_add(x, t)), s), b);
}
function ffMD4(a, b, c, d, x, s)
{
  return cmn((b & c) | ((~b) & d), a, 0, x, s, 0);
}
function ggMD4(a, b, c, d, x, s)
{
  return cmn((b & c) | (b & d) | (c & d), a, 0, x, s, 1518500249);
}
function hhMD4(a, b, c, d, x, s)
{
  return cmn(b ^ c ^ d, a, 0, x, s, 1859775393);
}

/*
 * Take a string and return the hex representation of its MD4.
 */
function calcMD4(str)
{
  var x = str2blks_MD5(str);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = ffMD4(a, b, c, d, x[i+ 0], 3 );
    d = ffMD4(d, a, b, c, x[i+ 1], 7 );
    c = ffMD4(c, d, a, b, x[i+ 2], 11);
    b = ffMD4(b, c, d, a, x[i+ 3], 19);
    a = ffMD4(a, b, c, d, x[i+ 4], 3 );
    d = ffMD4(d, a, b, c, x[i+ 5], 7 );
    c = ffMD4(c, d, a, b, x[i+ 6], 11);
    b = ffMD4(b, c, d, a, x[i+ 7], 19);
    a = ffMD4(a, b, c, d, x[i+ 8], 3 );
    d = ffMD4(d, a, b, c, x[i+ 9], 7 );
    c = ffMD4(c, d, a, b, x[i+10], 11);
    b = ffMD4(b, c, d, a, x[i+11], 19);
    a = ffMD4(a, b, c, d, x[i+12], 3 );
    d = ffMD4(d, a, b, c, x[i+13], 7 );
    c = ffMD4(c, d, a, b, x[i+14], 11);
    b = ffMD4(b, c, d, a, x[i+15], 19);

    a = ggMD4(a, b, c, d, x[i+ 0], 3 );
    d = ggMD4(d, a, b, c, x[i+ 4], 5 );
    c = ggMD4(c, d, a, b, x[i+ 8], 9 );
    b = ggMD4(b, c, d, a, x[i+12], 13);
    a = ggMD4(a, b, c, d, x[i+ 1], 3 );
    d = ggMD4(d, a, b, c, x[i+ 5], 5 );
    c = ggMD4(c, d, a, b, x[i+ 9], 9 );
    b = ggMD4(b, c, d, a, x[i+13], 13);
    a = ggMD4(a, b, c, d, x[i+ 2], 3 );
    d = ggMD4(d, a, b, c, x[i+ 6], 5 );
    c = ggMD4(c, d, a, b, x[i+10], 9 );
    b = ggMD4(b, c, d, a, x[i+14], 13);
    a = ggMD4(a, b, c, d, x[i+ 3], 3 );
    d = ggMD4(d, a, b, c, x[i+ 7], 5 );
    c = ggMD4(c, d, a, b, x[i+11], 9 );
    b = ggMD4(b, c, d, a, x[i+15], 13);

    a = hhMD4(a, b, c, d, x[i+ 0], 3 );
    d = hhMD4(d, a, b, c, x[i+ 8], 9 );
    c = hhMD4(c, d, a, b, x[i+ 4], 11);
    b = hhMD4(b, c, d, a, x[i+12], 15);
    a = hhMD4(a, b, c, d, x[i+ 2], 3 );
    d = hhMD4(d, a, b, c, x[i+10], 9 );
    c = hhMD4(c, d, a, b, x[i+ 6], 11);
    b = hhMD4(b, c, d, a, x[i+14], 15);
    a = hhMD4(a, b, c, d, x[i+ 1], 3 );
    d = hhMD4(d, a, b, c, x[i+ 9], 9 );
    c = hhMD4(c, d, a, b, x[i+ 5], 11);
    b = hhMD4(b, c, d, a, x[i+13], 15);
    a = hhMD4(a, b, c, d, x[i+ 3], 3 );
    d = hhMD4(d, a, b, c, x[i+11], 9 );
    c = hhMD4(c, d, a, b, x[i+ 7], 11);
    b = hhMD4(b, c, d, a, x[i+15], 15);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);

  }
  return rhex(a) + rhex(b) + rhex(c) + rhex(d);
}
