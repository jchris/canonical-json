// (C) 2000 John M Hanna under the terms of the GPL
// copy freely if you include source!

// script for shopping cart w/ encryption (soon to be)
// put onClick="itemAdd(description, quantity, price)" in your html
// and showItems() to show the cart

// You may need to customize buyItems() for your server

// change this if you're not using dollars
currency="$ "
// if you need descriptions longer than 60 chars change this:
dlen=60
// if your quantity or price need be longer than 6 chars, change this:
qlen=6
plen=6
// if this cookie name conflicts with another javascript cookie, change this
basket="myBasket"

// how do you calculate shipping costs
function shipping(total) {
 return total/10; // shipping for us is 10% of total
}

function buyItems() {
 window.location="mybuy.htm"
}
// change the showItems() function if you don't like how the
// shopping cart looks -- it's at the end of the script

// You shouldn't need to change anything else here until the body...
// have fun!

tlen=(dlen+qlen+plen)+1
cookie=''
function getCookie() {
 if(cookie) return cookie
 cookie=document.cookie.substr(document.cookie.indexOf(basket+"=")+1+basket.length)
 return cookie
}
function setCookie(c) {
 cookie=c
 document.cookie=basket+"="+c
}
function itemCount(c) { // return number of items in basket
 n=Math.floor(c.length/tlen);
 return Math.floor(c.length/tlen)
}
function chop(s,start,end) { return s.substr(0,start)+s.substr(end) }
function delItem(n) {
 setCookie(chop(getCookie(),n*tlen,(n+1)*tlen))
 refresh()
}
function fetch(s,n) { return s.substr(n*tlen,tlen) }
function itemDescription(n) { // n=item number
 return fetch(getCookie(),n).substr(0,dlen)
}
function itemQuantity(n) {
 return fetch(getCookie(),n).substr(dlen,qlen)
}
function itemPrice(n) {
 return fetch(getCookie(),n).substr(dlen+qlen,plen)
}
function pad(s,n) {
 var i=n-s.length
 while(i-- > 0) { s+=" " }
 return s.substr(0,n)
}
function itemqSet(n,q) { // just change quantity
 q=pad(q,qlen)
 cookie=getCookie()
 setCookie(cookie.substr(0,n*tlen+dlen)+q+cookie.substr((n+1)*tlen-plen-1))
}
function itemSet(n,d,q,p) { // description, quantity, price
 var s=pad(d,dlen)+pad(q,qlen)+pad(p,plen)
 cookie=getCookie()
 setCookie(cookie.substr(0,n*tlen)+s+"_"+cookie.substr((n+1)*tlen))
}
function itemAdd(d,q,p) {
 itemSet(itemCount(getCookie()),d,q,p);
 refresh()
}
function emptyCart() {
 setCookie('')
 refresh()
}
function refresh() {
 window.location.reload()
}
function money(v) {
 v=Math.round(parseFloat(v)*100)
 v=String(v)
 var l=v.length-2
 v=v.substring(0,l)+"."+v.substring(l)
 return currency+" "+v
}
function showItems() {
 var n, m=itemCount(getCookie())
 t=0
 if(m==0) {
  document.writeln('Your cart is empty<p>')
 } else {
  document.writeln('\
<center><font size="4" face="Arial" color=#013A2F><strong>\
Your Cart:</strong></font><font size="2" face="Arial"><strong></strong></font>\
<table border="1" cellpadding="2" cellspacing="0" bordercolor="#008080">\
    <tr>\
        <td align="center" bgcolor="#013A2F"><font\
        color="#FFFFFF" size="2" face="Arial"><u>Description</u></font></td>\
        <td align="center" bgcolor="#013A2F"><font\
        color="#FFFFFF" size="2" face="Arial"><u>Quantity</u></font></td>\
        <td align="center" bgcolor="#013A2F"><font\
        color="#FFFFFF" size="2" face="Arial"><u>Price</u></font></td>\
        <td align="center" bgcolor="#013A2F"><font\
        color="#FFFFFF" size="2" face="Arial"><u>Extended</u></font></td>\
        <td bgcolor="#013A2F"><p align="center"><font\
        color="#FFFFFF" size="2" face="Arial"><u>Action</u></font></p>\
        </td>\
    </tr>')
 for(n=0; n<m; n++) {
  var p=itemPrice(n), q=itemQuantity(n), v=parseFloat(p)*parseFloat(q)
  var d=itemDescription(n)
  t+=v
  document.writeln('\
    <tr>\
        <td align="center"><font face="Arial">'+d+'</font></td>\
        <td align="center"><font face="Arial"><input type="text"\
        size="2" value="'+q+'"\
        onchange="itemqSet('+n+',this.value)">\
        </font></td>\
        <td align="right"><font face="Arial">'+money(p)+'</font>\
        </td>\
        <td align="right"><font face="Arial"><em>'+money(v)+'\
        </em></font>\
        </td>\
        <td align="center"><font face="Arial"><input\
        type="button" value="Remove" onclick="delItem('+n+')"></font></td>\
    </tr>')
 }
 document.writeln('\
    <tr>\
        <td>&nbsp;</td>\
        <td>&nbsp;</td>\
        <td align="center"><font color="#008080" size="2"\
        face="Arial"><strong><u>S &amp; H</u></strong></font></td>\
        <td align="right"><font face="Arial"><em>\
        '+money(shipping(t))+'</em></font></td>\
        <td>&nbsp;</td>\
    </tr>\
    <tr>\
        <td>&nbsp;</td>\
        <td>&nbsp;</td>\
        <td align="center"><font color="#008080" size="2"\
        face="Arial"><strong><u>Total</u></strong></font></td>\
        <td align="right"><font face="Arial"><strong>\
        '+money(t+shipping(t))+'</strong></font>\
        </td>\
        <td align="center"><font face="Arial"><input\
        type="button" value="Retotal" onclick="refresh()"></font></td>\
    </tr>\
    <tr>\
        <td>&nbsp;</td>\
        <td>&nbsp;</td>\
        <td>&nbsp;</td>\
        <td align="center"><font face="Arial"><input\
        type="button" value="Buy" onclick="buyItems()"></font></td>\
        <td align="center"><font face="Arial"><input\
        type="button" value="Empty Cart" onclick="emptyCart()"></font></td>\
    </tr>\
</table>\
</center>')
 }
}
function cartString() {
 var n, m=itemCount(getCookie())
 var r=''
 t=0
 if(m==0) {
  return('Empty shopping cart.')
 } else {
  for(n=0; n<m; n++) {
   var p=itemPrice(n), q=itemQuantity(n), v=parseFloat(p)*parseFloat(q)
   var d=itemDescription(n)
   t+=v
   r+=q + " @ " +money(p)+" ("+money(v)+") "+d+"\n"
  }
  r+="shipping: "+money(shipping(t))+"\n"
  r+="total: "+money(t+shipping(t))+'\n'
 }
 // trim extra spaces
 m=0; n=0
 var rr='', c
 while(n<r.length) {
  c=r.charAt(n++)
  if(c != ' ' || t != ' ') rr+=c
  t=c
 }
 return rr
}
function ccIsValid(st) {
 // Encoding only works on cards with less than 19 digits
 if (st.length > 19)
  return (false);

 var sum = 0, mul = 1, i; var digit
 for (i=st.length-1; i>=0; i--) {
  digit=st.charCodeAt(i)-48
  if(digit <= 9 && digit >=0) {
   digit *=mul;
   if(digit > 9) digit=digit % 10 +1
   sum += digit
   mul ^=3
  }
 }

 return ((sum % 10) == 0)
}
