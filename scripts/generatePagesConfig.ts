import * as path from "path";
import * as fs from "fs";
import fetchAndTransformData from "./fetchAndTransformData";

fetchAndTransformData()
    .then(data => {
        const appDirectory = fs.realpathSync(process.cwd());
        const resolveApp = (relativePath: string) => path.resolve(appDirectory, relativePath);

        const filePath = resolveApp("pages-config.json");

        fs.writeFileSync(filePath, JSON.stringify(data));
    })
    .catch(e => {
        console.error("Failed to generate pages config..");
    });
