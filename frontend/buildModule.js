const fs = require('fs/promises');
const {exec} = require('child_process');

function cmd(command) {
    return new Promise((resolve, reject) => {
        console.log(command);
        const proc = exec(command);
        proc.stdout.on('data', function (data) {process.stdout.write(data)});
        proc.stderr.on('data', function (data) {process.stderr.write(data)});
        proc.on('exit', function (code) {code === 0 ? resolve(0) : reject(code)});
    });
}

(async () => {
    // if exists, remove './lib/dist' folder
    await fs.rm('./lib/dist', {
        force: true,
        recursive: true,
    });
    // compile js/jsx files
    await cmd("npx babel src/ --out-dir lib/dist");
})()