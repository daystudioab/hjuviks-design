import asyncio
from playwright.async_api import async_playwright
from PIL import Image
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        bilder=[]
        pg = await b.new_page(viewport={'width':400,'height':560}, device_scale_factor=2)
        await pg.goto('file:///tmp/claude-0/-home-claude/511b5e71-0c3e-5e8b-9cd1-d10541ad5af7/scratchpad/karta/hjuviks-karta.svg')
        t0=0
        for t in [0.6,1.6,2.6,3.6,6.0]:
            await pg.wait_for_timeout(int((t-t0)*1000)); t0=t
            fn=f'f{t}.png'; await pg.screenshot(path=fn); bilder.append(fn)
        pg2 = await b.new_page(viewport={'width':400,'height':560}, device_scale_factor=2, reduced_motion='reduce')
        await pg2.goto('file:///tmp/claude-0/-home-claude/511b5e71-0c3e-5e8b-9cd1-d10541ad5af7/scratchpad/karta/hjuviks-karta.svg')
        await pg2.wait_for_timeout(500); await pg2.screenshot(path='rm.png'); bilder.append('rm.png')
        await b.close()
    ims=[Image.open(f).resize((400,560)) for f in bilder]
    W=Image.new('RGB',(400*len(ims)+10*(len(ims)-1),560),'#ccc')
    for i,im in enumerate(ims): W.paste(im,(i*410,0))
    W.save('sekvens.png')
asyncio.run(main())
