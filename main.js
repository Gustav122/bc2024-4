const http = require("http");
const { program } = require("commander");
const fs = require("fs").promises;
const path = require("path");
const superagent = require('superagent');

program
    .requiredOption("-H, --host <host>", "server host", "localhost")
    .requiredOption("-p, --port <port>", "server port", "3000")
    .requiredOption("-c, --cache <path>", "cache directory path", "./.cache")
    .parse(process.argv);

const { host, port, cache } = program.opts();
fs.mkdir(cache, { recursive: true });

const server = http.createServer(async (req, res) => {
    const code = req.url.slice(1);
    const filePath = path.join(cache, `${code}.jpg`);
    if (req.method === "GET") {
        try {
            const fileData = await fs.readFile(filePath);
            res.writeHead(200, { "Content-Type": "image/jpeg" });
            res.end(fileData);
        } catch (error) {
            try {
                const response = await superagent.get(
                    `https://http.cat/${code}`
                );
                console.log(
                    `Requested http.cat for image: ${code}`
                );
                await fs.writeFile(filePath, response.body);
                res.writeHead(200, { "Content-Type": "image/jpeg" });
                res.end(response.body);
            } catch (catErr) {
                console.error(`Помилка отримання з http.cat: ${catErr.message}`);
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not Found");
            }
        } 
    } else if (req.method === "PUT") {
      let data = [];
      req.on("data", (chunk) => {
          data.push(chunk);
      });
      req.on("end", async () => {
          const buffer = Buffer.concat(data);
          try {
              await fs.writeFile(filePath, buffer);
              res.writeHead(201, { "Content-Type": "text/plain" });
              res.end("File created/updated");
          } catch (error) {
              res.writeHead(500, { "Content-Type": "text/plain" });
              res.end("Server error");
          }
      });
  } 

});

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
    console.log(`Cache directory is set to: ${cache}`);
});
