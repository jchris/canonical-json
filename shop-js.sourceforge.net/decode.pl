# shop-js encrypted message decoder in Perl
# Copyright John Hanna (c) 2004 under the terms of the GPL
# see http://shop-js.sf.net for details and latest version
# modified 10/13/2004

# Of course to run this you'll need perl from perl.org or elsewhere

# this is expecting private key parts as generated by the shop-js RSA key generator
# you'll obviously want to replace these values with YOUR OWN private key values
# privateKey=[ [d],[p],[q] ]

# to make it faster: install (optional) Math::BigInt::GMP
# honestly, without GMP this is really slow

use Math::BigInt lib => 'GMP';

$privateKey=[
 [211146173,236796389,99054011,39430498,107502635,22100528,173332685,126067633,23490737,43112374,215603654,97763768,129307240,193500832,225995383,196217318,247811242,95758361,147],
 [79930095,201216333,170018212,115859736,10404795,32150654,210660423,132599055,204635034,14],
 [47716471,908384,204231222,108648834,118784602,25920125,261301885,215145545,83985924,11]];

# if you want a test phrase, decode this:
# aXCFtURf_XY1L2SUxHGfR"E5FAeq9E"OeFmfl7WlNO5It131"noEcl81_UxP
# BMN6siYz7M_B"vE4boCaLGzajxQhLrgyw37TGofQC2v5QYnLJfxpqWDlPgSy
# J6QCBZtKde5_jbIwgC5ipn42WgU6

$b64s='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_"';
{my $n=0; for (split(//,$b64s)) {$b64{$_}=$n++}}

$text=<<EOT;
aXCFtURf_XY1L2SUxHGfR"E5FAeq9E"OeFmfl7WlNO5It131"noEcl81_UxP
BMN6siYz7M_B"vE4boCaLGzajxQhLrgyw37TGofQC2v5QYnLJfxpqWDlPgSy
J6QCBZtKde5_jbIwgC5ipn42WgU6
EOT

print rsaDecode($privateKey, $text);

##################################################################

sub rc4 {
    my ($key, $string)=@_;
    #"""Return string rc4 (de/en)crypted with RC4."""
    my($i,$j,$klen,@s)=(0,0,length($key),0 .. 255);
    for(0 .. 1) {
     for $i (0 .. 255) {
        $j=(ord(substr($key,$i%$klen,1))+$s[$i]+$j)%256;
        ($s[$i],$s[$j])=($s[$j],$s[$i])
     }
    }
    my $r='';
    for $i (0 .. length($string)-1) {
        my $i2=$i % 256;
        $j=($s[$i2]+$j)%256;
        ($s[$i2],$s[$j])=($s[$j],$s[$i2]);
        $r.=chr(ord(substr($string,$i,1))^$s[($s[$i2]+$s[$j])%256]);
    }
    return $r;
}

sub crt_RSA {
     my ($m, $d, $p, $q)=@_;
     #""" Compute m**d mod p*q for RSA private key operations."""
     return $m->bmodpow($d,$p*$q);
}

sub base64ToText {
    my $text=shift;
    my ($r,$m,$a,$c)=('',0,0,0);
    for $i (0 .. length($text)-1) {
        $c=$b64{substr($text,$i,1)};
        #print substr($text,$i,1),"=$i=$c|\n";
        if(defined $c) {
             $r .= chr(($c << (8-$m))& 255 | $a) if $m;
             $a = $c >> $m;
             $m=($m+2) % 8;
        }
    }
    return $r;
}

sub t2b { my $s=shift;
    my $r=Math::BigInt->bzero();
    my $m=Math::BigInt->bone();
    for $i (0 .. length($s)-1) {
        $r+=$m*ord(substr($s,$i,1));
        $m*=256;
    }
    return $r
}

sub b2t { my $b=shift;
    my $r='';
    while($b) {
        $r.=chr($b % 256);
        $b/=256;
    }
    return $r;
}

sub fix { my $a=shift;
    my $r=Math::BigInt->bzero();
    my $s=0;
    for $i (@$a) {
        $r+=Math::BigInt->new($i) << $s;
        $s+=28;
    }
    return $r;
}

sub rsaDecode { my ($key,$text)=@_;
    #""" decode the text based on the given rsa key. """
    # separate the session key from the text
    $text=base64ToText($text);
    my $sessionKeyLength=ord(substr($text,0,1));
    my $sessionKeyEncryptedText=substr($text,1,$sessionKeyLength);
    $text=substr($text,$sessionKeyLength+1);
    my $sessionKeyEncrypted=t2b($sessionKeyEncryptedText);

    # un-rsa the session key
    my $sessionkey=crt_RSA($sessionKeyEncrypted,fix($key->[0]),fix($key->[1]),fix($key->[2]));
    $sessionkey=b2t($sessionkey);

    $text=rc4($sessionkey,$text);
    return $text
}
