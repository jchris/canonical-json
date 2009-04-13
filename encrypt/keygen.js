
/* The following functions are (c) 2000 by John M Hanna and are
 * released under the terms of the Gnu Public License.
 * You must freely redistribute them with their source -- see the
 * GPL for details.
 *  -- Latest version found at http://sourceforge.net/projects/shop-js
 */

var rSeed=[], Rs=[];
var Sr, Rsl, Rbits, Rbits2;
var Rx=0, Ry=0;

// javascript's random 0 .. n
function r(n)
{
 return Math.floor(Math.random()*n);
}

function ror(a,n)
{
 n&=7;
 return n?((a>>n)|((a<<(8-n))&255)):a;
}

// seed the random number generator with entropy in s
function seed(s)
{
 var n=0,nn=0;
 var x, y, t;

 while(n < s.length)
 {
  while(n<s.length && s.charCodeAt(n)<=32) n++;
  if(n < s.length) rSeed[nn]=parseInt("0x"+s.substr(n,2));
  n+=3; nn++;
 }

 Rsl=rSeed.length;
 Sr=r(256);
 Rbits=0;

 if(Rs.lengh==0)
 {
  for(x=0; x<256; x++) Rs[x]=x;
 }
 y=0;
 for(x=0; x<256; x++)
 {
  y=(rSeed[x] + s[x] + y) % 256;
  t=s[x]; s[x]=s[y]; s[y]=t;
 }
 Rx=Ry=0;
 alert("Random seed updated. Seed size is: "+Rsl);
}

// generate a random number 0 .. 255 uses entropy from seed
function rc()
{
 var t;
 // this first bit is basically RC4

 Rx=++Rx & 255;
 Ry=(Rs[Rx] + Ry) & 255;
 t=Rs[Rx]; Rs[Rx]=Rs[Ry]; Rs[Ry]=t;
 Sr^= Rs[(Rs[Rx] + Rs[Ry]) & 255];

 // xor with javascripts rand, just in case there's good entropy there
 Sr^= r(256);

 Sr^= ror(rSeed[r(Rsl)],r(8));
 Sr^= ror(rSeed[r(Rsl)],r(8));
 return Sr;
}

// random number between 0 .. n -- based on repeated calls to rc
function rand(n)
{
 if(n==2)
 {
  if(!Rbits)
  {
   Rbits=8;
   Rbits2=rc(256);
  }
  Rbits--;
  var r=Rbits2 & 1;
  Rbits2>>=1;
  return r;
 }

 var m=1;

 r=0;
 while (n>m && m > 0)
 {
  m<<=8; r=(r<<8) |rc();
 }
 if(r<0) r ^= 0x80000000;
 return r % n;
}

// ------------------------------------------------------------
// functions for generating keys
// ------------------------------------------------------------

function beq(a,b) // returns 1 if a == b
{
 if(a.length != b.length) return 0;

 for(var n=a.length-1; n>=0; n--)
 {
  if(a[n] != b[n]) return 0;
 }
 return 1;
}

function blshift(a,b) // binary left shift b bits
{
 var n, c=0;
 var r=new Array(a.length);

 for(n=0; n<a.length; n++)
 {
  c|= (a[n]<<b);
  r[n]= c & bm;
  c>>=bs;
 }
 if(c) r[n]=c;
 return r;
}

function brshift(a) // unsigned binary right shift 1 bit
{
 var c=0,n,cc;
 var r=new Array(a.length);

 for(n=a.length-1; n>=0; n--)
 {
  c<<=bs;
  cc=a[n];
  r[n]=(cc | c)>>1;
  c=cc & 1;
 }
 n=r.length;
 if(r[n-1]) return r;
 while(n > 1 && r[n-1]==0) n--;
 return r.slice(0,n);
}

