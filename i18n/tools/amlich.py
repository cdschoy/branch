# Ho Ngoc Duc lunar calendar algorithm (Vietnam, UTC+7)
import math
PI=math.pi
def INT(d): return math.floor(d)
def jdFromDate(dd,mm,yy):
    a=INT((14-mm)/12); y=yy+4800-a; m=mm+12*a-3
    jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-INT(y/100)+INT(y/400)-32045
    if jd<2299161: jd=dd+INT((153*m+2)/5)+365*y+INT(y/4)-32083
    return jd
def jdToDate(jd):
    if jd>2299160:
        a=jd+32044; b=INT((4*a+3)/146097); c=a-INT((b*146097)/4)
    else:
        b=0; c=jd+32082
    d=INT((4*c+3)/1461); e=c-INT((1461*d)/4); m=INT((5*e+2)/153)
    day=e-INT((153*m+2)/5)+1; month=m+3-12*INT(m/10); year=b*100+d-4800+INT(m/10)
    return day,month,year
def NewMoon(k):
    T=k/1236.85; T2=T*T; T3=T2*T; dr=PI/180
    Jd1=2415020.75933+29.53058868*k+0.0001178*T2-0.000000155*T3
    Jd1+=0.00033*math.sin((166.56+132.87*T-0.009173*T2)*dr)
    M=359.2242+29.10535608*k-0.0000333*T2-0.00000347*T3
    Mpr=306.0253+385.81691806*k+0.0107306*T2+0.00001236*T3
    F=21.2964+390.67050646*k-0.0016528*T2-0.00000239*T3
    C1=(0.1734-0.000393*T)*math.sin(M*dr)+0.0021*math.sin(2*dr*M)
    C1-=0.4068*math.sin(Mpr*dr)-0.0161*math.sin(dr*2*Mpr)
    C1-=0.0004*math.sin(dr*3*Mpr)
    C1+=0.0104*math.sin(dr*2*F)-0.0051*math.sin(dr*(M+Mpr))
    C1-=0.0074*math.sin(dr*(M-Mpr))-0.0004*math.sin(dr*(2*F+M))
    C1-=0.0004*math.sin(dr*(2*F-M))-0.0006*math.sin(dr*(2*F+Mpr))
    C1+=0.0010*math.sin(dr*(2*F-Mpr))+0.0005*math.sin(dr*(2*Mpr+M))
    if T<-11: deltat=0.001+0.000839*T+0.0002261*T2-0.00000845*T3-0.000000081*T*T3
    else: deltat=-0.000278+0.000265*T+0.000262*T2
    return Jd1+C1-deltat
def SunLongitude(jdn):
    T=(jdn-2451545.0)/36525; T2=T*T; dr=PI/180
    M=357.52910+35999.05030*T-0.0001559*T2-0.00000048*T*T2
    L0=280.46645+36000.76983*T+0.0003032*T2
    DL=(1.914600-0.004817*T-0.000014*T2)*math.sin(dr*M)
    DL+=(0.019993-0.000101*T)*math.sin(dr*2*M)+0.000290*math.sin(dr*3*M)
    L=(L0+DL)*dr; L=L-PI*2*INT(L/(PI*2)); return L
def getSunLongitude(dayNumber,tz): return INT(SunLongitude(dayNumber-0.5-tz/24)/PI*6)
def getNewMoonDay(k,tz): return INT(NewMoon(k)+0.5+tz/24)
def getLunarMonth11(yy,tz):
    off=jdFromDate(31,12,yy)-2415021; k=INT(off/29.530588853)
    nm=getNewMoonDay(k,tz)
    if getSunLongitude(nm,tz)>=9: nm=getNewMoonDay(k-1,tz)
    return nm
def getLeapMonthOffset(a11,tz):
    k=INT((a11-2415021.076998695)/29.530588853+0.5); last=0; i=1
    arc=getSunLongitude(getNewMoonDay(k+i,tz),tz)
    while True:
        last=arc; i+=1; arc=getSunLongitude(getNewMoonDay(k+i,tz),tz)
        if not(arc!=last and i<14): break
    return i-1
def lunar2solar(ld,lm,ly,leap=0,tz=7):
    if lm<11: a11=getLunarMonth11(ly-1,tz); b11=getLunarMonth11(ly,tz)
    else: a11=getLunarMonth11(ly,tz); b11=getLunarMonth11(ly+1,tz)
    k=INT(0.5+(a11-2415021.076998695)/29.530588853); off=lm-11
    if off<0: off+=12
    if b11-a11>365:
        lo=getLeapMonthOffset(a11,tz); lmn=lo-2
        if lmn<0: lmn+=12
        if leap and lm!=lmn: return None
        elif leap or off>=lo: off+=1
    ms=getNewMoonDay(k+off,tz)
    return jdToDate(ms+ld-1)
if __name__=='__main__':
    for y in (2026,2027,2028):
        print(y,'Tet',lunar2solar(1,1,y),'ThatTich',lunar2solar(7,7,y),'TrungThu',lunar2solar(15,8,y),'GiaoThua(30/29 thang Chap)',jdToDate(jdFromDate(*lunar2solar(1,1,y))-1))
