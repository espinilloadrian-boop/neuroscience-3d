// Inferencia inicial para dos grupos independientes.
// Welch no presupone igualdad de varianzas. No admite datos pareados, repetidos o agrupados.
function logGamma(z){const p=[676.5203681218851,-1259.1392167224028,771.3234287776531,-176.6150291621406,12.507343278686905,-.13857109526572012,9.984369578019572e-6,1.5056327351493116e-7];if(z<.5)return Math.log(Math.PI)-Math.log(Math.sin(Math.PI*z))-logGamma(1-z);z-=1;let x=.99999999999980993;for(let i=0;i<p.length;i++)x+=p[i]/(z+i+1);const t=z+p.length-.5;return .5*Math.log(2*Math.PI)+(z+.5)*Math.log(t)-t+Math.log(x);}
function betaFraction(a,b,x){const qab=a+b,qap=a+1,qam=a-1;let c=1,d=1-qab*x/qap;if(Math.abs(d)<1e-300)d=1e-300;d=1/d;let h=d;for(let m=1;m<=300;m++){const m2=2*m;let aa=m*(b-m)*x/((qam+m2)*(a+m2));d=1+aa*d;if(Math.abs(d)<1e-300)d=1e-300;c=1+aa/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;h*=d*c;aa=-(a+m)*(qab+m)*x/((a+m2)*(qap+m2));d=1+aa*d;if(Math.abs(d)<1e-300)d=1e-300;c=1+aa/c;if(Math.abs(c)<1e-300)c=1e-300;d=1/d;const del=d*c;h*=del;if(Math.abs(del-1)<3e-14)break;}return h;}
function regBeta(x,a,b){if(x<=0)return 0;if(x>=1)return 1;const bt=Math.exp(logGamma(a+b)-logGamma(a)-logGamma(b)+a*Math.log(x)+b*Math.log1p(-x));return x<(a+1)/(a+b+2)?bt*betaFraction(a,b,x)/a:1-bt*betaFraction(b,a,1-x)/b;}
function tCdf(t,df){const x=df/(df+t*t),tail=.5*regBeta(x,df/2,.5);return t>=0?1-tail:tail;}
function tQuantile(p,df){let lo=-100,hi=100;for(let i=0;i<100;i++){const mid=(lo+hi)/2;if(tCdf(mid,df)<p)lo=mid;else hi=mid;}return (lo+hi)/2;}
const clean=values=>values.filter(Number.isFinite);
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const variance=a=>{const m=mean(a);return a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1);};
export function welchTTest(groupA,groupB){
 const a=clean(groupA),b=clean(groupB),n1=a.length,n2=b.length;
 if(n1<2||n2<2)return {valid:false,reason:'Se requieren al menos dos observaciones válidas por grupo.',n1,n2};
 const m1=mean(a),m2=mean(b),v1=variance(a),v2=variance(b),difference=m2-m1;
 const se2=v1/n1+v2/n2;
 if(!Number.isFinite(se2)||se2<=0)return {valid:false,reason:'No se puede estimar el error estándar: variabilidad nula o datos insuficientes.',n1,n2};
 const df=se2*se2/((v1/n1)**2/(n1-1)+(v2/n2)**2/(n2-1));
 const se=Math.sqrt(se2),t=difference/se,p=Math.max(0,Math.min(1,2*(1-tCdf(Math.abs(t),df))));
 const critical=tQuantile(.975,df),ci:[number,number]=[difference-critical*se,difference+critical*se];
 const pooled=Math.sqrt(((n1-1)*v1+(n2-1)*v2)/(n1+n2-2));
 const d=pooled>0?difference/pooled:null,J=1-3/(4*(n1+n2-2)-1),g=d===null?null:J*d;
 const gSe=d===null?null:Math.sqrt((n1+n2)/(n1*n2)+d*d/(2*(n1+n2-2)))*J;
 return {valid:true,n1,n2,meanA:m1,meanB:m2,sdA:Math.sqrt(v1),sdB:Math.sqrt(v2),difference,se,df,t,p,ci95:ci,hedgesG:g,hedgesGCi95:gSe===null?null:[g-1.96*gSe,g+1.96*gSe],method:'t de Welch bilateral',direction:difference>0?'Grupo B > Grupo A':difference<0?'Grupo B < Grupo A':'Medias iguales'};
}
export function compareIndependentGroups(rows,{groupField,outcomeField,groupA,groupB}={}){
 if(!groupField||!outcomeField||groupA===undefined||groupB===undefined||groupA===groupB)return {valid:false,reason:'Seleccioná dos grupos distintos y las variables correspondientes.'};
 const a=[],b=[];let excluded=0;
 for(const row of rows){const value=row[outcomeField];if(row[groupField]===groupA){if(Number.isFinite(value))a.push(value);else excluded++;}else if(row[groupField]===groupB){if(Number.isFinite(value))b.push(value);else excluded++;}}
 return {...welchTTest(a,b),groupA,groupB,excludedMissingOrInvalid:excluded};
}