function bgcd(uu,vv) // return greatest common divisor
{
 // algorythm from http://algo.inria.fr/banderier/Seminar/Vallee/index.html

 var d, t, v=vv.concat(), u=uu.concat();
 for(;;)
 {
  d=bsub(v,u);
  if(beq(d,[0])) return u;
  if(d.length)
  {
   while((d[0] & 1) ==0) d=brshift(d); // v=(v-u)/2^val2(v-u)
   v=d;
  }
  else
  {
   t=v; v=u; u=t; // swap u and v
  }
 }
}

function rnum(bits)
{
 var n,b=1,c=0;
 var a=[];
 if(bits==0) bits=1;
 for(n=bits; n>0; n--)
 {

  if(rand(2)) a[c]|=b;
  b<<=1;
  if(b==bx2)
  {
   b=1;
   c++;
  }
 }
 return a;
}

var Primes=[3, 5, 7, 11, 13, 17, 19,
	23, 29, 31, 37, 41, 43, 47, 53,
	59, 61, 67, 71, 73, 79, 83, 89,
	97, 101, 103, 107, 109, 113, 127, 131,
	137, 139, 149, 151, 157, 163, 167, 173,
	179, 181, 191, 193, 197, 199, 211, 223,
	227, 229, 233, 239, 241, 251, 257, 263,
	269, 271, 277, 281, 283, 293, 307, 311,
	313, 317, 331, 337, 347, 349, 353, 359,
	367, 373, 379, 383, 389, 397, 401, 409,
	419, 421, 431, 433, 439, 443, 449, 457,
	461, 463, 467, 479, 487, 491, 499, 503,
	509, 521, 523, 541, 547, 557, 563, 569,
	571, 577, 587, 593, 599, 601, 607, 613,
	617, 619, 631, 641, 643, 647, 653, 659,
	661, 673, 677, 683, 691, 701, 709, 719,
	727, 733, 739, 743, 751, 757, 761, 769,
	773, 787, 797, 809, 811, 821, 823, 827,
	829, 839, 853, 857, 859, 863, 877, 881,
	883, 887, 907, 911, 919, 929, 937, 941,
	947, 953, 967, 971, 977, 983, 991, 997,
	1009, 1013, 1019, 1021];


var sieveSize=4000;
var sieve0=-1* sieveSize;
var sieve=[];
var lastPrime=0;

function nextPrime(p) // returns the next prime > p
{
 var n;
 if(p == Primes[lastPrime] && lastPrime <Primes.length-1)
 {
  return Primes[++lastPrime];
 }
 if(p<Primes[Primes.length-1])
 {
  for(n=Primes.length-2; n>0; n--)
  {
   if(Primes[n] <= p)
   {
    lastPrime=n+1;
    return Primes[n+1];
   }
  }
 }
 // use sieve and find the next one
 var pp,m;
 // start with p
 p++; if((p & 1)==0) p++;
 for(;;)
 {
  // new sieve if p is outside of this sieve's range
  if(p-sieve0 > sieveSize || p < sieve0)
  {
   // start new sieve
   for(n=sieveSize-1; n>=0; n--) sieve[n]=0;
   sieve0=p;
   primes=Primes.concat();
  } 

  // next p if sieve hit
  if(sieve[p-sieve0]==0)
  {
   // sieve miss
   // update sieve if p divisable

   // find a prime divisor
   for(n=0; n<primes.length; n++)
   {
    if((pp=primes[n]) && p % pp ==0)
    {
     for(m=p-sieve0; m<sieveSize; m+=pp) sieve[m]=pp;
     p+=2;
     primes[n]=0;
     break;
    }
   }
   if(n >= primes.length)
   {
    // possible prime
    return p;
   }
  }
  else
  {
   p+=2;
  }
 }
}

function divisable(n,max) // return a factor if n is divisable by a prime less than max, else return 0
{
 if((n[0] & 1) == 0) return 2;
 for(c=0; c<Primes.length; c++)
 {
  if(Primes[c] >= max) return 0;
  if(simplemod(n,Primes[c])==0) return Primes[c];
 }
 c=Primes[Primes.length-1];
 for(;;)
 {
  c=nextPrime(c);
  if(c >= max) return 0;
  if(simplemod(n,c)==0) return c;
 }
}

