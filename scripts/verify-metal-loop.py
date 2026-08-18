from PIL import Image,ImageChops,ImageStat
from pathlib import Path
import json
r=Path(__file__).parents[1]/'public/media/metal-fx'
n=['chromatic-circle-80.webp','chromatic-reflection-top-80.webp','chromatic-reflection-bottom-80.webp']
o=[]
for f in n:
 im=Image.open(r/f);a=[];d=[];c=int(getattr(im,'n_frames',1))
 for i in range(c):
  im.seek(i);x=im.convert('RGBA');a.append(Image.alpha_composite(Image.new('RGBA',x.size,(0,0,0,255)),x).convert('RGB'));d.append(im.info.get('duration'))
 def q(x,y):return sum(ImageStat.Stat(ImageChops.difference(x,y)).mean)/3
 v=[q(a[i],a[(i+1)%48]) for i in range(48)];m=sum(v)/48;z={'file':f,'frames':c,'duration':sorted(set(d)),'mean':m,'seam':v[-1],'ratio':v[-1]/m};o.append(z)
 if c!=48 or set(d)!={50} or z['ratio']>1.5:raise SystemExit(json.dumps(z))
print(json.dumps(o))
