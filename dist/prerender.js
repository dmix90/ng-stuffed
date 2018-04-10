const puppeteer = require('puppeteer');
const express = require('express');
const minify = require('html-minifier').minify;
const { join, dirname } = require('path');
const { readFileSync, existsSync, writeFileSync, mkdirSync } = require('fs');

const port = 80;
const host = `http://localhost:${port}`;


let needToRender = ['about'];
let renderedPages = [];

const minifyParams = {
    html5: true,
    collapseWhitespace: true,
    minifyCSS: true,
    removeComments: true,
}

async function main() {
    const app = express();
    const index = await readFileSync(join(process.cwd(), 'client', 'index.html')).toString();

    app.use(express.static('client'));
    app.get('*', (req, res) => res.send(index));

    const server = app.listen(port, () => {
        console.log(`:::Express-Temp server is listening on port: ${port}:::`)
    })

    const browser = await puppeteer.launch({
        headless: true
    });
    console.log(':::Started Headless Chrome:::')

    const newPage = await browser.newPage();

    await newPage.goto(`${host}`);
    renderedPages.push({
        name: 'index', content: minify(await newPage.evaluate(() => document.documentElement.outerHTML), minifyParams)
    });

    for (let page of needToRender) {
        console.log(`:::Route to render -> ${page}`)
        await newPage.goto(`${host}/${page}`);
        const result = await newPage.evaluate(() => document.documentElement.outerHTML);
        renderedPages.push({ name: page, content: minify(result, minifyParams) });
    }

    for (let page of renderedPages) {
        console.log(`:::Writing rendered page to file -> ${page.name}.html`)
        const fileName = join(process.cwd(), 'client', page.name + '.html');
        const dir = dirname(fileName);
        await existsSync(dir) ? null : await mkdirSync(dir);
        await writeFileSync(fileName, page.content);
    }

    console.log(`:::Finished Rendering:::`);
    browser.close();
    server.close();
}
main()
    .catch(err => {
        console.error(`:::Error -> ${err} :::`);
        process.exit(1);
    });