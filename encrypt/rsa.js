
/* RSA public key encryption/decryption
 * The following functions are (c) 2000 by John M Hanna and are
 * released under the terms of the Gnu Public License.
 * You must freely redistribute them with their source -- see the
 * GPL for details.
 *  -- Latest version found at http://sourceforge.net/projects/shop-js
 *
 * GnuPG multi precision integer (mpi) conversion added
 * 2004 by Herbert Hanewinkel, www.haneWIN.de
 */

// --- Arbitrary Precision Math ---
// badd(a,b), bsub(a,b), bmul(a,b)
// bdiv(a,b), bmod(a,b), bmodexp(xx,y,m)

// set the base... 32bit cpu -> bs=16, 64bit -> bs=32
// bs is the shift, bm is the mask

var bs=28;
var bx2=1<<bs, bm=bx2-1, bx=bx2>>1, bd=bs>>1, bdm=(1<<bd)-1;

var log2=Math.log(2);

function badd(a,b) // binary add
{
 var al=a.length, bl=b.length;

 if(al < bl) return badd(b,a);

 var r=new Array(al);
 var c=0, n=0;

 for(; n<bl; n++)
 {
  c+=a[n]+b[n];
  r[n]=c & bm;
  c>>>=bs;
 }
 for(; n<al; n++)
 {
  c+=a[n];
  r[n]=c & bm;
  c>>>=bs;
 }
 if(c) r[n]=c;
 return r;
}

function bsub(a,b) // binary subtract
{
 var al=a.length, bl=b.length;

 if(bl > al) return [];
 if(bl == al)
 {
  if(b[bl-1] > a[bl-1]) return [];
  if(bl==1) return [a[0]-b[0]];
 }

 var r=new Array(al);
 var c=0;

 for(var n=0; n<bl; n++)
 {
  c+=a[n]-b[n];
  r[n]=c & bm;
  c>>=bs;
 }
 for(;n<al; n++)
 {
  c+=a[n];
  r[n]=c & bm;
  c>>=bs;
 }
 if(c) return [];

 if(r[n-1]) return r;
 while(n>1 && r[n-1]==0) n--;
 return r.slice(0,n);
}

function zeros(n)
{
 var r=new Array(n);

 while(n-->0) r[n]=0;
 return r;
}

function bmul(a,b) // binary multiply
{
 b=b.concat([0]);
 var al=a.length, bl=b.length;
 var n,nn,aa,c,m, g,gg,h,hh,ghh,ghhb;

 var r=zeros(al+bl+1);

 for(n=0; n<al; n++)
 {
  aa=a[n];
  if(aa)
  {
   c=0;
   hh=aa>>bd; h=aa & bdm;
   m=n;
   for(nn=0; nn<bl; nn++, m++)
   {
    g = b[nn]; gg=g>>bd; g=g & bdm;
    // (gg*2^15 + g) * (hh*2^15 + h) = (gghh*2^30 + (ghh+hgg)*2^15 +hg)
    ghh = g * hh + h * gg;
    ghhb= ghh >> bd; ghh &= bdm;
    c += r[m] + h * g + (ghh << bd);
    r[m] = c & bm;
    c = (c >> bs) + gg * hh + ghhb;
   }
  }
 }
 n=r.length;

 if(r[n-1]) return r;
 while(n>1 && r[n-1]==0) n--;
 return r.slice(0,n);
}

function toppart(x,start,len)
{
 var n=0;
 while(start >= 0 && len-->0) n=n*bx2+x[start--];
 return n;
}

// ----------------------------------------------------
// 14.20 Algorithm Multiple-precision division from HAC

function bdiv(x,y)
{
 var n=x.length-1, t=y.length-1, nmt=n-t;

 // trivial cases; x < y
 if(n < t || n==t && (x[n]<y[n] || n>0 && x[n]==y[n] && x[n-1]<y[n-1]))
 {
  this.q=[0]; this.mod=x;
  return this;
 }

 // trivial cases; q < 4
 if(n==t && toppart(x,t,2)/toppart(y,t,2) <4)
 {
  var qq=0, xx;
  for(;;)
  {
   xx=bsub(x,y);
   if(xx.length==0) break;
   x=xx; qq++;
  }
  this.q=[qq]; this.mod=x;
  return this;
 }

 var shift, shift2
 // normalize
 shift2=Math.floor(Math.log(y[t])/log2)+1;
 shift=bs-shift2;
 if(shift)
 {
  x=x.concat(); y=y.concat()
  for(i=t; i>0; i--) y[i]=((y[i]<<shift) & bm) | (y[i-1] >> shift2);
  y[0]=(y[0]<<shift) & bm;
  if(x[n] & ((bm <<shift2) & bm))
  {
   x[++n]=0; nmt++;
  }
  for(i=n; i>0; i--) x[i]=((x[i]<<shift) & bm) | (x[i-1] >> shift2);
  x[0]=(x[0]<<shift) & bm;
 }

 var i, j, x2;
 var q=zeros(nmt+1);
 var y2=zeros(nmt).concat(y);
 for(;;)
 {
  x2=bsub(x,y2);
  if(x2.length==0) break;
  q[nmt]++;
  x=x2;
 }

 var yt=y[t], top=toppart(y,t,2)
 for(i=n; i>t; i--)
 {
  var m=i-t-1;
  if(i >= x.length) q[m]=1;
  else if(x[i] == yt) q[m]=bm;
  else q[m]=Math.floor(toppart(x,i,2)/yt);

  var topx=toppart(x,i,3);
  while(q[m] * top > topx) q[m]--;

  //x-=q[m]*y*b^m
  y2=y2.slice(1);
  x2=bsub(x,bmul([q[m]],y2));
  if(x2.length==0)
  {
   q[m]--;
   x2=bsub(x,bmul([q[m]],y2));
  }
  x=x2;
 }
 // de-normalize
 if(shift)
 {
  for(i=0; i<x.length-1; i++) x[i]=(x[i]>>shift) | ((x[i+1] << shift2) & bm);
  x[x.length-1]>>=shift;
 }
 n = q.length;
 while(n > 1 && q[n-1]==0) n--;
 this.q=q.slice(0,n);
 n = x.length;
 while(n > 1 && x[n-1]==0) n--;
 this.mod=x.slice(0,n);
 return this;
}

