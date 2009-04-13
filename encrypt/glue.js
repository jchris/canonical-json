// from http://www.hanewin.net/encrypt/rsa/rsa-test.htm
// for generating keys and encrypting

var keybits = [128,256,384,512];

function genkey()
{
 var ix = document.t.keylen.selectedIndex;

 var bits=keybits[ix];

 var startTime=new Date();

 rsaKeys(bits);
 document.t.p.value=rsa_p;
 document.t.q.value=rsa_q;
 document.t.d.value=rsa_d;
 document.t.e.value=rsa_e;
 document.t.u.value=rsa_u;
 document.t.pq.value=rsa_pq;

 var mpi=s2r(b2mpi(rsa_pq)+b2mpi(rsa_e));
 mpi=mpi.replace(/\n/,'');
 document.t.pkey.value=mpi;
 
 var endTime=new Date();
 document.t.howLong.value=(endTime.getTime()-startTime.getTime())/1000.0;
}

function RSAdoEncryption()
{
 var mod=new Array();
 var exp=new Array();
 
 var s = r2s(document.t.pkey.value);
 var l = Math.floor((s.charCodeAt(0)*256 + s.charCodeAt(1)+7)/8);

 mod = mpi2b(s.substr(0,l+2));
 exp = mpi2b(s.substr(l+2));

 var p = hex2s(document.rsatest.plaintext.value)+String.fromCharCode(1);
 var pl = p.length;

 if(pl > l-3)
 {
    alert('Plain text length must be less than modulus of '+(l-3)+' bytes');
    return;
 }

 var b=s2b(p);

 var startTime=new Date();

 // rsa encrypt the result and convert into mpi
 enc = RSAencrypt(b,exp,mod);

 document.rsatest.ciphertext.value=s2hex(b2s(enc));

 var endTime=new Date();
 document.rsatest.howLong.value=(endTime.getTime()-startTime.getTime())/1000.0;
}

function RSAdoDecryption()
{
  var p = rsa_p;
  var q = rsa_q;
  var d = rsa_d;
  var u = rsa_u;

  var startTime=new Date();

  var enc=s2b(hex2s(document.rsatest.ciphertext.value));
  var dec=b2s(RSAdecrypt(enc, d, p, q, u));

  document.rsatest.plaintext.value=s2hex(dec.substr(0, dec.length-1));

  var endTime=new Date();
  document.rsatest.howLong.value=(endTime.getTime()-startTime.getTime())/1000.0;
}
