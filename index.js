const httpProxy = require("http-proxy");
const puppeteer = require('puppeteer');
const program = require('commander');
const colors = require('colors');

program.version('1.0');

program.option('-h, --host [string]', 'Indica el host del WS').option('-p, --port [int]', 'Indica el puerto del WS');
program.parse(process.argv);

const host = typeof program.host == 'undefined' ? "0.0.0.0" : program.host;
const port = typeof program.port == 'undefined' ? 8080 : parseInt(program.port);

async function createServer(WSEndPoint, host, port) {
  await httpProxy
    .createServer({
      target: WSEndPoint, // where we are connecting
      ws: true,
      localAddress: host // where to bind the proxy
    })
    .listen(port); // which port the proxy should listen to
  return `ws://${host}:${port}`; // ie: ws://123.123.123.123:8080
}


const main = async (callback = null) => {
  try {
    var args = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1024,768',
      '--disk-cache-dir=./tmp/browser-cache-disk'
    ];
    browser = await puppeteer.launch({
      headless            :  true,
      slowMo              :  50,
      args                :  args,
      ignoreHTTPSErrors   :  true,
      timeout             :  0,
    });

    const pagesCount = (await browser.pages()).length; // just to make sure we have the same stuff on both place
    const browserWSEndpoint = await browser.wsEndpoint();
    const customWSEndpoint = await createServer(browserWSEndpoint, host, port); // create the server here
    console.log({
        browserWSEndpoint,
        customWSEndpoint,
        pagesCount
      }
    );

  } catch (e) {
    console.log('No se pudo levantar el servicio de Puppeteer'.red);
  }
};

main();