function simplemod(i,m) // returns the mod where m < 2^bd
{
 var c=0, v;
 for(var n=i.length-1; n>=0; n--)
 {
  v=i[n];
  c=((v >> bd) + (c<<bd)) % m;
  c=((v & bdm) + (c<<bd)) % m;
 }
 return c;
}

function bmod(p,m) // binary modulo
{
 if(m.length==1)
 {
  if(p.length==1) return [p[0] % m[0]];
  if(m[0] < bdm) return [simplemod(p,m[0])];
 }

 var r=bdiv(p,m);
 return r.mod;
}

// ------------------------------------------------------
// Barrett's modular reduction from HAC, 14.42, CRC Press

function bmod2(x,m,mu)
{
 var xl=x.length - (m.length << 1);
 if(xl > 0) return bmod2(x.slice(0,xl).concat(bmod2(x.slice(xl),m,mu)),m,mu);

 var ml1=m.length+1, ml2=m.length-1,rr;
 //var q1=x.slice(ml2)
 //var q2=bmul(q1,mu)
 var q3=bmul(x.slice(ml2),mu).slice(ml1);
 var r1=x.slice(0,ml1);
 var r2=bmul(q3,m).slice(0,ml1);
 var r=bsub(r1,r2);
 //var s=('x='+x+'\nm='+m+'\nmu='+mu+'\nq1='+q1+'\nq2='+q2+'\nq3='+q3+'\nr1='+r1+'\nr2='+r2+'\nr='+r); 
 if(r.length==0)
 {
  r1[ml1]=1;
  r=bsub(r1,r2);
 }
 for(var n=0;;n++)
 {
  rr=bsub(r,m);
  if(rr.length==0) break;
  r=rr;
  if(n>=3) return bmod2(r,m,mu);
 }
 return r;
}

function bmodexp(xx,y,m) // binary modular exponentiation
{
 var r=[1], an,a, x=xx.concat();
 var n=m.length*2;
 var mu=new Array(n+1);

 mu[n--]=1;
 for(; n>=0; n--) mu[n]=0; mu=bdiv(mu,m).q;

 for(n=0; n<y.length; n++)
 {
  for(a=1, an=0; an<bs; an++, a<<=1)
  {
   if(y[n] & a) r=bmod2(bmul(r,x),m,mu);
   x=bmod2(bmul(x,x),m,mu);
  }
 }
 return r;
}

// -----------------------------------------------------
// Compute s**e mod m for RSA public key operation

function RSAencrypt(s, e, m) { return bmodexp(s,e,m); }

// Compute m**d mod p*q for RSA private key operations.

function RSAdecrypt(m, d, p, q, u)
{
 var xp = bmodexp(bmod(m,p), bmod(d,bsub(p,[1])), p);
 var xq = bmodexp(bmod(m,q), bmod(d,bsub(q,[1])), q);

 var t=bsub(xq,xp);
 if(t.length==0)
 {
  t=bsub(xp,xq);
  t=bmod(bmul(t, u), q);
  t=bsub(q,t);
 }
 else
 {
  t=bmod(bmul(t, u), q);
 } 
 return badd(bmul(t,p), xp);
}

// -----------------------------------------------------------------
// conversion functions: num array <-> multi precision integer (mpi)
// mpi: 2 octets with length in bits + octets in big endian order

function mpi2b(s)
{
 var bn=1, r=[0], rn=0, sb=256;
 var c, sn=s.length;
 if(sn < 2)
 {
    alert('string too short, not a MPI');
    return 0;
 }

 var len=(sn-2)*8;
 var bits=s.charCodeAt(0)*256+s.charCodeAt(1);
 if(bits > len || bits < len-8) 
 {
    alert('not a MPI, bits='+bits+",len="+len);
    return 0;
 }

 for(var n=0; n<len; n++)
 {
  if((sb<<=1) > 255)
  {
   sb=1; c=s.charCodeAt(--sn);
  }
  if(bn > bm)
  {
   bn=1;
   r[++rn]=0;
  }
  if(c & sb) r[rn]|=bn;
  bn<<=1;
 }
 return r;
}

function b2mpi(b)
{
 var bn=1, bc=0, r=[0], rb=1, rn=0;
 var bits=b.length*bs;
 var n, rr='';

 for(n=0; n<bits; n++)
 {
  if(b[bc] & bn) r[rn]|=rb;
  if((rb<<=1) > 255)
  {
   rb=1; r[++rn]=0;
  }
  if((bn<<=1) > bm)
  {
   bn=1; bc++;
  }
 }

 while(rn && r[rn]==0) rn--;

 bn=256;
 for(bits=8; bits>0; bits--) if(r[rn] & (bn>>=1)) break;
 bits+=rn*8;

 rr+=String.fromCharCode(bits/256)+String.fromCharCode(bits%256);
 if(bits) for(n=rn; n>=0; n--) rr+=String.fromCharCode(r[n]);
 return rr;
}

