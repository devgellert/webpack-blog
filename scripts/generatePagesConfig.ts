import * as path from "path";
import * as fs from "fs";
import fetchAndTransformData from "./fetchAndTransformData";

fetchAndTransformData().then(data => {
    const filePath = path.resolve(__dirname, "../pages-config.json")

    fs.writeFileSync(filePath, JSON.stringify(data));
})
.catch(e => {
    console.error("Failed to generate pages config..", e);
});