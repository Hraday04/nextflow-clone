import {
  require_execAsync
} from "./chunk-UADPIGMO.mjs";
import {
  esm_exports,
  init_esm as init_esm2
} from "./chunk-CW33I5W4.mjs";
import {
  __commonJS,
  __name,
  __require,
  __toCommonJS,
  init_esm
} from "./chunk-O543HE5X.mjs";

// ../../../../../opt/homebrew/lib/node_modules/trigger.dev/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-win.js
var require_getMachineId_win = __commonJS({
  "../../../../../opt/homebrew/lib/node_modules/trigger.dev/node_modules/@opentelemetry/resources/build/src/detectors/platform/node/machine-id/getMachineId-win.js"(exports) {
    init_esm();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getMachineId = void 0;
    var process = __require("process");
    var execAsync_1 = require_execAsync();
    var api_1 = (init_esm2(), __toCommonJS(esm_exports));
    async function getMachineId() {
      const args = "QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid";
      let command = "%windir%\\System32\\REG.exe";
      if (process.arch === "ia32" && "PROCESSOR_ARCHITEW6432" in process.env) {
        command = "%windir%\\sysnative\\cmd.exe /c " + command;
      }
      try {
        const result = await (0, execAsync_1.execAsync)(`${command} ${args}`);
        const parts = result.stdout.split("REG_SZ");
        if (parts.length === 2) {
          return parts[1].trim();
        }
      } catch (e) {
        api_1.diag.debug(`error reading machine id: ${e}`);
      }
      return void 0;
    }
    __name(getMachineId, "getMachineId");
    exports.getMachineId = getMachineId;
  }
});
export default require_getMachineId_win();
//# sourceMappingURL=getMachineId-win-OPYP5OW5.mjs.map