function bPowOf2(pow) // return a bigint
{
 var r=[], n, m=Math.floor(pow/bs);
 for(n=m-1; n>=0; n--) r[n]=0;
 r[m]=1<<(pow % bs);
 return r;
}

function mpp(bits) // returns a Maurer Provable Prime, see HAC chap 4 (c) CRC press
{
 if(bits < 10) return [Primes[rand(Primes.length)]];
 if(bits <=20) return [nextPrime(rand(1<<bits))];

 var c=10, m=20, B=bits*bits/c, r, q, I, R, n, a, b, d, R2, nMinus1;

 if(bits > m*2)
 {
  for(;;)
  {
   r=Math.pow(2,Math.random()-1);
   if(bits - r * bits > m) break;
  }
 }
 else
 {
  r=0.5
 }

 q=mpp(Math.floor(r*bits)+1);
 I=bPowOf2(bits-2);
 I=bdiv(I,q).q;
 Il=I.length;
 for(;;)
 {
  // generate R => I < R < 2I
  R=[];
  for(n=0; n<Il; n++) R[n]=rand(bx2);
  R[Il-1] %= I[Il-1];
  R=bmod(R,I);
  if(!R[0]) R[0]|=1; // must be greater or equal to 1
  R=badd(R,I);
  n=blshift(bmul(R,q),1); // 2Rq+1
  n[0]|=1;
  if(!divisable(n,B))
  {
   a=rnum(bits-1);
   a[0]|=2; // must be greater than 2
   nMinus1=bsub(n,[1]);
   var x=bmodexp(a,nMinus1,n);
   if(beq(x,[1]))
   {
    R2=blshift(R,1);
    b=bsub(bmodexp(a,R2,n),[1]);
    d=bgcd(b,n);
    if(beq(d,[1])) return n;
   }
  }
 }
}

// -------------------------------------------------

function sub2(a,b)
{
 var r=bsub(a,b);
 if(r.length==0)
 {
  this.a=bsub(b,a);
  this.sign=1;
 }
 else
 {
  this.a=r;
  this.sign=0;
 }
 return this;
}

function signedsub(a,b)
{
 if(a.sign)
 {
  if(b.sign) return sub2(b,a);
  else
  {
   this.a=badd(a,b);
   this.sign=1;
  }
 }
 else
 {
  if(b.sign)
  {
   this.a=badd(a,b);
   this.sign=0;
  }
  else return sub2(a,b);
 }
 return this;
}

// from  Bryan Olson <bryanolson@my-deja.com> 

function modinverse(x,n) // returns x^-1 mod n
{
 var y=n.concat(), t, r, bq, a=[1], b=[0], ts;

 a.sign=0; b.sign=0;

 while(y.length > 1 || y[0])
 {
  t=y.concat();
  r=bdiv(x,y);
  y=r.mod;
  q=r.q;
  x=t;
  t=b.concat(); ts=b.sign;
  bq=bmul(b,q);
  bq.sign=b.sign;
  r=signedsub(a,bq);
  b=r.a; b.sign=r.sign;
  a=t; a.sign=ts;
 }

 if(x.length != 1 || x[0] != 1) return [0]; // No inverse; GCD is x

 if(a.sign)
 {
  a=bsub(n,a);
 }
 return a;
}

// -------------------------------------------------
// function to generate keys

var rsa_p,rsa_q,rsa_e,rsa_d,rsa_pq, rsa_u;

function rsaKeys(bits)
{
 var c, p1q1;

 bits=parseInt(bits);
 rsa_q=mpp(bits);
 rsa_p=mpp(bits);
 p1q1=bmul(bsub(rsa_p,[1]),bsub(rsa_q,[1]));

 for(c=5; c<Primes.length; c++)
 {
  rsa_e=[Primes[c]];
  rsa_d=modinverse(rsa_e,p1q1);
  if(rsa_d.length != 1 || rsa_d[0]!=0) break;
 }
 rsa_pq=bmul(rsa_p,rsa_q);
 rsa_u=modinverse(rsa_p,rsa_q);

 return;
}

