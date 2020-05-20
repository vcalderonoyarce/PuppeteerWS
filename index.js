const httpProxy = require("http-proxy");
const puppeteer = require('puppeteer');
const program = require('commander');
const colors = require('colors');

program.version('1.0');

program
  .option('-h, --host [string]', 'Indica el host del WS')
  .option('-p, --port [int]', 'Indica el puerto del WS')
  .option('-n, --nonheadless', 'Indica si el proceso será en modo headless')
  ;
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
      program.nonheadless ? null : '--disable-canvas-aa',
      program.nonheadless ? null : '--disable-2d-canvas-clip-aa',
      program.nonheadless ? null : '--disable-gl-drawing-for-tests',
      program.nonheadless ? null : '--disable-dev-shm-usage',
      program.nonheadless ? null : '--no-zygote',
      program.nonheadless ? null : '--use-gl=swiftshader',
      program.nonheadless ? null : '--enable-webgl',
      program.nonheadless ? null : '--hide-scrollbars',
      program.nonheadless ? null : '--mute-audio',
      program.nonheadless ? null : '--no-first-run',
      program.nonheadless ? null : '--disable-infobars',
      program.nonheadless ? null : '--disable-breakpad',

      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1200,720',
      '--disk-cache-dir=./tmp/browser-cache-disk'
    ];
    browser = await puppeteer.launch({
      headless            :  !program.nonheadless,
      slowMo              :  50,
      args                :  args.filter(function (el) {return el != null;}),
      ignoreHTTPSErrors   :  true,
      timeout             :  0,
    });

    const pagesCount = (await browser.pages()).length; // just to make sure we have the same stuff on both place
    const browserWSEndpoint = await browser.wsEndpoint();
    const customWSEndpoint = await createServer(browserWSEndpoint, host, port); // create the server here
    console.log('Servidor levantado correctamente'.bold.green);
    console.log('ID del proceso     : '+colors.green(browser.process().pid));
    console.log('Versión            : '+colors.green(program.version()));
    console.log('browserWSEndpoint  : '+browserWSEndpoint.green);
    console.log('customWSEndpoint   : '+customWSEndpoint.green);

  } catch (e) {
    console.log('No se pudo levantar el servicio de Puppeteer'.red);
    console.log(e);
  }
};

main();
