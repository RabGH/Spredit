import { OutputData } from "@editorjs/editorjs";

export function jsonToOutputData(json: any): OutputData {
  if (
    json &&
    typeof json === "object" &&
    "time" in json &&
    "version" in json &&
    "blocks" in json
  ) {
    return json as OutputData;
  } else {
    return { time: Date.now(), version: "2.22.2", blocks: [] };
  }
}
